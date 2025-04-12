// Global variables
let garden = [];
let currentPlant = null;
let selectedPlantId = null;
let stream = null;
let hasSeenWelcome = false;

// DOM elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const themeToggle = document.getElementById('theme-toggle');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const startCameraButton = document.getElementById('startCameraButton');
const cameraContainer = document.getElementById('camera-container');
const captureButton = document.getElementById('captureButton');
const videoElement = document.getElementById('videoElement');
const capturedPhoto = document.getElementById('capturedPhoto');
const imageUpload = document.getElementById('imageUpload');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const addToGardenButton = document.getElementById('addToGardenButton');
const searchAddToGardenButton = document.getElementById('searchAddToGardenButton');
const closeModalButton = document.getElementById('closeModal');
const plantDetailModal = document.getElementById('plantDetailModal');
const modalWaterButton = document.getElementById('modalWaterButton');
const modalRemoveButton = document.getElementById('modalRemoveButton');

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Listen for changes in color scheme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (!localStorage.getItem('theme')) {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});

// Utility functions
function showNotification(message, duration = 3000) {
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

function switchTab(tabId) {
    // Update active tab button
    tabs.forEach(tab => {
        if (tab.id === `tab-${tabId}`) {
            tab.classList.add('text-primary-color');
        } else {
            tab.classList.remove('text-primary-color');
        }
    });
    
    // Show active tab content
    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Generate a unique ID for plants
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Camera and image functions
async function startCamera() {
    try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        // Show camera container and video
        videoElement.srcObject = stream;
        cameraContainer.classList.remove('hidden');
        startCameraButton.classList.add('hidden');
        capturedPhoto.classList.add('hidden');
        
        return true;
    } catch (err) {
        console.error("Error accessing camera:", err);
        showNotification("Error accessing camera. Please check permissions.");
        return false;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        videoElement.srcObject = null;
    }
    cameraContainer.classList.add('hidden');
    startCameraButton.classList.remove('hidden');
}

function captureImage() {
    if (!stream) return;
    
    // Setup canvas for capturing
    const canvas = capturedPhoto;
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Stop the camera and display captured photo
    stopCamera();
    canvas.classList.remove('hidden');
    
    // Process the captured image
    processImage(canvas);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.match('image.*')) {
        showNotification("Please select a valid image file");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Setup canvas for uploaded image
            const canvas = capturedPhoto;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Display canvas and hide camera button
            canvas.classList.remove('hidden');
            cameraContainer.classList.add('hidden');
            
            // Process the uploaded image
            processImage(canvas);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Process image using Gemini API
async function processImage(canvas) {
    document.getElementById('identificationResults').classList.remove('hidden');
    document.getElementById('loadingIdentification').classList.remove('hidden');
    document.getElementById('identificationContent').classList.add('hidden');
    
    // Hide any previous error state
    if (document.getElementById('identificationError')) {
        document.getElementById('identificationError').classList.add('hidden');
    }
    
    try {
        // Get image data from canvas
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Call Gemini API to identify plant
        const plantData = await identifyPlantWithGemini(imageData);
        
        // Create plant object
        currentPlant = {
            id: generateId(),
            commonName: plantData.commonName,
            scientificName: plantData.scientificName,
            info: plantData.description,
            image: canvas.toDataURL('image/jpeg'),
            waterDays: plantData.waterDays,
            sunlightHours: plantData.sunlightHours
        };
        
        // Update identification results
        document.getElementById('identifiedPlantName').textContent = currentPlant.commonName;
        document.getElementById('identifiedPlantScientific').textContent = currentPlant.scientificName;
        document.getElementById('identifiedPlantInfo').innerHTML = currentPlant.info;
        document.getElementById('identifiedPlantImage').src = currentPlant.image;
        
        // Enable add to garden button
        document.getElementById('addToGardenButton').disabled = false;
        document.getElementById('addToGardenButton').classList.remove('opacity-50');
        
        // Hide loading and show results
        document.getElementById('loadingIdentification').classList.add('hidden');
        document.getElementById('identificationContent').classList.remove('hidden');
        
    } catch (error) {
        console.error("Error identifying plant:", error);
        
        // Show error interface
        document.getElementById('loadingIdentification').classList.add('hidden');
        
        // Create error section if it doesn't exist
        if (!document.getElementById('identificationError')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'identificationError';
            errorDiv.className = 'text-center py-10';
            errorDiv.innerHTML = `
                <div class="text-red-500 text-5xl mb-3">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Identification Failed</h3>
                <p id="errorMessage" class="text-gray-600 dark:text-gray-300 mb-4">
                    We couldn't identify this plant due to a connection issue.
                </p>
                <div class="flex justify-center gap-4">
                    <button id="retryIdentification" class="btn-primary">
                        <i class="fas fa-redo mr-2"></i>Retry
                    </button>
                    <button id="offlineIdentification" class="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border">
                        <i class="fas fa-leaf mr-2"></i>Continue Offline
                    </button>
                </div>
                <p class="text-sm text-gray-500 mt-4">
                    <i class="fas fa-info-circle mr-1"></i>
                    If you're having trouble, try checking your internet connection or using a VPN.
                </p>
            `;
            document.getElementById('identificationResults').appendChild(errorDiv);
            
            // Add event listeners to new buttons
            document.getElementById('retryIdentification').addEventListener('click', () => {
                // Retry identification with current image
                processImage(capturedPhoto);
            });
            
            document.getElementById('offlineIdentification').addEventListener('click', () => {
                // Create offline fallback plant
                createFallbackPlant(capturedPhoto);
            });
        } else {
            // Show existing error interface
            document.getElementById('identificationError').classList.remove('hidden');
            document.getElementById('errorMessage').textContent = "We couldn't identify this plant due to a connection issue.";
        }
    }
}

// Create a fallback plant when offline
function createFallbackPlant(canvas) {
    // Create a generic plant object
    currentPlant = {
        id: generateId(),
        commonName: "Unknown Plant",
        scientificName: "Species unknown",
        info: "This appears to be a plant with green foliage. For proper care, keep soil moderately moist and place in indirect light. Water when the top inch of soil feels dry.",
        image: canvas.toDataURL('image/jpeg'),
        waterDays: 7,
        sunlightHours: 6
    };
    
    // Update identification results
    document.getElementById('identifiedPlantName').textContent = currentPlant.commonName;
    document.getElementById('identifiedPlantScientific').textContent = currentPlant.scientificName;
    document.getElementById('identifiedPlantInfo').innerHTML = currentPlant.info;
    document.getElementById('identifiedPlantImage').src = currentPlant.image;
    
    // Enable add to garden button
    document.getElementById('addToGardenButton').disabled = false;
    document.getElementById('addToGardenButton').classList.remove('opacity-50');
    
    // Hide error and show results
    document.getElementById('identificationError').classList.add('hidden');
    document.getElementById('identificationContent').classList.remove('hidden');
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'search-result-item';
        noResults.textContent = 'No plants found';
        searchResults.appendChild(noResults);
    } else {
        results.forEach(plant => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.textContent = plant.commonName;
            resultItem.addEventListener('click', () => {
                searchResults.classList.add('hidden');
                getAndDisplayPlantDetails(plant.key);
            });
            searchResults.appendChild(resultItem);
        });
    }
    
    searchResults.classList.remove('hidden');
}

