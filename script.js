/* ============================================
   RAMA KRISHNA PROPERTIES - MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ==================== PRELOADER ====================
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 800);
        });
        // Fallback: hide after 3s
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 3000);
    }

    // ==================== SCROLL PROGRESS BAR ====================
    const scrollProgress = document.getElementById('scrollProgress');
    function updateScrollProgress() {
        if (!scrollProgress) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
    }

    // ==================== NAVBAR SCROLL EFFECT ====================
    const navbar = document.getElementById('navbar');
    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ==================== BACK TO TOP ====================
    const backToTop = document.getElementById('backToTop');
    function handleBackToTop() {
        if (!backToTop) return;
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Combined scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                handleNavbarScroll();
                handleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    });

    // ==================== MOBILE MENU ====================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        function toggleMobileMenu() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        }

        hamburger.addEventListener('click', toggleMobileMenu);
        overlay.addEventListener('click', toggleMobileMenu);

        // Close on link click
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link, .btn');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });
    }

    // ==================== SMOOTH SCROLLING ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ==================== ACTIVE NAV HIGHLIGHTING ====================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(section => navObserver.observe(section));

    // ==================== SEARCH TABS ====================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchLocation = document.getElementById('searchLocation');

    const placeholders = {
        buy: 'Search locality, project or landmark to buy...',
        sell: 'Enter your property location to sell...',
        rent: 'Search area or project to rent...',
        commercial: 'Search commercial spaces...',
        invest: 'Search investment opportunities...'
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            if (searchLocation && placeholders[tab]) {
                searchLocation.placeholder = placeholders[tab];
            }
            // Form fade animation
            const searchForm = document.getElementById('searchForm');
            if (searchForm) {
                searchForm.style.opacity = '0';
                searchForm.style.transform = 'translateY(8px)';
                setTimeout(() => {
                    searchForm.style.opacity = '1';
                    searchForm.style.transform = 'translateY(0)';
                }, 150);
            }
        });
    });

    // ==================== SCROLL ANIMATIONS ====================
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const scrollAnimObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                scrollAnimObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animateElements.forEach(el => scrollAnimObserver.observe(el));

    // ==================== COUNTER ANIMATION ====================
    const statNumbers = document.querySelectorAll('.stat-number, .hero-stat-number');
    const countedElements = new Set();

    function animateCounter(el) {
        if (countedElements.has(el)) return;
        countedElements.add(el);

        const target = parseInt(el.getAttribute('data-target')) || 0;
        const duration = 2000;
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(updateCount);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ==================== TYPING EFFECT ====================
    const typingText = document.getElementById('typingText');
    if (typingText) {
        const phrases = [
            'Residential Properties',
            'Commercial Spaces',
            'Investment Opportunities',
            'Your Dream Home',
            'Builder Floors & Villas',
            'Premium Plots & Land'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        function typeEffect() {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                typingText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typingText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                typingSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400;
            }

            setTimeout(typeEffect, typingSpeed);
        }

        setTimeout(typeEffect, 1500);
    }

    // ==================== TESTIMONIAL SLIDER ====================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dotsContainer = document.getElementById('testimonialDots');
    let currentTestimonial = 0;
    let testimonialInterval;

    if (testimonialCards.length > 0 && dotsContainer) {
        // Create dots
        testimonialCards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
            dot.addEventListener('click', () => goToTestimonial(i));
            dotsContainer.appendChild(dot);
        });

        function goToTestimonial(index) {
            testimonialCards.forEach(card => card.classList.remove('active'));
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach(dot => dot.classList.remove('active'));

            testimonialCards[index].classList.add('active');
            dots[index].classList.add('active');
            currentTestimonial = index;
        }

        function nextTestimonial() {
            const next = (currentTestimonial + 1) % testimonialCards.length;
            goToTestimonial(next);
        }

        testimonialInterval = setInterval(nextTestimonial, 5000);

        // Pause on hover
        const slider = document.querySelector('.testimonials-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
            slider.addEventListener('mouseleave', () => {
                testimonialInterval = setInterval(nextTestimonial, 5000);
            });
        }
    }

    // ==================== FAQ ACCORDION ====================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all
                faqItems.forEach(i => i.classList.remove('active'));

                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // ==================== TOAST NOTIFICATIONS ====================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = `<span style="font-size:1.2rem;">${icons[type] || '✓'}</span> ${message}`;

        toast.addEventListener('click', () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 400);
        });

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // ==================== FORM VALIDATION HELPERS ====================
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^[6-9]\d{9}$/.test(phone.replace(/[\s\-+91]/g, ''));
    }

    // ==================== LEAD FORM ====================
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('leadName')?.value.trim();
            const phone = document.getElementById('leadPhone')?.value.trim();
            const email = document.getElementById('leadEmail')?.value.trim();
            const requirement = document.getElementById('leadRequirement')?.value;

            if (!name || name.length < 2) {
                showToast('Please enter your full name.', 'error');
                return;
            }

            if (!validatePhone(phone)) {
                showToast('Please enter a valid 10-digit phone number.', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            if (!requirement) {
                showToast('Please select your property requirement.', 'error');
                return;
            }

            // Success
            showToast('Thank you! Our property advisor will contact you within 24 hours.', 'success');
            leadForm.reset();

            // Track lead (placeholder for analytics)
            console.log('Lead captured:', { name, phone, email, requirement });
        });
    }

    // ==================== CONTACT FORM ====================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName')?.value.trim();
            const email = document.getElementById('contactEmail')?.value.trim();
            const phone = document.getElementById('contactPhone')?.value.trim();
            const message = document.getElementById('contactMessage')?.value.trim();

            if (!name || name.length < 2) {
                showToast('Please enter your name.', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            if (!validatePhone(phone)) {
                showToast('Please enter a valid phone number.', 'error');
                return;
            }

            if (!message || message.length < 10) {
                showToast('Please enter a message (at least 10 characters).', 'error');
                return;
            }

            showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
        });
    }

    // ==================== NEWSLETTER FORM ====================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && validateEmail(emailInput.value.trim())) {
                showToast('Subscribed successfully! Welcome to our property updates.', 'success');
                newsletterForm.reset();
            } else {
                showToast('Please enter a valid email address.', 'error');
            }
        });
    }

    // ==================== SEARCH FORM ====================
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Searching properties... Our team will share matching listings with you!', 'info');
        });
    }

    // ==================== IMAGE LAZY LOADING ====================
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.addEventListener('load', () => {
                            img.style.opacity = '1';
                        });
                        img.addEventListener('error', () => {
                            // Keep the gradient background visible on error
                            img.style.opacity = '0';
                        });
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        lazyImages.forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease';
            // For external URLs, load eagerly for better UX
            const src = img.getAttribute('data-src');
            if (src && src.startsWith('http')) {
                img.src = src;
                img.removeAttribute('data-src');
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
                img.addEventListener('error', () => {
                    img.style.opacity = '0';
                });
            } else {
                imageObserver.observe(img);
            }
        });
    }

    // ==================== PROPERTY CARD TILT ====================
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ==================== HERO PARALLAX ====================
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
            }
        });
    }

    // ==================== HERO PARTICLES ====================
    const particlesContainer = document.getElementById('heroParticles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 2;
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(201, 169, 110, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 6 + 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
            `;
            particlesContainer.appendChild(particle);
        }

        // Add particle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                25% { transform: translate(${Math.random() * 40 - 20}px, -${Math.random() * 40 + 20}px) scale(1.2); opacity: 0.6; }
                50% { transform: translate(${Math.random() * 60 - 30}px, -${Math.random() * 60 + 30}px) scale(0.8); opacity: 0.4; }
                75% { transform: translate(${Math.random() * 30 - 15}px, -${Math.random() * 30 + 15}px) scale(1.1); opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    // ==================== WISHLIST TOGGLE ====================
    document.querySelectorAll('.btn-icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const svg = btn.querySelector('svg');
            if (svg) {
                const isFilled = svg.getAttribute('fill') !== 'none';
                svg.setAttribute('fill', isFilled ? 'none' : '#d63031');
                svg.setAttribute('stroke', isFilled ? 'currentColor' : '#d63031');
            }
            showToast(
                svg?.getAttribute('fill') !== 'none'
                    ? 'Added to your wishlist!'
                    : 'Removed from wishlist.',
                'info'
            );
        });
    });

    // ==================== SEARCH FORM TRANSITION ====================
    const searchFormEl = document.getElementById('searchForm');
    if (searchFormEl) {
        searchFormEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }

    // ==================== ADDITIONAL SERVICES CAROUSEL ====================
    const addlCarousel = document.getElementById('addlCarousel');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');

    if (addlCarousel && carouselPrev && carouselNext) {
        const scrollAmount = 360;

        carouselPrev.addEventListener('click', () => {
            addlCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        carouselNext.addEventListener('click', () => {
            addlCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // Auto scroll carousel every 4 seconds
        let carouselAutoScroll = setInterval(() => {
            if (addlCarousel.scrollLeft + addlCarousel.clientWidth >= addlCarousel.scrollWidth - 20) {
                addlCarousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                addlCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }, 4000);

        addlCarousel.addEventListener('mouseenter', () => clearInterval(carouselAutoScroll));
        addlCarousel.addEventListener('mouseleave', () => {
            carouselAutoScroll = setInterval(() => {
                if (addlCarousel.scrollLeft + addlCarousel.clientWidth >= addlCarousel.scrollWidth - 20) {
                    addlCarousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    addlCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }, 4000);
        });
    }

    // ==================== PROPERTY TOOLS TABS ====================
    const toolTabs = document.querySelectorAll('.tool-tab');
    const toolPanels = document.querySelectorAll('.tool-panel');

    toolTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const toolId = tab.getAttribute('data-tool');

            toolTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            toolPanels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById('tool-' + toolId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // ==================== EMI CALCULATOR ====================
    const emiLoanAmount = document.getElementById('emiLoanAmount');
    const emiRate = document.getElementById('emiRate');
    const emiTenure = document.getElementById('emiTenure');
    const emiLoanRange = document.getElementById('emiLoanRange');
    const emiRateRange = document.getElementById('emiRateRange');
    const emiTenureRange = document.getElementById('emiTenureRange');

    function formatINR(num) {
        const str = Math.round(num).toString();
        let result = '';
        let count = 0;
        for (let i = str.length - 1; i >= 0; i--) {
            if (count === 3 || (count > 3 && (count - 3) % 2 === 0)) {
                result = ',' + result;
            }
            result = str[i] + result;
            count++;
        }
        return '₹' + result;
    }

    function calculateEMI() {
        if (!emiLoanAmount || !emiRate || !emiTenure) return;

        const P = parseFloat(emiLoanAmount.value) || 0;
        const annualRate = parseFloat(emiRate.value) || 0;
        const years = parseInt(emiTenure.value) || 0;

        if (P <= 0 || annualRate <= 0 || years <= 0) return;

        const r = annualRate / 12 / 100;
        const n = years * 12;
        const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;
        const principalPercent = Math.round((P / totalPayment) * 100);
        const interestPercent = 100 - principalPercent;

        const emiMonthly = document.getElementById('emiMonthly');
        const emiTotalInterest = document.getElementById('emiTotalInterest');
        const emiTotalPayment = document.getElementById('emiTotalPayment');
        const chartPrincipal = document.getElementById('chartPrincipal');
        const chartInterest = document.getElementById('chartInterest');

        if (emiMonthly) emiMonthly.textContent = formatINR(emi);
        if (emiTotalInterest) emiTotalInterest.textContent = formatINR(totalInterest);
        if (emiTotalPayment) emiTotalPayment.textContent = formatINR(totalPayment);

        if (chartPrincipal) {
            chartPrincipal.style.width = principalPercent + '%';
            chartPrincipal.querySelector('span').textContent = `Principal: ${principalPercent}%`;
        }
        if (chartInterest) {
            chartInterest.style.width = interestPercent + '%';
            chartInterest.querySelector('span').textContent = `Interest: ${interestPercent}%`;
        }
    }

    // Sync range sliders with inputs
    function syncInputs(input, range) {
        if (!input || !range) return;
        input.addEventListener('input', () => { range.value = input.value; calculateEMI(); });
        range.addEventListener('input', () => { input.value = range.value; calculateEMI(); });
    }

    syncInputs(emiLoanAmount, emiLoanRange);
    syncInputs(emiRate, emiRateRange);
    syncInputs(emiTenure, emiTenureRange);

    calculateEMI(); // Initial calculation

    // ==================== CIRCLE RATE CALCULATOR ====================
    const calcCircleRate = document.getElementById('calcCircleRate');
    if (calcCircleRate) {
        const circleRates = {
            delhi:         { residential: 7500, commercial: 12000, industrial: 8000, agricultural: 3000 },
            noida:         { residential: 5200, commercial: 8500,  industrial: 5500, agricultural: 2200 },
            gurgaon:       { residential: 6800, commercial: 11000, industrial: 7000, agricultural: 2800 },
            ghaziabad:     { residential: 3800, commercial: 6000,  industrial: 4000, agricultural: 1800 },
            faridabad:     { residential: 4500, commercial: 7500,  industrial: 5000, agricultural: 2000 },
            'greater-noida': { residential: 3200, commercial: 5500,  industrial: 3500, agricultural: 1500 }
        };

        calcCircleRate.addEventListener('click', () => {
            const city = document.getElementById('crCity')?.value || 'delhi';
            const type = document.getElementById('crType')?.value || 'residential';
            const area = parseFloat(document.getElementById('crArea')?.value) || 1200;

            const rate = circleRates[city]?.[type] || 5000;
            const value = rate * area;
            const stampDuty = value * 0.06;

            const crRateEl = document.getElementById('crRate');
            const crValueEl = document.getElementById('crValue');
            const crStampDutyEl = document.getElementById('crStampDuty');

            if (crRateEl) crRateEl.textContent = formatINR(rate) + '/sq.ft';
            if (crValueEl) crValueEl.textContent = formatINR(value);
            if (crStampDutyEl) crStampDutyEl.textContent = formatINR(stampDuty);

            showToast('Circle rate calculated! These are indicative rates.', 'info');
        });
    }

    // ==================== STAMP DUTY CALCULATOR ====================
    const calcStampDuty = document.getElementById('calcStampDuty');
    if (calcStampDuty) {
        const stampDutyRates = {
            delhi:       { male: 6, female: 4, joint: 5, reg: 1 },
            up:          { male: 7, female: 6, joint: 6.5, reg: 1 },
            haryana:     { male: 7, female: 5, joint: 6, reg: 1.5 },
            rajasthan:   { male: 6, female: 5, joint: 5.5, reg: 1 },
            maharashtra: { male: 6, female: 5, joint: 5.5, reg: 1 }
        };

        calcStampDuty.addEventListener('click', () => {
            const value = parseFloat(document.getElementById('sdValue')?.value) || 5000000;
            const state = document.getElementById('sdState')?.value || 'delhi';
            const gender = document.getElementById('sdGender')?.value || 'male';

            const rates = stampDutyRates[state] || stampDutyRates.delhi;
            const dutyRate = rates[gender] || 6;
            const regRate = rates.reg || 1;
            const duty = value * (dutyRate / 100);
            const reg = value * (regRate / 100);
            const total = duty + reg;

            const sdDutyEl = document.getElementById('sdDuty');
            const sdRegEl = document.getElementById('sdReg');
            const sdTotalEl = document.getElementById('sdTotal');

            if (sdDutyEl) sdDutyEl.textContent = formatINR(duty);
            if (sdRegEl) sdRegEl.textContent = formatINR(reg);
            if (sdTotalEl) sdTotalEl.textContent = formatINR(total);

            showToast(`Stamp Duty: ${dutyRate}% + Registration: ${regRate}%`, 'info');
        });
    }

    // ==================== DUE DILIGENCE CHECKER ====================
    const ddCheckboxes = document.querySelectorAll('[data-dd]');
    if (ddCheckboxes.length > 0) {
        const ddTotal = document.getElementById('ddTotal');
        const ddChecked = document.getElementById('ddChecked');
        const ddPercent = document.getElementById('ddPercent');
        const ddProgressFill = document.getElementById('ddProgressFill');

        if (ddTotal) ddTotal.textContent = ddCheckboxes.length;

        function updateDDProgress() {
            const checked = document.querySelectorAll('[data-dd]:checked').length;
            const total = ddCheckboxes.length;
            const percent = Math.round((checked / total) * 100);

            if (ddChecked) ddChecked.textContent = checked;
            if (ddPercent) ddPercent.textContent = percent;
            if (ddProgressFill) ddProgressFill.style.width = percent + '%';

            if (percent === 100) {
                showToast('🎉 All due diligence items verified! Your property is ready for purchase.', 'success');
            }
        }

        ddCheckboxes.forEach(cb => {
            cb.addEventListener('change', updateDDProgress);
        });
    }

    // ==================== INITIALIZE ====================
    handleNavbarScroll();
    updateScrollProgress();
    handleBackToTop();

    console.log('%c🏠 Rama Krishna Properties', 'font-size:20px;font-weight:bold;color:#1a237e;');
    console.log('%cPremium Real Estate Solutions', 'font-size:14px;color:#c9a96e;');

});
