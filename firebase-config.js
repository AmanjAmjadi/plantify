// Firebase configuration - using your provided config
const firebaseConfig = {
    apiKey: "AIzaSyCKgGSvqdRAjYenxFVGtG2pXVBSnE-Rtyk",
    authDomain: "plantify-11287.firebaseapp.com",
    projectId: "plantify-11287",
    storageBucket: "plantify-11287.firebasestorage.app",
    messagingSenderId: "843480423153",
    appId: "1:843480423153:web:3f257e2a80495bb98ca750",
    measurementId: "G-PE95BHQS90"
};

// Initialize Firebase
let auth, db;
let isFirebaseInitialized = false;

// Initialize Firebase with the provided configuration
function initializeFirebase() {
    if (isFirebaseInitialized) return { auth, db };
    
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        isFirebaseInitialized = true;
        
        // Set up auth state listener
        auth.onAuthStateChanged(handleAuthStateChanged);
        
        return { auth, db };
    } catch (error) {
        console.error("Firebase initialization error:", error);
        return { error };
    }
}

// User authentication state handler
async function handleAuthStateChanged(user) {
    if (user) {
        // User is signed in
        document.getElementById('not-logged-in').classList.add('hidden');
        document.getElementById('logged-in').classList.remove('hidden');
        
        // Set user info in profile section
        document.getElementById('user-name').textContent = user.displayName || user.email;
        document.getElementById('user-email').textContent = user.email;
        
        // Check if we have a saved API key for this user
        try {
            const docRef = db.collection('users').doc(user.uid);
            const doc = await docRef.get();
            
            if (doc.exists && doc.data().geminiApiKey) {
                // Use the stored API key
                await setApiKey(doc.data().geminiApiKey);
            }
        } catch (error) {
            console.error("Error loading user settings:", error);
        }
        
        // Try to sync with cloud
        await syncWithCloud();
    } else {
        // User is signed out
        document.getElementById('not-logged-in').classList.remove('hidden');
        document.getElementById('logged-in').classList.add('hidden');
    }
}

// Sync local data with cloud
async function syncWithCloud() {
    if (!auth.currentUser) return false;
    
    try {
        // First, try to get the cloud data
        const docRef = db.collection('users').doc(auth.currentUser.uid);
        const doc = await docRef.get();
        
        if (doc.exists && doc.data().garden) {
            // Get timestamp to compare which is newer
            const cloudTimestamp = doc.data().lastUpdated?.toMillis() || 0;
            const localTimestamp = await loadSetting('lastUpdated', 0);
            
            if (cloudTimestamp > localTimestamp) {
                // Cloud data is newer, use it
                garden = doc.data().garden;
                await saveGarden(garden);
                await saveSetting('lastUpdated', cloudTimestamp);
                renderGarden();
                renderCare();
                return { status: 'downloaded', timestamp: cloudTimestamp };
            } else if (localTimestamp > cloudTimestamp) {
                // Local data is newer, push to cloud
                return await saveToCloud();
            }
            return { status: 'synced', timestamp: cloudTimestamp };
        } else {
            // No cloud data, push local data
            return await saveToCloud();
        }
    } catch (error) {
        console.error("Error syncing with cloud:", error);
        return { error: error.message };
    }
}

// Save garden data to cloud
async function saveToCloud() {
    if (!auth.currentUser) return false;
    
    try {
        const timestamp = Date.now();
        const docRef = db.collection('users').doc(auth.currentUser.uid);
        
        await docRef.set({
            garden: garden,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Update local timestamp
        await saveSetting('lastUpdated', timestamp);
        return { status: 'uploaded', timestamp };
    } catch (error) {
        console.error("Error saving to cloud:", error);
        return { error: error.message };
    }
}

// Sign in with email/password
async function signInWithEmailPassword(email, password) {
    try {
        initializeFirebase();
        await auth.signInWithEmailAndPassword(email, password);
        return true;
    } catch (error) {
        console.error("Error signing in:", error);
        return { error: error.message };
    }
}

// Register new user
async function registerUser(email, password) {
    try {
        initializeFirebase();
        await auth.createUserWithEmailAndPassword(email, password);
        return true;
    } catch (error) {
        console.error("Error registering:", error);
        return { error: error.message };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        initializeFirebase();
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        return true;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        return { error: error.message };
    }
}

// Sign out
async function signOut() {
    try {
        initializeFirebase();
        await auth.signOut();
        return true;
    } catch (error) {
        console.error("Error signing out:", error);
        return false;
    }
}

// Initialize Firebase on page load
initializeFirebase();