async function getAndDisplayPlantDetails(speciesKey) {
    document.getElementById('searchLoading').classList.remove('hidden');
    document.getElementById('searchContent').classList.add('hidden');
    
    try {
        // Get plant details from GBIF API
        currentPlant = await getPlantDetails(speciesKey);
        
        // Update search results
        document.getElementById('searchPlantName').textContent = currentPlant.commonName;
        document.getElementById('searchPlantScientific').textContent = currentPlant.scientificName;
        document.getElementById('searchPlantInfo').textContent = currentPlant.info;
        document.getElementById('searchPlantImage').src = currentPlant.image;
        
        document.getElementById('searchContent').classList.remove('hidden');
    } catch (error) {
        showNotification("Error loading plant details. Please try again.");
    } finally {
        document.getElementById('searchLoading').classList.add('hidden');
    }
}

// Garden management functions
async function addToGarden(plant) {
    // Check if plant already exists in garden
    const existingIndex = garden.findIndex(p => p.id === plant.id);
    
    if (existingIndex >= 0) {
        showNotification(`${plant.commonName} is already in your garden!`);
        return;
    }
    
    // Add water and sun tracking
    const now = new Date();
    const newPlant = {
        ...plant,
        id: plant.id || generateId(),
        added: now.toISOString(),
        lastWatered: now.toISOString(),
        nextWater: new Date(now.getTime() + (plant.waterDays * 24 * 60 * 60 * 1000)).toISOString(),
        waterInterval: plant.waterDays, // in days
        sunlightNeeded: plant.sunlightHours // hours per day
    };
    
    garden.push(newPlant);
    
    // If user is logged in, save directly to cloud
    // Otherwise save to IndexedDB
    if (auth?.currentUser) {
        await saveToCloud();
    } else {
        await saveGarden(garden);
    }
    
    // Update UI
    renderGarden();
    renderCare();
    
    showNotification(`${plant.commonName} added to your garden!`);
    
    // Switch to garden tab
    switchTab('garden');
}

