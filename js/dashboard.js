// JavaScript Logic for Student and Owner Dashboards

const rkDashboard = {
    user: null,

    init: function() {
        this.checkAuth();
        this.setupSidebarNavigation();
        this.listenAuthChanges();
    },

    checkAuth: function() {
        const user = authService.getUser();
        if (!user) {
            // Wait 1 second in case auth state is loading
            setTimeout(() => {
                const retryUser = authService.getUser();
                if (!retryUser) {
                    window.location.href = "login.html";
                } else {
                    this.user = retryUser;
                    this.loadDashboardData();
                }
            }, 1000);
        } else {
            this.user = user;
            this.loadDashboardData();
        }
    },

    listenAuthChanges: function() {
        document.addEventListener('rk_auth_state_changed', (e) => {
            this.user = e.detail;
            if (!this.user) {
                window.location.href = "login.html";
            } else {
                this.loadDashboardData();
            }
        });
    },

    setupSidebarNavigation: function() {
        const navLinks = document.querySelectorAll('.dashboard-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSectionId = link.dataset.section;
                if (!targetSectionId) return;

                // Toggle navbar classes
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Toggle sections visibility
                const sections = document.querySelectorAll('.dashboard-section');
                sections.forEach(sec => sec.classList.remove('active'));

                const targetSec = document.getElementById(targetSectionId);
                if (targetSec) targetSec.classList.add('active');
            });
        });

        // Logout action trigger
        const logoutBtn = document.getElementById('dashboardLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                authService.logout().then(() => {
                    window.location.href = "index.html";
                });
            });
        }
    },

    loadDashboardData: function() {
        if (!this.user) return;

        // Render general profile fields
        const nameFields = document.querySelectorAll('.db-user-name');
        const emailFields = document.querySelectorAll('.db-user-email');
        const phoneFields = document.querySelectorAll('.db-user-phone');
        const roleFields = document.querySelectorAll('.db-user-role');
        const collegeFields = document.querySelectorAll('.db-user-college');

        nameFields.forEach(f => f.textContent = this.user.name);
        emailFields.forEach(f => f.textContent = this.user.email);
        phoneFields.forEach(f => f.textContent = this.user.phone || "Not set");
        roleFields.forEach(f => f.textContent = this.user.role === 'student' ? 'Student Tenant' : 'Property Owner');
        
        collegeFields.forEach(f => {
            if (this.user.role === 'student') {
                f.textContent = this.user.college || "Not set";
            }
        });

        // Render avatars (initials)
        const initials = this.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2);
        const avatars = document.querySelectorAll('.user-avatar');
        avatars.forEach(av => av.textContent = initials);

        // Membership Status Indicator
        const planText = document.getElementById('dbMembershipPlan');
        const upgradeBanner = document.getElementById('dbUpgradePromoBanner');
        if (planText) {
            const isPremium = authService.isPremium();
            planText.textContent = isPremium ? "Premium (Anti-Brokerage Active)" : "Free Plan";
            planText.style.color = isPremium ? "var(--gold-light)" : "var(--gray)";
            
            if (upgradeBanner) {
                upgradeBanner.style.display = isPremium ? 'none' : 'block';
            }
        }

        // Render role-specific components
        if (this.user.role === 'student') {
            this.loadStudentData();
        } else if (this.user.role === 'owner') {
            this.loadOwnerData();
        }
    },

    /* ==================== STUDENT DASHBOARD ==================== */
    loadStudentData: function() {
        this.renderSavedProperties();
        this.renderServiceRequests();
        this.setupStudentProfileEditForm();
    },

    renderSavedProperties: function() {
        const grid = document.getElementById('dbSavedPropertiesGrid');
        if (!grid) return;

        const allProps = mockDb.get('properties') || [];
        const savedIds = this.user.savedProperties || [];
        const savedListings = allProps.filter(p => savedIds.includes(p.id));

        const savedCountText = document.getElementById('dbSavedCountText');
        if (savedCountText) savedCountText.textContent = savedListings.length;

        if (savedListings.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-dark); border-radius: var(--radius);">
                    <p style="color: var(--gray);">You haven't bookmarked any PG or Hostel listings yet.</p>
                    <a href="students-hub.html" class="btn btn-secondary btn-sm" style="margin-top: 15px; display: inline-block;">Browse Student Hub</a>
                </div>
            `;
            return;
        }

        const isPremium = authService.isPremium();

        grid.innerHTML = savedListings.map(prop => `
            <div class="student-card" style="background: var(--sidebar-bg); border: 1px solid var(--border-dark);">
                <div class="student-card-img-wrapper" style="height: 160px;">
                    <img src="${prop.photos[0]}" alt="${prop.name}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div style="padding: 16px;">
                    <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--white); margin-bottom: 6px;">${prop.name}</h4>
                    <p style="font-size: 0.85rem; color: var(--gray); margin-bottom: 12px;">📍 ${prop.locality}</p>
                    
                    ${isPremium ? `
                        <div style="font-size: 0.8rem; background: rgba(85,239,196,0.1); border: 1px solid var(--accent-green); padding: 8px; border-radius: 4px; margin-bottom: 12px; color: var(--accent-green);">
                            📞 Owner Contact: <strong>${prop.ownerContact.phone}</strong>
                        </div>
                    ` : `
                        <div style="font-size: 0.8rem; border: 1px dashed var(--gold); padding: 8px; border-radius: 4px; text-align: center; margin-bottom: 12px;">
                            🔒 Owner Contact Locked
                        </div>
                    `}

                    <div style="display: flex; gap: 8px;">
                        <button onclick="studentHub.openPropertyModal('${prop.id}')" class="btn btn-outline btn-sm" style="flex:1; font-size:0.75rem; padding: 6px;">Details</button>
                        <button onclick="rkDashboard.removeSavedProperty('${prop.id}')" class="btn btn-outline btn-sm" style="border-color: var(--accent-red); color: var(--accent-red); font-size:0.75rem; padding: 6px;">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    removeSavedProperty: function(propertyId) {
        authService.toggleSaveProperty(propertyId);
        if (typeof showToast !== 'undefined') showToast("Removed from bookmarks.", "info");
        this.renderSavedProperties();
    },

    renderServiceRequests: function() {
        const container = document.getElementById('dbServiceRequestsList');
        if (!container) return;

        const requests = this.user.serviceRequests || [];
        const reqCountText = document.getElementById('dbRequestsCountText');
        if (reqCountText) reqCountText.textContent = requests.length;

        if (requests.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-dark); border-radius: var(--radius);">
                    <p style="color: var(--gray);">No digital legal assistance requests filed yet.</p>
                    <a href="legal-services.html" class="btn btn-secondary btn-sm" style="margin-top: 15px; display: inline-block;">Get Legal Services</a>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(req => {
            const dateStr = new Date(req.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            let svcName = "Legal Service Request";
            if (req.serviceType === 'police_verification') svcName = "Police Verification Help";
            if (req.serviceType === 'rent_agreement') svcName = "Notarized Rent Agreement";
            if (req.serviceType === 'notary') svcName = "Notary Attestation Service";

            const statusClass = req.status === 'completed' ? 'completed' : 'pending';
            const statusLabel = req.status === 'completed' ? 'Completed' : 'Pending Verification';

            return `
                <div class="tracking-item">
                    <div class="tracking-info">
                        <h5>${svcName}</h5>
                        <p>Req ID: ${req.requestId} • Filed on: ${dateStr}</p>
                        <p style="font-size: 0.8rem; color: var(--gold-light); margin-top: 4px;">💳 Paid Amount: ₹${req.amount} (Txn: ${req.paymentId})</p>
                    </div>
                    <span class="tracking-status ${statusClass}">${statusLabel}</span>
                </div>
            `;
        }).join('');
    },

    setupStudentProfileEditForm: function() {
        const form = document.getElementById('dbStudentProfileForm');
        if (!form) return;

        // Prepopulate values
        document.getElementById('dbStudentEditName').value = this.user.name;
        document.getElementById('dbStudentEditPhone').value = this.user.phone || "";
        document.getElementById('dbStudentEditCollege').value = this.user.college || "";

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('dbStudentEditName').value;
            const newPhone = document.getElementById('dbStudentEditPhone').value;
            const newCollege = document.getElementById('dbStudentEditCollege').value;

            this.user.name = newName;
            this.user.phone = newPhone;
            this.user.college = newCollege;

            // Save to database
            if (isFirebaseConnected) {
                db.collection("users").doc(this.user.uid).update({
                    name: newName,
                    phone: newPhone,
                    college: newCollege
                }).then(() => {
                    if (typeof showToast !== 'undefined') showToast("Profile updated successfully!", "success");
                    this.loadDashboardData();
                });
            } else {
                const users = mockDb.get('users') || [];
                const idx = users.findIndex(u => u.uid === this.user.uid);
                if (idx !== -1) {
                    users[idx].name = newName;
                    users[idx].phone = newPhone;
                    users[idx].college = newCollege;
                    mockDb.set('users', users);
                }
                mockDb.set('currentUser', this.user);
                if (typeof showToast !== 'undefined') showToast("Profile updated (Demo Mode)!", "success");
                this.loadDashboardData();
            }
        });
    },

    /* ==================== OWNER DASHBOARD ==================== */
    loadOwnerData: function() {
        this.renderOwnerListings();
        this.setupOwnerPropertyUploadForm();
    },

    renderOwnerListings: function() {
        const tableBody = document.getElementById('dbOwnerListingsTableBody');
        const container = document.getElementById('dbOwnerListingsList');
        if (!tableBody && !container) return;

        const allProps = mockDb.get('properties') || [];
        // Filters owner's listings (uses user.uid as ownerId, in mock fallback if user doesn't have custom properties, we associate mock properties with user)
        let ownerProps = allProps.filter(p => p.ownerId === this.user.uid);

        // For demo fallback, if owner has no properties yet, assign them some mock properties to manage
        if (ownerProps.length === 0) {
            ownerProps = allProps.slice(0, 2).map(p => {
                p.ownerId = this.user.uid;
                return p;
            });
            mockDb.set('properties', allProps);
        }

        const listingsCountText = document.getElementById('dbOwnerListingsCount');
        if (listingsCountText) listingsCountText.textContent = ownerProps.length;

        // Compute simulated stats
        const totalViewsText = document.getElementById('dbOwnerTotalViews');
        if (totalViewsText) totalViewsText.textContent = (ownerProps.length * 142).toLocaleString();

        const inquiriesText = document.getElementById('dbOwnerInquiries');
        if (inquiriesText) inquiriesText.textContent = ownerProps.length * 3;

        if (ownerProps.length === 0) {
            if (container) {
                container.innerHTML = `<p style="color: var(--gray); text-align: center; padding: 30px;">You have not uploaded any property listings yet.</p>`;
            }
            return;
        }

        if (tableBody) {
            tableBody.innerHTML = ownerProps.map(prop => `
                <tr>
                    <td style="font-weight: 700; color: var(--white);">${prop.name}</td>
                    <td>${prop.type.toUpperCase()} • ${prop.gender.toUpperCase()}</td>
                    <td>₹${prop.priceMin.toLocaleString()} - ₹${prop.priceMax.toLocaleString()}</td>
                    <td>
                        <span class="tracking-status ${prop.isVerified ? 'completed' : 'pending'}" style="font-size:0.75rem; padding: 4px 8px;">
                            ${prop.isVerified ? 'Verified' : 'Pending'}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="rkDashboard.togglePropertyAvailability('${prop.id}')" class="btn btn-outline btn-sm" style="font-size:0.75rem; padding: 4px 8px; color: ${prop.isAvailable ? 'var(--accent-red)' : 'var(--accent-green)'}; border-color: ${prop.isAvailable ? 'var(--accent-red)' : 'var(--accent-green)'};">
                                ${prop.isAvailable ? 'Pause' : 'Activate'}
                            </button>
                            <button onclick="rkDashboard.deleteProperty('${prop.id}')" class="btn btn-outline btn-sm" style="font-size:0.75rem; padding: 4px 8px; border-color: var(--accent-red); color: var(--accent-red);">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    togglePropertyAvailability: function(propertyId) {
        const allProps = mockDb.get('properties') || [];
        const prop = allProps.find(p => p.id === propertyId);
        if (prop) {
            prop.isAvailable = !prop.isAvailable;
            mockDb.set('properties', allProps);
            if (typeof showToast !== 'undefined') {
                showToast(prop.isAvailable ? "Property listing activated!" : "Property listing paused.", "info");
            }
            this.renderOwnerListings();
        }
    },

    deleteProperty: function(propertyId) {
        if (!confirm("Are you sure you want to permanently delete this property listing?")) return;

        const allProps = mockDb.get('properties') || [];
        const filtered = allProps.filter(p => p.id !== propertyId);
        mockDb.set('properties', filtered);
        
        if (typeof showToast !== 'undefined') showToast("Property listing deleted.", "success");
        this.renderOwnerListings();
    },

    setupOwnerPropertyUploadForm: function() {
        const form = document.getElementById('dbAddPropertyForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract details from form
            const propName = document.getElementById('propUploadName').value;
            const propType = document.getElementById('propUploadType').value;
            const propGender = document.getElementById('propUploadGender').value;
            const propLocality = document.getElementById('propUploadLocality').value;
            const propPincode = document.getElementById('propUploadPincode').value;
            const propPriceMin = parseInt(document.getElementById('propUploadPriceMin').value);
            const propPriceMax = parseInt(document.getElementById('propUploadPriceMax').value);
            const propDeposit = parseInt(document.getElementById('propUploadDeposit').value);

            // Amenities checkboxes
            const wifi = document.getElementById('propWifi').checked;
            const food = document.getElementById('propFood').checked;
            const ac = document.getElementById('propAC').checked;
            const laundry = document.getElementById('propLaundry').checked;
            const gym = document.getElementById('propGym').checked;
            const parking = document.getElementById('propParking').checked;

            const photoUrl = document.getElementById('propUploadPhotoUrl').value || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";

            const newProperty = {
                id: 'prop_' + Math.random().toString(36).substr(2, 9),
                ownerId: this.user.uid,
                name: propName,
                type: propType,
                gender: propGender,
                locality: propLocality,
                city: "Delhi",
                pincode: propPincode,
                priceMin: propPriceMin,
                priceMax: propPriceMax,
                securityDeposit: propDeposit,
                amenities: { wifi, food, ac, laundry, gym, parking },
                photos: [photoUrl],
                ownerContact: {
                    phone: this.user.phone || "+91 78388 25736",
                    email: this.user.email
                },
                isVerified: false,
                isAvailable: true,
                createdAt: new Date().toISOString()
            };

            // Save property
            if (isFirebaseConnected) {
                db.collection("properties").doc(newProperty.id).set(newProperty).then(() => {
                    if (typeof showToast !== 'undefined') showToast("Property listing uploaded successfully!", "success");
                    form.reset();
                    // Go to active listings tab
                    document.querySelector('.dashboard-nav-link[data-section="owner-listings"]').click();
                    this.loadOwnerData();
                });
            } else {
                const allProps = mockDb.get('properties') || [];
                allProps.unshift(newProperty);
                mockDb.set('properties', allProps);

                if (typeof showToast !== 'undefined') showToast("Property listing uploaded successfully (Demo Mode)!", "success");
                form.reset();
                // Go to listings view
                document.querySelector('.dashboard-nav-link[data-section="owner-listings"]').click();
                this.loadOwnerData();
            }
        });
    }
};

// Initialize Dashboards on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on student dashboard or owner dashboard pages
    if (document.getElementById('dbSavedPropertiesGrid') || document.getElementById('dbOwnerListingsTableBody')) {
        rkDashboard.init();
    }
});
