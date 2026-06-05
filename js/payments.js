// Razorpay Payment Integration for Rama Krishna Properties

const paymentService = {
    // Razorpay Key ID - Test key by default
    keyId: "rzp_test_zM1qUvFakeRkPropsKeyId",

    init: function() {
        console.log("Payment service initialized.");
    },

    // Load Razorpay SDK dynamically if not loaded
    loadSDK: function() {
        return new Promise((resolve, reject) => {
            if (typeof Razorpay !== 'undefined') {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error("Failed to load Razorpay SDK. Please check your internet connection."));
            document.head.appendChild(script);
        });
    },

    // Standard checkout
    pay: async function(options) {
        try {
            await this.loadSDK();

            return new Promise((resolve, reject) => {
                const config = {
                    key: this.keyId,
                    amount: options.amount * 100, // Amount is in currency subunits (paise for INR, 100 paise = 1 INR)
                    currency: "INR",
                    name: "Rama Krishna Properties",
                    description: options.description || "Real Estate Premium Services",
                    image: "assets/images/rk-logo.png",
                    handler: function(response) {
                        // Payment Successful Callback
                        console.log("Payment Success:", response);
                        resolve({
                            success: true,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            orderId: response.razorpay_order_id
                        });
                    },
                    prefill: {
                        name: options.prefillName || "",
                        email: options.prefillEmail || "",
                        contact: options.prefillPhone || ""
                    },
                    notes: options.notes || {},
                    theme: {
                        color: "#1a237e" // Royal blue matching brand
                    },
                    modal: {
                        ondismiss: function() {
                            console.log("Checkout modal dismissed by user.");
                            resolve({ success: false, error: "Payment cancelled by user." });
                        }
                    }
                };

                const rzp = new Razorpay(config);
                rzp.on('payment.failed', function (response) {
                    console.error("Payment Failed:", response.error);
                    resolve({
                        success: false,
                        error: response.error.description,
                        code: response.error.code,
                        source: response.error.source,
                        step: response.error.step
                    });
                });
                rzp.open();
            });
        } catch (error) {
            console.error("Razorpay Payment Error:", error);
            // Fallback for offline testing or demo mock mode if SDK fails or internet is disconnected
            return this.mockPayment(options);
        }
    },

    // Mock payment simulator for offline/demo/testing mode
    mockPayment: function(options) {
        return new Promise((resolve) => {
            if (typeof showToast !== 'undefined') {
                showToast("Simulating secure payment gateway...", "info");
            } else {
                console.log("Simulating secure payment gateway...");
            }
            
            setTimeout(() => {
                const isConfirmed = confirm(`[DEMO MODE PAYMENTS]\n\nMerchant: Rama Krishna Properties\nService: ${options.description}\nAmount: ₹${options.amount}\n\nDo you want to approve this simulated payment?`);
                if (isConfirmed) {
                    const mockPaymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
                    resolve({
                        success: true,
                        paymentId: mockPaymentId,
                        isMock: true
                    });
                } else {
                    resolve({
                        success: false,
                        error: "Payment declined in simulation."
                    });
                }
            }, 800);
        });
    },

    // Purchase Premium Membership (₹49)
    purchaseMembership: async function(user) {
        if (!user) {
            if (typeof showToast !== 'undefined') {
                showToast("Please login or register to buy a membership.", "error");
            }
            return false;
        }

        const options = {
            amount: 49,
            description: "Anti-Brokerage Student Hub 1-Year Membership",
            prefillName: user.name,
            prefillEmail: user.email,
            prefillPhone: user.phone || "",
            notes: {
                userId: user.uid,
                type: "membership"
            }
        };

        const result = await this.pay(options);
        if (result.success) {
            const upgraded = authService.upgradeToPremium(result.paymentId);
            if (upgraded) {
                if (typeof showToast !== 'undefined') {
                    showToast("Congratulations! You are now a Premium Member.", "success");
                }
                return true;
            }
        } else {
            if (typeof showToast !== 'undefined') {
                showToast(`Payment failed: ${result.error}`, "error");
            }
        }
        return false;
    },

    // Purchase legal service
    purchaseLegalService: async function(user, serviceType, details, amount) {
        if (!user) {
            if (typeof showToast !== 'undefined') {
                showToast("Please login to request legal services.", "error");
            }
            return false;
        }

        let desc = "Legal Service Request";
        if (serviceType === 'police_verification') desc = "Digital Police Verification Assistance";
        if (serviceType === 'rent_agreement') desc = "Notarized Digital Rent Agreement";
        if (serviceType === 'notary') desc = "Verified Notary Services & Affidavits";

        const options = {
            amount: amount,
            description: desc,
            prefillName: user.name,
            prefillEmail: user.email,
            prefillPhone: user.phone || "",
            notes: {
                userId: user.uid,
                type: "legal_service",
                service: serviceType
            }
        };

        const result = await this.pay(options);
        if (result.success) {
            const request = authService.requestService(serviceType, details, amount, result.paymentId);
            if (request) {
                if (typeof showToast !== 'undefined') {
                    showToast("Legal service request submitted successfully!", "success");
                }
                return request;
            }
        } else {
            if (typeof showToast !== 'undefined') {
                showToast(`Payment failed: ${result.error}`, "error");
            }
        }
        return false;
    }
};

// Initialize payment logic
document.addEventListener('DOMContentLoaded', () => {
    paymentService.init();
});