async function removeFromGarden(plantId) {
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plantName = garden[plantIndex].commonName;
        garden.splice(plantIndex, 1);
        
        // If user is logged in, save directly to cloud
        // Otherwise save to IndexedDB
        if (auth?.currentUser) {
            await saveToCloud();
        } else {
            await saveGarden(garden);
        }
        
        // Update UI
        renderGarden();
        renderCare();
        
        showNotification(`${plantName} removed from your garden.`);
        
        // Close modal
        closePlantDetailModal();
    }
}

async function waterPlant(plantId) {
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plant = garden[plantIndex];
        const now = new Date();
        
        plant.lastWatered = now.toISOString();
        plant.nextWater = new Date(now.getTime() + (plant.waterInterval * 24 * 60 * 60 * 1000)).toISOString();
        
        // If user is logged in, save directly to cloud
        // Otherwise save to IndexedDB
        if (auth?.currentUser) {
            await saveToCloud();
        } else {
            await saveGarden(garden);
        }
        
        // Update UI
        renderGarden();
        renderCare();
        
        // If modal is open, update it
        if (selectedPlantId === plantId) {
            updatePlantDetailModal(plant);
        }
        
        showNotification(`${plant.commonName} has been watered!`);
    }
}

function renderGarden() {
    const gardenContent = document.getElementById('gardenContent');
    const emptyGarden = document.getElementById('emptyGarden');
    
    if (garden.length === 0) {
        gardenContent.classList.add('hidden');
        emptyGarden.classList.remove('hidden');
        return;
    }
    
    gardenContent.classList.remove('hidden');
    emptyGarden.classList.add('hidden');
    
    gardenContent.innerHTML = '';
    
    garden.forEach(plant => {
        const now = new Date();
        const lastWatered = new Date(plant.lastWatered);
        const nextWater = new Date(plant.nextWater);
        
        // Calculate water progress
        const waterTotal = plant.waterInterval * 24 * 60 * 60 * 1000; // in ms
        const waterElapsed = now - lastWatered; // in ms
        const waterProgress = Math.min(100, Math.max(0, (waterElapsed / waterTotal) * 100));
        
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.innerHTML = `
            <img src="${plant.image}" alt="${plant.commonName}" class="w-full h-32 object-cover">
            <div class="p-3">
                <h3 class="font-semibold truncate">${plant.commonName}</h3>
                <div class="mt-2">
                    <div class="flex justify-between text-xs mb-1">
                        <span>Water</span>
                        <span>${nextWater < now ? 'Needs water!' : timeDifference(nextWater)}</span>
                    </div>
                    <div class="water-progress-bar">
                        <div class="water-progress" style="width: ${waterProgress}%;"></div>
                    </div>
                </div>
            </div>
        `;
        
        plantCard.addEventListener('click', () => {
            openPlantDetailModal(plant.id);
        });
        
        gardenContent.appendChild(plantCard);
    });
}

