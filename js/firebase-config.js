// Firebase Configuration for Rama Krishna Properties
// Replace with your actual Firebase config from console.firebase.google.com

const firebaseConfig = {
    apiKey: "AIzaSyFakeApiKeyPlaceholder_RKProps12345",
    authDomain: "rk-properties-student-hub.firebaseapp.com",
    projectId: "rk-properties-student-hub",
    storageBucket: "rk-properties-student-hub.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase (wrapped in a try-catch for demo fallback mode if Firebase CDN is blocked/fails)
let app, auth, db, storage;
let isFirebaseConnected = false;

try {
    // Check if firebase script is loaded
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        isFirebaseConnected = true;
        console.log("Firebase initialized successfully.");
    } else {
        console.warn("Firebase SDK not found. Running in DEMO mode with LocalStorage.");
    }
} catch (error) {
    console.error("Firebase initialization failed. Running in DEMO mode:", error);
}

// LocalStorage database mock-up for full functionality in fallback mode
const mockDb = {
    get: (key) => {
        const val = localStorage.getItem(`rk_${key}`);
        return val ? JSON.parse(val) : null;
    },
    set: (key, val) => {
        localStorage.setItem(`rk_${key}`, JSON.stringify(val));
    }
};

// Seed database with properties if it doesn't exist
if (!mockDb.get('properties')) {
    const sampleProperties = [
        {
            id: "pg_1",
            name: "Stanza Living Delhi - Dublin House",
            type: "pg",
            locality: "Near North Campus, GTB Nagar",
            city: "Delhi",
            pincode: "110009",
            priceMin: 8500,
            priceMax: 14000,
            securityDeposit: 15000,
            gender: "unisex",
            amenities: { wifi: true, food: true, ac: true, laundry: true, gym: false, parking: true },
            photos: [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80"
            ],
            ownerContact: { phone: "+91 98765 43210", email: "northcampuspg@gmail.com" },
            isVerified: true,
            isAvailable: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "pg_2",
            name: "Laxmi PG for Girls",
            type: "pg",
            locality: "Chandan Park, Siraspur",
            city: "Delhi",
            pincode: "110042",
            priceMin: 5500,
            priceMax: 8500,
            securityDeposit: 8000,
            gender: "girls",
            amenities: { wifi: true, food: true, ac: false, laundry: true, gym: false, parking: false },
            photos: [
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80"
            ],
            ownerContact: { phone: "+91 87654 32109", email: "laxmigirlspg@gmail.com" },
            isVerified: true,
            isAvailable: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "pg_3",
            name: "Sherwood Student Co-living",
            type: "hostel",
            locality: "Hudson Lane, Kingsway Camp",
            city: "Delhi",
            pincode: "110009",
            priceMin: 11000,
            priceMax: 18000,
            securityDeposit: 20000,
            gender: "boys",
            amenities: { wifi: true, food: true, ac: true, laundry: true, gym: true, parking: true },
            photos: [
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"
            ],
            ownerContact: { phone: "+91 76543 21098", email: "sherwoodhostel@gmail.com" },
            isVerified: true,
            isAvailable: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "pg_4",
            name: "R K Luxury PG Accommodation",
            type: "pg",
            locality: "Kamla Nagar, near Hansraj College",
            city: "Delhi",
            pincode: "110007",
            priceMin: 12500,
            priceMax: 22000,
            securityDeposit: 25000,
            gender: "unisex",
            amenities: { wifi: true, food: true, ac: true, laundry: true, gym: true, parking: true },
            photos: [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
            ],
            ownerContact: { phone: "+91 78388 25736", email: "ramakrishnaproperties@gmail.com" },
            isVerified: true,
            isAvailable: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "pg_5",
            name: "Modern PG for Boys",
            type: "pg",
            locality: "Vijay Nagar, GTB Nagar",
            city: "Delhi",
            pincode: "110009",
            priceMin: 7000,
            priceMax: 10000,
            securityDeposit: 10000,
            gender: "boys",
            amenities: { wifi: true, food: true, ac: true, laundry: false, gym: false, parking: true },
            photos: [
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
            ],
            ownerContact: { phone: "+91 65432 10987", email: "vijaynagarpg@gmail.com" },
            isVerified: false,
            isAvailable: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "pg_6",
            name: "Elite Co-ed Residency",
            type: "flat",
            locality: "Satya Niketan, South Campus",
            city: "Delhi",
            pincode: "110021",
            priceMin: 14000,
            priceMax: 25000,
            securityDeposit: 30000,
            gender: "unisex",
            amenities: { wifi: true, food: false, ac: true, laundry: true, gym: false, parking: true },
            photos: [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80"
            ],
            ownerContact: { phone: "+91 99999 88888", email: "elitecoliving@gmail.com" },
            isVerified: true,
            isAvailable: true,
            createdAt: new Date().toISOString()
        }
    ];
    mockDb.set('properties', sampleProperties);
}
