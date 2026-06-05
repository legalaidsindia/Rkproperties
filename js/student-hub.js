// JavaScript Logic for RK Student Hub

const studentHub = {
    properties: [],
    filters: {
        search: "",
        type: "all",
        gender: "all",
        budget: 25000,
        amenities: {
            wifi: false,
            food: false,
            ac: false,
            laundry: false,
            gym: false,
            parking: false
        }
    },

    init: function() {
        this.loadProperties();
        this.setupEventListeners();
        this.renderListings();
        this.updateStats();
    },

    loadProperties: function() {
        if (isFirebaseConnected) {
            // Real Firebase loading logic
            db.collection("properties").where("isAvailable", "==", true).get()
                .then(snapshot => {
                    this.properties = [];
                    snapshot.forEach(doc => {
                        this.properties.push({ id: doc.id, ...doc.data() });
                    });
                    this.renderListings();
                })
                .catch(err => {
                    console.error("Firebase properties fetch error, falling back to mockDb:", err);
                    this.properties = mockDb.get('properties') || [];
                });
        } else {
            this.properties = mockDb.get('properties') || [];
        }
    },

    setupEventListeners: function() {
        // Search Input
        const searchInput = document.getElementById('hubSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.renderListings();
            });
        }

        // Search Type Selector Tabs
        const tabButtons = document.querySelectorAll('.search-hub-tab');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filters.type = btn.dataset.type;
                this.renderListings();
            });
        });

        // Gender Filters (Pills)
        const genderPills = document.querySelectorAll('.filter-gender-pill');
        genderPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                genderPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.filters.gender = pill.dataset.gender;
                this.renderListings();
            });
        });

        // Budget Slider
        const budgetSlider = document.getElementById('budgetSlider');
        const budgetVal = document.getElementById('budgetValText');
        if (budgetSlider) {
            budgetSlider.addEventListener('input', (e) => {
                this.filters.budget = parseInt(e.target.value);
                if (budgetVal) budgetVal.textContent = `₹${this.filters.budget.toLocaleString()}`;
                this.renderListings();
            });
        }

        // Amenities Checkboxes
        const amenityChecks = document.querySelectorAll('.amenity-checkbox');
        amenityChecks.forEach(chk => {
            chk.addEventListener('change', (e) => {
                this.filters.amenities[chk.dataset.amenity] = chk.checked;
                this.renderListings();
            });
        });

        // Advanced Filter Panel Toggle
        const filterToggleBtn = document.getElementById('advancedFilterToggle');
        const filterPanel = document.getElementById('advancedFiltersPanel');
        if (filterToggleBtn && filterPanel) {
            filterToggleBtn.addEventListener('click', () => {
                filterPanel.classList.toggle('active');
                filterToggleBtn.innerHTML = filterPanel.classList.contains('active')
                    ? `Hide Filters <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>`
                    : `More Filters <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            });
        }

        // Listen for Authentication state changes
        document.addEventListener('rk_auth_state_changed', () => {
            this.renderListings();
            this.updateStats();
        });
    },

    updateStats: function() {
        const countText = document.getElementById('listingsCountText');
        if (countText) {
            const filtered = this.getFilteredProperties();
            countText.textContent = `${filtered.length} Properties found`;
        }
    },

    getFilteredProperties: function() {
        return this.properties.filter(prop => {
            // Text Search (Title or Locality)
            const matchesSearch = prop.name.toLowerCase().includes(this.filters.search) ||
                                 prop.locality.toLowerCase().includes(this.filters.search);
            
            // Property Type
            const matchesType = this.filters.type === 'all' || prop.type === this.filters.type;
            
            // Gender Profile
            const matchesGender = this.filters.gender === 'all' || prop.gender === this.filters.gender;
            
            // Price Budget
            const matchesBudget = prop.priceMin <= this.filters.budget;

            // Amenities
            let matchesAmenities = true;
            for (const [amenity, required] of Object.entries(this.filters.amenities)) {
                if (required && !prop.amenities[amenity]) {
                    matchesAmenities = false;
                    break;
                }
            }

            return matchesSearch && matchesType && matchesGender && matchesBudget && matchesAmenities;
        });
    },

    renderListings: function() {
        const grid = document.getElementById('studentPropertiesGrid');
        if (!grid) return;

        const filtered = this.getFilteredProperties();
        this.updateStats();

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); border: 1px dashed var(--gray-light);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" stroke-width="1.5" style="margin-bottom: 16px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <h3 style="color: var(--primary); font-weight: 700; margin-bottom: 8px;">No Properties Match Your Filters</h3>
                    <p style="color: var(--text-light);">Try widening your budget, changing the location, or unchecking some amenities.</p>
                </div>
            `;
            return;
        }

        const user = authService.getUser();
        const isPremium = authService.isPremium();

        grid.innerHTML = filtered.map(prop => {
            const isSaved = user && user.savedProperties && user.savedProperties.includes(prop.id);
            const amenitiesList = [];
            if (prop.amenities.wifi) amenitiesList.push('<span>📶 WiFi</span>');
            if (prop.amenities.food) amenitiesList.push('<span>🍲 Food Inc.</span>');
            if (prop.amenities.ac) amenitiesList.push('<span>❄️ AC</span>');
            if (prop.amenities.laundry) amenitiesList.push('<span>🧺 Laundry</span>');
            if (prop.amenities.gym) amenitiesList.push('<span>💪 Gym</span>');

            const genderBadgeClass = prop.gender === 'girls' ? 'girls' : (prop.gender === 'boys' ? 'boys' : 'unisex');
            const genderBadgeLabel = prop.gender === 'girls' ? 'Girls Only' : (prop.gender === 'boys' ? 'Boys Only' : 'Unisex / Co-ed');

            let contactHtml = "";
            if (isPremium) {
                contactHtml = `
                    <div class="student-card-contact-unlocked">
                        <span class="unlocked-phone">📞 Phone: ${prop.ownerContact.phone}</span>
                        <span class="unlocked-email" style="font-size: 0.8rem; color: var(--text-light);">✉️ Email: ${prop.ownerContact.email}</span>
                    </div>
                `;
            } else {
                contactHtml = `
                    <div class="student-card-lock-overlay">
                        <p class="lock-message">🔒 Owner contact is locked</p>
                        <a href="membership.html" class="lock-cta">Unlock with ₹49 Membership</a>
                    </div>
                `;
            }

            return `
                <article class="student-card animate-on-scroll">
                    <div class="student-card-img-wrapper">
                        <span class="student-card-badge">${prop.type.toUpperCase()}</span>
                        <span class="student-card-gender ${genderBadgeClass}">${genderBadgeLabel}</span>
                        <img src="${prop.photos[0]}" alt="${prop.name}" class="student-card-img" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'">
                        <span class="student-card-price">₹${prop.priceMin.toLocaleString()} - ₹${prop.priceMax.toLocaleString()} / mo</span>
                    </div>
                    <div class="student-card-content">
                        <h3 class="student-card-title">${prop.name}</h3>
                        <div class="student-card-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>${prop.locality}</span>
                        </div>
                        <div class="student-card-amenities">
                            ${amenitiesList.join('')}
                        </div>
                        ${contactHtml}
                        <div class="student-card-actions">
                            <button onclick="studentHub.openPropertyModal('${prop.id}')" class="btn btn-outline" style="font-size: 0.85rem; padding: 8px 12px; border-radius: var(--radius-sm);">View Details</button>
                            <button onclick="studentHub.handleSaveProperty('${prop.id}')" class="btn ${isSaved ? 'btn-primary' : 'btn-outline'}" style="font-size: 0.85rem; padding: 8px 12px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                <span>${isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Trigger scroll animations if standard script observer is active
        if (typeof observer !== 'undefined') {
            document.querySelectorAll('.student-card').forEach(el => observer.observe(el));
        }
    },

    handleSaveProperty: function(propertyId) {
        const user = authService.getUser();
        if (!user) {
            if (typeof showToast !== 'undefined') {
                showToast("Please login to save property listings.", "error");
            } else {
                alert("Please login to save property listings.");
            }
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
            return;
        }

        const saved = authService.toggleSaveProperty(propertyId);
        if (saved) {
            if (typeof showToast !== 'undefined') showToast("Property saved to your bookmarks!", "success");
        } else {
            if (typeof showToast !== 'undefined') showToast("Property removed from bookmarks.", "info");
        }
        this.renderListings();
    },

    openPropertyModal: function(propertyId) {
        const prop = this.properties.find(p => p.id === propertyId);
        if (!prop) return;

        const isPremium = authService.isPremium();
        const user = authService.getUser();
        
        let modal = document.getElementById('propertyDetailsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'propertyDetailsModal';
            modal.className = 'hub-modal';
            document.body.appendChild(modal);
        }

        const amenitiesList = [];
        for (const [key, value] of Object.entries(prop.amenities)) {
            if (value) {
                const label = key === 'wifi' ? 'High Speed WiFi' :
                              key === 'food' ? 'Healthy Meals Included' :
                              key === 'ac' ? 'AC Room' :
                              key === 'laundry' ? 'Laundry Service' :
                              key === 'gym' ? 'In-house Fitness Gym' : 'Secure Parking Space';
                amenitiesList.push(`<li>✔️ ${label}</li>`);
            }
        }

        let contactInfo = "";
        if (isPremium) {
            contactInfo = `
                <div style="background: rgba(85, 239, 196, 0.1); border: 1px solid var(--success); border-radius: var(--radius-sm); padding: 20px; margin-top: 20px;">
                    <h4 style="color: var(--primary); font-weight: 700; margin-bottom: 10px;">Direct Owner Contact</h4>
                    <p style="margin-bottom: 6px;"><strong>👤 Contact Person:</strong> Owner</p>
                    <p style="margin-bottom: 6px;"><strong>📞 Phone:</strong> <a href="tel:${prop.ownerContact.phone}" style="color: var(--primary); text-decoration: underline; font-weight: 700;">${prop.ownerContact.phone}</a></p>
                    <p style="margin-bottom: 0;"><strong>✉️ Email:</strong> ${prop.ownerContact.email}</p>
                </div>
            `;
        } else {
            contactInfo = `
                <div style="background: rgba(201, 169, 110, 0.08); border: 1px dashed var(--gold); border-radius: var(--radius-sm); padding: 20px; text-align: center; margin-top: 20px;">
                    <p style="font-weight: 700; color: var(--text); margin-bottom: 12px;">🔒 Owner contact info is locked for security.</p>
                    <a href="membership.html" class="btn btn-secondary btn-sm" style="font-size: 0.85rem; padding: 10px 20px;">Unlock with ₹49 Membership</a>
                </div>
            `;
        }

        // Image slider indicators/slides
        const slidesHtml = prop.photos.map((photo, index) => `
            <img src="${photo}" class="modal-carousel-img" style="display: ${index === 0 ? 'block' : 'none'}; width:100%; height:100%; object-fit:cover;" id="modalSlide_${index}">
        `).join('');

        const indicatorsHtml = prop.photos.map((_, index) => `
            <button onclick="studentHub.setModalSlide(${index}, ${prop.photos.length})" style="width: 10px; height: 10px; border-radius: 50%; border: none; background: ${index === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.5)'}; cursor: pointer; margin: 0 4px;" id="modalInd_${index}"></button>
        `).join('');

        modal.innerHTML = `
            <div class="hub-modal-content">
                <button onclick="studentHub.closePropertyModal()" class="modal-close-btn">&times;</button>
                <div class="modal-carousel" style="position: relative; height: 350px;">
                    ${slidesHtml}
                    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; z-index: 5;">
                        ${indicatorsHtml}
                    </div>
                </div>
                <div style="padding: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <span class="student-card-badge" style="position: static; margin-bottom: 10px; display: inline-block;">${prop.type.toUpperCase()}</span>
                            <h3 style="font-size: 1.8rem; font-weight: 700; color: var(--primary); margin-top: 5px;">${prop.name}</h3>
                            <p style="color: var(--text-light); margin-top: 5px; display: flex; align-items: center; gap: 6px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                <span>${prop.locality}, Pincode: ${prop.pincode}</span>
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 1.6rem; font-weight: 800; color: var(--gold-dark); display: block;">₹${prop.priceMin.toLocaleString()} - ₹${prop.priceMax.toLocaleString()}</span>
                            <span style="font-size: 0.85rem; color: var(--text-light); display: block;">Security Deposit: ₹${prop.securityDeposit.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin: 25px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--light-gray);">Amenities & Conveniences</h4>
                    <ul style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; list-style: none;">
                        ${amenitiesList.join('')}
                    </ul>

                    <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin: 25px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--light-gray);">Verification & Security</h4>
                    <p style="font-size: 0.95rem; line-height: 1.6;">This PG property has been physical verified by the <strong>Rama Krishna Properties Team</strong>. Integrated legally valid digital rent agreements and police verification assistance are available directly from the Legal Services panel.</p>

                    ${contactInfo}
                </div>
            </div>
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    },

    closePropertyModal: function() {
        const modal = document.getElementById('propertyDetailsModal');
        if (modal) {
            modal.classList.remove('active');
        }
        document.body.style.overflow = '';
    },

    setModalSlide: function(slideIdx, totalSlides) {
        for (let i = 0; i < totalSlides; i++) {
            const slide = document.getElementById(`modalSlide_${i}`);
            const ind = document.getElementById(`modalInd_${i}`);
            if (slide && ind) {
                if (i === slideIdx) {
                    slide.style.display = 'block';
                    ind.style.background = 'var(--gold)';
                } else {
                    slide.style.display = 'none';
                    ind.style.background = 'rgba(255,255,255,0.5)';
                }
            }
        }
    }
};

// Start Student Hub logic
document.addEventListener('DOMContentLoaded', () => {
    // Only init if we are on the student hub page
    if (document.getElementById('studentPropertiesGrid')) {
        studentHub.init();
    }
});