function renderCare() {
    const careContent = document.getElementById('careContent');
    const emptyCare = document.getElementById('emptyCare');
    
    if (garden.length === 0) {
        careContent.classList.add('hidden');
        emptyCare.classList.remove('hidden');
        return;
    }
    
    const now = new Date();
    
    // Filter plants that need care soon
    const careTasks = garden
        .map(plant => {
            const nextWater = new Date(plant.nextWater);
            
            // Calculate days until watering
            const daysUntilWater = Math.ceil((nextWater - now) / (24 * 60 * 60 * 1000));
            
            return {
                plant,
                daysUntilWater
            };
        })
        .filter(task => task.daysUntilWater <= 3) // Show tasks coming up in the next 3 days
        .sort((a, b) => a.daysUntilWater - b.daysUntilWater);
    
    if (careTasks.length === 0) {
        careContent.classList.add('hidden');
        emptyCare.classList.remove('hidden');
        emptyCare.innerHTML = `
            <i class="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
            <p class="text-gray-600 dark:text-gray-300">All your plants are taken care of! Check back later for care reminders.</p>
        `;
        return;
    }
    
    careContent.classList.remove('hidden');
    emptyCare.classList.add('hidden');
    
    careContent.innerHTML = '';
    
    careTasks.forEach(task => {
        const { plant, daysUntilWater } = task;
        
        const taskCard = document.createElement('div');
        taskCard.className = 'card p-4';
        
        let statusText, statusClass;
        
        if (daysUntilWater < 0) {
            statusText = `Overdue by ${Math.abs(daysUntilWater)} day${Math.abs(daysUntilWater) !== 1 ? 's' : ''}`;
            statusClass = 'text-red-500';
        } else if (daysUntilWater === 0) {
            statusText = 'Due today';
            statusClass = 'text-yellow-500';
        } else {
            statusText = `In ${daysUntilWater} day${daysUntilWater !== 1 ? 's' : ''}`;
            statusClass = 'text-blue-500';
        }
        
        taskCard.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${plant.image}" alt="${plant.commonName}" class="w-16 h-16 rounded-full object-cover">
                <div class="flex-1">
                    <h3 class="font-semibold">${plant.commonName}</h3>
                    <div class="flex items-center mt-1">
                        <i class="fas fa-tint text-blue-500 mr-2"></i>
                        <span>Water <span class="${statusClass}">${statusText}</span></span>
                    </div>
                </div>
                <button class="water-plant-btn p-2 bg-blue-100 dark:bg-blue-900 rounded-full" data-id="${plant.id}">
                    <i class="fas fa-tint text-blue-500"></i>
                </button>
            </div>
        `;
        
        const waterButton = taskCard.querySelector('.water-plant-btn');
        waterButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening the modal
            waterPlant(plant.id);
        });
        
        taskCard.addEventListener('click', () => {
            openPlantDetailModal(plant.id);
        });
        
        careContent.appendChild(taskCard);
    });
}

// Modal functions
function openPlantDetailModal(plantId) {
    const plant = garden.find(p => p.id === plantId);
    if (!plant) return;
    
    selectedPlantId = plantId;
    updatePlantDetailModal(plant);
    plantDetailModal.classList.remove('hidden');
}

function updatePlantDetailModal(plant) {
    const now = new Date();
    const lastWatered = new Date(plant.lastWatered);
    const nextWater = new Date(plant.nextWater);
    
    // Calculate water progress
    const waterTotal = plant.waterInterval * 24 * 60 * 60 * 1000; // in ms
    const waterElapsed = now - lastWatered; // in ms
    const waterProgress = Math.min(100, Math.max(0, (waterElapsed / waterTotal) * 100));
    
    // Calculate sun progress (simplified)
    const sunProgress = 50; // This would be calculated based on actual sunlight data
    
    document.getElementById('modalPlantName').textContent = plant.commonName;
    document.getElementById('modalPlantScientific').textContent = plant.scientificName;
    document.getElementById('modalPlantInfo').textContent = plant.info;
    document.getElementById('modalPlantImage').src = plant.image;
    
    document.getElementById('modalWaterStatus').textContent = 
        nextWater < now ? 'Needs water now!' : `Water in ${timeDifference(nextWater)}`;
    document.getElementById('modalWaterProgress').style.width = `${waterProgress}%`;
    
    document.getElementById('modalSunlightStatus').textContent = 
        `Needs ${plant.sunlightHours} hours of sunlight per day`;
    document.getElementById('modalSunProgress').style.width = `${sunProgress}%`;
}

function closePlantDetailModal() {
    selectedPlantId = null;
    plantDetailModal.classList.add('hidden');
}

// Helper functions
function timeDifference(date) {
    const now = new Date();
    const diff = date - now;
    
    // Calculate days, hours, minutes
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days < 0) {
        return "Overdue";
    } else if (days === 0 && hours === 0) {
        return "Today";
    } else if (days === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
}

// Show welcome message for new users
function showWelcomeMessage() {
    if (hasSeenWelcome) return;
    
    // Create welcome dialog
    const welcomeDialog = document.createElement('div');
    welcomeDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    welcomeDialog.id = 'welcomeDialog';
    welcomeDialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 p-6">
            <div class="text-center mb-4">
                <i class="fas fa-seedling text-5xl text-primary-color mb-3 plant-icon"></i>
                <h2 class="text-xl font-semibold">Welcome to Plantify!</h2>
                <p class="text-gray-600 dark:text-gray-300 mt-2">Your personal plant identification and care assistant</p>
            </div>
            
            <div class="mb-4">
                <p class="mb-3">Create an account to:</p>
                <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Sync your plant collection across devices</li>
                    <li>Never lose your plant data</li>
                    <li>Get personalized care reminders</li>
                </ul>
            </div>
            
            <div class="flex gap-2">
                <button id="welcomeSignUp" class="btn-primary flex-1">Create Account</button>
                <button id="welcomeLater" class="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex-1">Later</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(welcomeDialog);
    
    // Add event listeners
    document.getElementById('welcomeSignUp').addEventListener('click', () => {
        document.body.removeChild(welcomeDialog);
        hasSeenWelcome = true;
        saveSetting('hasSeenWelcome', true);
        switchTab('account');
    });
    
    document.getElementById('welcomeLater').addEventListener('click', () => {
        document.body.removeChild(welcomeDialog);
        hasSeenWelcome = true;
        saveSetting('hasSeenWelcome', true);
    });
}

// Account tab event listeners
document.getElementById('sign-in-button')?.addEventListener('click', async () => {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    
    if (!email || !password) {
        showNotification("Please enter both email and password");
        return;
    }
    
    try {
        initializeFirebase();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        showNotification("Signed in successfully!");
        
        // Switch to garden tab
        switchTab('garden');
    } catch (error) {
        showNotification(error.message || "Error signing in");
    }
});

document.getElementById('register-button')?.addEventListener('click', async () => {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    
    if (!email || !password) {
        showNotification("Please enter both email and password");
        return;
    }
    
    if (password.length < 6) {
        showNotification("Password must be at least 6 characters");
        return;
    }
    
    try {
        initializeFirebase();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Send email verification
        if (userCredential.user) {
            await userCredential.user.sendEmailVerification();
            showNotification("Account created! Please check your email for verification.");
        } else {
            showNotification("Account created successfully!");
        }
        
        // Switch to garden tab
        switchTab('garden');
    } catch (error) {
        showNotification(error.message || "Registration failed");
    }
});

document.getElementById('google-sign-in')?.addEventListener('click', async () => {
    try {
        await initializeFirebase();
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        if (result.user) {
            showNotification("Signed in with Google successfully!");
            switchTab('garden');
        }
    } catch (error) {
        console.error("Google sign-in error:", error);
        
        // Show a special message for popup blocked errors
        if (error.code === 'auth/popup-blocked') {
            showNotification("Popup was blocked. Please allow popups for this site.");
        } else if (error.code === 'auth/cancelled-popup-request') {
            showNotification("Sign-in was cancelled.");
        } else if (error.code === 'auth/popup-closed-by-user') {
            showNotification("Sign-in popup was closed before completing the process.");
        } else {
            showNotification("Google sign-in failed: " + (error.message || "Unknown error"));
        }
        
        // Show the Google setup instructions
        document.getElementById('google-signin-setup').classList.remove('hidden');
    }
});

document.getElementById('sign-out-button')?.addEventListener('click', async () => {
    // Ask if the user wants to keep local data
    if (garden.length > 0) {
        if (confirm("Would you like to clear your plant data from this device?\n\nYes - Clear data\nNo - Keep data")) {
            // Clear local data
            garden = [];
            await saveGarden([]);
            renderGarden();
            renderCare();
        }
    }
    
    try {
        initializeFirebase();
        await auth.signOut();
        showNotification("Signed out successfully!");
        
        // Update UI
        document.getElementById('not-logged-in').classList.remove('hidden');
        document.getElementById('logged-in').classList.add('hidden');
        
        // Refresh the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (error) {
        showNotification("Error signing out: " + (error.message || "Unknown error"));
    }
});

document.getElementById('sync-now-btn')?.addEventListener('click', async () => {
    const syncResult = await syncWithCloud();
    if (syncResult.error) {
        showNotification("Sync failed: " + syncResult.error);
    } else {
        showNotification("Sync complete");
    }
});

document.getElementById('export-garden-btn')?.addEventListener('click', () => {
    // Create a JSON file for download
    const dataStr = JSON.stringify(garden, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'plantify-garden.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

document.getElementById('clear-data-btn')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
        garden = [];
        await saveGarden(garden);
        renderGarden();
        renderCare();
        showNotification("Local data cleared");
    }
});

// API key management
document.getElementById('toggle-api-key')?.addEventListener('click', () => {
    const input = document.getElementById('api-key-input');
    if (input.type === 'password') {
        input.type = 'text';
        document.getElementById('toggle-api-key').innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        document.getElementById('toggle-api-key').innerHTML = '<i class="fas fa-eye"></i>';
    }
});

document.getElementById('save-api-key')?.addEventListener('click', async () => {
    const input = document.getElementById('api-key-input');
    const key = input.value.trim();
    
    if (!key) {
        showNotification("Please enter an API key");
        return;
    }
    
    const success = await setApiKey(key);
    if (success) {
        showNotification("API key saved successfully");
        input.value = '';
        
        // Hide input field and save button
        document.getElementById('api-key-section').classList.add('hidden');
        document.getElementById('api-key-saved-message').classList.remove('hidden');
        
        // If user is logged in, also save to their account
        if (auth?.currentUser) {
            try {
                await db.collection('users').doc(auth.currentUser.uid).update({
                    geminiApiKey: key
                });
            } catch (error) {
                console.error("Error saving API key to cloud:", error);
            }
        }
    } else {
        showNotification("Failed to save API key");
    }
});

document.getElementById('reset-api-key')?.addEventListener('click', async () => {
    const success = await resetApiKey();
    if (success) {
        showNotification("Reset to default API key");
        
        // Show input field and save button again
        document.getElementById('api-key-section').classList.remove('hidden');
        document.getElementById('api-key-saved-message').classList.add('hidden');
        
        // If user is logged in, also update their account
        if (auth?.currentUser) {
            try {
                await db.collection('users').doc(auth.currentUser.uid).update({
                    geminiApiKey: null
                });
            } catch (error) {
                console.error("Error resetting API key in cloud:", error);
            }
        }
    }
});

// Google sign-in setup toggle
document.getElementById('show-google-setup')?.addEventListener('click', function() {
    const setupSection = document.getElementById('google-signin-setup');
    if (setupSection.classList.contains('hidden')) {
        setupSection.classList.remove('hidden');
        this.textContent = 'Hide Instructions';
    } else {
        setupSection.classList.add('hidden');
        this.textContent = 'Show Setup Instructions';
    }
});

// Event listeners
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.id.replace('tab-', '');
        switchTab(tabId);
    });
});

// Fixed theme toggle
document.getElementById('theme-toggle').addEventListener('click', function() {
    // Toggle dark class
    document.documentElement.classList.toggle('dark');
    
    // Save preference to localStorage
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

startCameraButton.addEventListener('click', startCamera);
captureButton.addEventListener('click', captureImage);
imageUpload.addEventListener('change', handleImageUpload);

// Search for plant after identification
document.getElementById('searchForPlantButton')?.addEventListener('click', () => {
    if (currentPlant) {
        // Fill search field with plant name and switch to search tab
        searchInput.value = currentPlant.commonName;
        switchTab('search');
        
        // Trigger search
        setTimeout(() => {
            searchButton.click();
        }, 100);
    }
});

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) {
        searchResults.classList.add('hidden');
        return;
    }
    
    try {
        const results = await searchPlantsByName(query);
        displaySearchResults(results);
    } catch (error) {
        showNotification("Error searching plants. Please try again.");
    }
});

searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query.length < 3) {
        showNotification("Please enter at least 3 characters to search");
        return;
    }
    
    try {
        const results = await searchPlantsByName(query);
        displaySearchResults(results);
    } catch (error) {
        showNotification("Error searching plants. Please try again.");
    }
});

document.addEventListener('click', (e) => {
    // Close search results when clicking outside
    if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
        searchResults?.classList.add('hidden');
    }
});

addToGardenButton.addEventListener('click', () => {
    if (currentPlant) {
        addToGarden(currentPlant);
    }
});

searchAddToGardenButton.addEventListener('click', () => {
    if (currentPlant) {
        addToGarden(currentPlant);
    }
});

closeModalButton.addEventListener('click', closePlantDetailModal);

modalWaterButton.addEventListener('click', () => {
    if (selectedPlantId) {
        waterPlant(selectedPlantId);
    }
});

modalRemoveButton.addEventListener('click', () => {
    if (selectedPlantId) {
        removeFromGarden(selectedPlantId);
    }
});

// Simulate notifications
function setupNotifications() {
    if (garden.length > 0) {
        const checkNotifications = () => {
            const now = new Date();
            const plantsNeedingWater = garden.filter(plant => {
                const nextWater = new Date(plant.nextWater);
                return nextWater <= now;
            });
            
            if (plantsNeedingWater.length > 0) {
                const plant = plantsNeedingWater[0];
                showNotification(`${plant.commonName} needs water!`, 5000);
            }
        };
        
        // Check once when the app loads
        setTimeout(checkNotifications, 5000);
        
        // Then check periodically
        setInterval(checkNotifications, 60000); // Every minute
    }
}

// Initialize the app
async function initApp() {
    // Load API key from storage
    await initApiKey();
    
    // Check if user has seen welcome message
    hasSeenWelcome = await loadSetting('hasSeenWelcome', false);
    
    // Try to initialize Firebase (silent if fails)
    try {
        await initializeFirebase();
        
        // If user is logged in, load data from cloud
        if (auth?.currentUser) {
            try {
                // Get cloud data
                const docRef = db.collection('users').doc(auth.currentUser.uid);
                const doc = await docRef.get();
                
                if (doc.exists && doc.data().garden) {
                    garden = doc.data().garden;
                } else {
                    // If no cloud data, but user has local data, push to cloud
                    garden = await loadGarden();
                    if (garden.length > 0) {
                        await saveToCloud();
                    }
                }
            } catch (error) {
                console.error("Error loading cloud data:", error);
                garden = await loadGarden();
            }
        } else {
            // Not logged in, load from IndexedDB
            garden = await loadGarden();
        }
    } catch (error) {
        console.log("Firebase not initialized, continuing with local storage only");
        garden = await loadGarden();
    }
    
    // Update API key UI based on whether custom key is set
    if (currentApiKey !== DEFAULT_API_KEY) {
        if (document.getElementById('api-key-section')) {
            document.getElementById('api-key-section').classList.add('hidden');
        }
        if (document.getElementById('api-key-saved-message')) {
            document.getElementById('api-key-saved-message').classList.remove('hidden');
        }
    } else {
        if (document.getElementById('api-key-section')) {
            document.getElementById('api-key-section').classList.remove('hidden');
        }
        if (document.getElementById('api-key-saved-message')) {
            document.getElementById('api-key-saved-message').classList.add('hidden');
        }
    }
    
    // Render initial garden and care data
    renderGarden();
    renderCare();
    
    // Setup notifications
    setupNotifications();
    
    // Hide Google setup instructions by default
    if (document.getElementById('google-signin-setup')) {
        document.getElementById('google-signin-setup').classList.add('hidden');
        document.getElementById('show-google-setup').textContent = 'Show Setup Instructions';
    }
    
    // Show welcome message for first-time users
    if (!hasSeenWelcome && !auth?.currentUser) {
        setTimeout(showWelcomeMessage, 1000);
    } else {
        // Show welcome notification instead
        setTimeout(() => {
            showNotification("Welcome to Plantify! Identify and manage your plants with ease.");
        }, 1000);
    }
}

// Start the app
initApp();
