// Authentication Logic for Rama Krishna Properties (Firebase + Mock Fallback)

const authService = {
    // Current user state
    currentUser: null,

    init: function() {
        if (isFirebaseConnected) {
            // Firebase Auth State Listener
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    // Fetch user details from Firestore
                    const userDoc = await db.collection("users").doc(user.uid).get();
                    if (userDoc.exists) {
                        this.currentUser = { uid: user.uid, ...userDoc.data() };
                    } else {
                        // Create basic profile if Firestore doc doesn't exist
                        const basicProfile = {
                            email: user.email,
                            name: user.displayName || user.email.split('@')[0],
                            role: "student",
                            membership: { plan: "free", expiresAt: null },
                            createdAt: new Date().toISOString()
                        };
                        await db.collection("users").doc(user.uid).set(basicProfile);
                        this.currentUser = { uid: user.uid, ...basicProfile };
                    }
                } else {
                    this.currentUser = null;
                }
                this.dispatchAuthStateChange();
            });
        } else {
            // Fallback LocalStorage Auth
            const savedUser = mockDb.get('currentUser');
            if (savedUser) {
                this.currentUser = savedUser;
            }
            this.dispatchAuthStateChange();
        }
    },

    dispatchAuthStateChange: function() {
        // Dispatch custom event for dashboard/ui update
        const event = new CustomEvent('rk_auth_state_changed', { detail: this.currentUser });
        document.dispatchEvent(event);
    },

    getUser: function() {
        return this.currentUser;
    },

    isLoggedIn: function() {
        return this.currentUser !== null;
    },

    isStudent: function() {
        return this.currentUser && this.currentUser.role === 'student';
    },

    isOwner: function() {
        return this.currentUser && this.currentUser.role === 'owner';
    },

    isPremium: function() {
        if (!this.currentUser) return false;
        if (!this.currentUser.membership) return false;
        if (this.currentUser.membership.plan === 'premium') {
            // Check expiry date
            if (!this.currentUser.membership.expiresAt) return true; // Lifetime or unset
            const expires = new Date(this.currentUser.membership.expiresAt);
            return expires > new Date();
        }
        return false;
    },

    login: async function(email, password) {
        if (isFirebaseConnected) {
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const userDoc = await db.collection("users").doc(userCredential.user.uid).get();
                this.currentUser = { uid: userCredential.user.uid, ...userDoc.data() };
                this.dispatchAuthStateChange();
                return { success: true, user: this.currentUser };
            } catch (error) {
                console.error("Firebase Login Error:", error);
                return { success: false, error: error.message };
            }
        } else {
            // Fallback LocalStorage Auth lookup
            const users = mockDb.get('users') || [];
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (user) {
                // Remove password from memory state
                const userSession = { ...user };
                delete userSession.password;
                this.currentUser = userSession;
                mockDb.set('currentUser', userSession);
                this.dispatchAuthStateChange();
                return { success: true, user: userSession };
            } else {
                return { success: false, error: "Invalid email or password." };
            }
        }
    },

    register: async function(data) {
        if (isFirebaseConnected) {
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(data.email, data.password);
                const userProfile = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    role: data.role,
                    college: data.college || "",
                    createdAt: new Date().toISOString(),
                    membership: { plan: "free", expiresAt: null },
                    savedProperties: [],
                    serviceRequests: []
                };
                await db.collection("users").doc(userCredential.user.uid).set(userProfile);
                this.currentUser = { uid: userCredential.user.uid, ...userProfile };
                this.dispatchAuthStateChange();
                return { success: true, user: this.currentUser };
            } catch (error) {
                console.error("Firebase Registration Error:", error);
                return { success: false, error: error.message };
            }
        } else {
            // Fallback LocalStorage Auth registration
            const users = mockDb.get('users') || [];
            if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
                return { success: false, error: "Email address is already registered." };
            }

            const uid = 'usr_' + Math.random().toString(36).substr(2, 9);
            const newProfile = {
                uid: uid,
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: data.role,
                college: data.college || "",
                password: data.password, // Only in mock fallback
                createdAt: new Date().toISOString(),
                membership: { plan: "free", expiresAt: null },
                savedProperties: [],
                serviceRequests: []
            };

            users.push(newProfile);
            mockDb.set('users', users);

            // Set current session
            const userSession = { ...newProfile };
            delete userSession.password;
            this.currentUser = userSession;
            mockDb.set('currentUser', userSession);
            this.dispatchAuthStateChange();
            return { success: true, user: userSession };
        }
    },

    logout: async function() {
        if (isFirebaseConnected) {
            await auth.signOut();
        }
        this.currentUser = null;
        localStorage.removeItem('rk_currentUser');
        this.dispatchAuthStateChange();
        return { success: true };
    },

    // Upgrade current user to premium
    upgradeToPremium: function(paymentId) {
        if (!this.currentUser) return false;
        
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1-year membership

        const updatedMembership = {
            plan: "premium",
            expiresAt: expiresAt.toISOString(),
            paymentId: paymentId
        };

        this.currentUser.membership = updatedMembership;

        if (isFirebaseConnected) {
            db.collection("users").doc(this.currentUser.uid).update({
                membership: updatedMembership
            }).catch(err => console.error("Firestore update failed:", err));
        } else {
            // Update in mockDB
            const users = mockDb.get('users') || [];
            const idx = users.findIndex(u => u.uid === this.currentUser.uid);
            if (idx !== -1) {
                users[idx].membership = updatedMembership;
                mockDb.set('users', users);
            }
            mockDb.set('currentUser', this.currentUser);
        }
        this.dispatchAuthStateChange();
        return true;
    },

    // Save/unsave properties
    toggleSaveProperty: function(propertyId) {
        if (!this.currentUser) return false;
        
        if (!this.currentUser.savedProperties) {
            this.currentUser.savedProperties = [];
        }

        const idx = this.currentUser.savedProperties.indexOf(propertyId);
        let saved = false;

        if (idx === -1) {
            this.currentUser.savedProperties.push(propertyId);
            saved = true;
        } else {
            this.currentUser.savedProperties.splice(idx, 1);
        }

        if (isFirebaseConnected) {
            db.collection("users").doc(this.currentUser.uid).update({
                savedProperties: this.currentUser.savedProperties
            }).catch(err => console.error("Firestore update failed:", err));
        } else {
            // Update mockDB
            const users = mockDb.get('users') || [];
            const userIdx = users.findIndex(u => u.uid === this.currentUser.uid);
            if (userIdx !== -1) {
                users[userIdx].savedProperties = this.currentUser.savedProperties;
                mockDb.set('users', users);
            }
            mockDb.set('currentUser', this.currentUser);
        }
        this.dispatchAuthStateChange();
        return saved;
    },

    // Request service (Police verify, rent agreement, etc.)
    requestService: function(serviceType, details, amount, paymentId) {
        if (!this.currentUser) return false;
        
        const newRequest = {
            requestId: 'req_' + Math.random().toString(36).substr(2, 9),
            userId: this.currentUser.uid,
            serviceType: serviceType, // 'police_verification' | 'rent_agreement' | 'notary'
            details: details,
            amount: amount,
            paymentId: paymentId,
            status: "pending",
            createdAt: new Date().toISOString()
        };

        if (!this.currentUser.serviceRequests) {
            this.currentUser.serviceRequests = [];
        }
        this.currentUser.serviceRequests.push(newRequest);

        if (isFirebaseConnected) {
            db.collection("serviceRequests").doc(newRequest.requestId).set(newRequest)
                .catch(err => console.error("Firestore request save failed:", err));
            
            db.collection("users").doc(this.currentUser.uid).update({
                serviceRequests: this.currentUser.serviceRequests
            }).catch(err => console.error("Firestore user requests update failed:", err));
        } else {
            // Update in mockDB
            const requests = mockDb.get('serviceRequests') || [];
            requests.push(newRequest);
            mockDb.set('serviceRequests', requests);

            const users = mockDb.get('users') || [];
            const userIdx = users.findIndex(u => u.uid === this.currentUser.uid);
            if (userIdx !== -1) {
                users[userIdx].serviceRequests = this.currentUser.serviceRequests;
                mockDb.set('users', users);
            }
            mockDb.set('currentUser', this.currentUser);
        }
        this.dispatchAuthStateChange();
        return newRequest;
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    authService.init();
});
