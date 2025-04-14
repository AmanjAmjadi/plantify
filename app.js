// Global variables
let garden = [];
let currentPlant = null;
let selectedPlantId = null;
let stream = null;
let hasSeenWelcome = false;
let isProcessingImage = false;
let syncInProgress = false;
let lastSyncTime = null;

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
    // Hide any existing notification first
    notification.classList.remove('show');
    
    // Small delay to ensure CSS transition works
    setTimeout(() => {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }, 100);
}

function switchTab(tabId) {
    // Clean up camera if switching from identify tab
    if (tabId !== 'identify' && stream) {
        stopCamera();
    }
    
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

    // Special actions for certain tabs
    if (tabId === 'account') {
        updateAccountTabUI();
    }
}

// Update UI for the account tab
function updateAccountTabUI() {
    // Update sync status if logged in
    if (auth?.currentUser && document.getElementById('sync-status')) {
        if (lastSyncTime) {
            const timeDiff = Math.floor((Date.now() - lastSyncTime) / 60000); // in minutes
            if (timeDiff < 1) {
                document.getElementById('sync-status').textContent = 'Just synced';
                document.getElementById('sync-status').className = 'text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full';
            } else if (timeDiff < 60) {
                document.getElementById('sync-status').textContent = `Synced ${timeDiff}m ago`;
                document.getElementById('sync-status').className = 'text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full';
            } else {
                document.getElementById('sync-status').textContent = `Synced ${Math.floor(timeDiff/60)}h ago`;
                document.getElementById('sync-status').className = 'text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full';
            }
        } else {
            document.getElementById('sync-status').textContent = 'Not synced';
            document.getElementById('sync-status').className = 'text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full';
        }
    }
}

// Generate a unique ID for plants
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Camera and image functions
async function startCamera() {
    try {
        // First check if media devices are supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera access is not supported in this browser');
        }
        
        // Request camera access with better error handling
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
        
        // More descriptive error messages based on error type
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            showNotification("Camera access denied. Please enable camera permissions in your browser settings.", 5000);
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            showNotification("No camera found on this device.", 3000);
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            showNotification("Camera is in use by another application.", 3000);
        } else if (err.name === 'OverconstrainedError') {
            showNotification("Camera cannot meet the requested constraints.", 3000);
        } else {
            showNotification("Error accessing camera: " + (err.message || "Unknown error"), 3000);
        }
        
        // Show file upload option more prominently when camera fails
        document.querySelector('.custom-file-upload').classList.add('animate-pulse');
        setTimeout(() => {
            document.querySelector('.custom-file-upload').classList.remove('animate-pulse');
        }, 2000);
        
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
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    
    // Check for valid video dimensions
    if (!videoWidth || !videoHeight) {
        showNotification("Unable to capture image. Please try again.");
        return;
    }
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
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
    
    // Clear the upload input for future uploads
    event.target.value = '';
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) { // Larger than 10MB
        showNotification("Image is too large. Please choose an image smaller than 10MB.");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Setup canvas for uploaded image
            const canvas = capturedPhoto;
            
            // Resize large images to prevent memory issues
            let width = img.width;
            let height = img.height;
            
            // Max dimension 1600px for performance
            const maxDimension = 1600;
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = height * (maxDimension / width);
                    width = maxDimension;
                } else {
                    width = width * (maxDimension / height);
                    height = maxDimension;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Display canvas and hide camera button
            canvas.classList.remove('hidden');
            cameraContainer.classList.add('hidden');
            
            // Process the uploaded image
            processImage(canvas);
        };
        img.onerror = function() {
            showNotification("Unable to load image. Please try another file.");
        };
        img.src = e.target.result;
    };
    reader.onerror = function() {
        showNotification("Error reading file. Please try another image.");
    };
    reader.readAsDataURL(file);
}

// Process image using Gemini API
async function processImage(canvas) {
    // Prevent multiple processing requests
    if (isProcessingImage) {
        return;
    }
    
    isProcessingImage = true;
    document.getElementById('identificationResults').classList.remove('hidden');
    document.getElementById('loadingIdentification').classList.remove('hidden');
    document.getElementById('identificationContent').classList.add('hidden');
    
    // Hide any previous error state
    if (document.getElementById('identificationError')) {
        document.getElementById('identificationError').classList.add('hidden');
    }
    
    try {
        // Get image data from canvas
        const imageData = canvas.toDataURL('image/jpeg', 0.85); // Compress to 85% quality
        
        // Call Gemini API to identify plant
        const plantData = await identifyPlantWithGemini(imageData);
        
        // Create plant object
        currentPlant = {
            id: generateId(),
            commonName: plantData.commonName,
            scientificName: plantData.scientificName,
            info: plantData.description,
            image: canvas.toDataURL('image/jpeg', 0.7), // Compress further for storage
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
            
            // Customize error message based on error type
            let errorMessage = "We couldn't identify this plant.";
            if (error.message && error.message.includes('API key')) {
                errorMessage = "API key error. Please check your Gemini API key in the Account tab.";
            } else if (error.message && error.message.includes('network')) {
                errorMessage = "Network error. Please check your internet connection.";
            } else if (error.message && error.message.includes('quota')) {
                errorMessage = "API quota exceeded. Try again later or use your own API key.";
            }
            
            errorDiv.innerHTML = `
                <div class="text-red-500 text-5xl mb-3">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Identification Failed</h3>
                <p id="errorMessage" class="text-gray-600 dark:text-gray-300 mb-4">
                    ${errorMessage}
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
            
            // Update error message based on error type
            let errorMessage = "We couldn't identify this plant.";
            if (error.message && error.message.includes('API key')) {
                errorMessage = "API key error. Please check your Gemini API key in the Account tab.";
            } else if (error.message && error.message.includes('network')) {
                errorMessage = "Network error. Please check your internet connection.";
            } else if (error.message && error.message.includes('quota')) {
                errorMessage = "API quota exceeded. Try again later or use your own API key.";
            }
            
            document.getElementById('errorMessage').textContent = errorMessage;
        }
    } finally {
        isProcessingImage = false;
    }
}

// Create a fallback plant when offline
function createFallbackPlant(canvas) {
    // Create a generic plant object with more reasonable defaults
    const sunlightLevels = [3, 4, 6, 8]; // Hours for low, medium-low, medium, high
    const waterIntervals = [3, 7, 14, 21]; // Days for frequent, average, infrequent, very infrequent
    
    currentPlant = {
        id: generateId(),
        commonName: "Unknown Plant",
        scientificName: "Species unknown",
        info: "This appears to be a plant with green foliage. For proper care, keep soil moderately moist and place in indirect light. Water when the top inch of soil feels dry.",
        image: canvas.toDataURL('image/jpeg', 0.7), // Compress for storage
        waterDays: waterIntervals[1], // Default to average watering (7 days)
        sunlightHours: sunlightLevels[1]  // Default to medium-low light (4 hours)
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
        console.error("Error loading plant details:", error);
        
        // Create more helpful error message
        const searchError = document.createElement('div');
        searchError.className = 'text-center py-6';
        searchError.innerHTML = `
            <div class="text-red-500 text-3xl mb-3">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">Couldn't Load Plant Details</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
                There was a problem connecting to the plant database.
            </p>
            <button id="retrySearch" class="btn-primary">
                <i class="fas fa-redo mr-2"></i>Retry
            </button>
        `;
        
        document.getElementById('searchContent').innerHTML = '';
        document.getElementById('searchContent').appendChild(searchError);
        document.getElementById('searchContent').classList.remove('hidden');
        
        // Add retry button functionality
        document.getElementById('retrySearch').addEventListener('click', () => {
            getAndDisplayPlantDetails(speciesKey);
        });
        
        showNotification("Error loading plant details. Please check your internet connection.");
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
    
    // Check if the plant image is very large and resize if needed
    if (newPlant.image && newPlant.image.length > 200000) { // Over ~200KB
        try {
            const img = new Image();
            img.src = newPlant.image;
            await new Promise(resolve => {
                img.onload = resolve;
                // Set a timeout in case image doesn't load
                setTimeout(resolve, 2000);
            });

            const canvas = document.createElement('canvas');
            // Resize to maximum 600px width/height while preserving aspect ratio
            const maxDimension = 600;
            let width = img.width;
            let height = img.height;
            
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = height * (maxDimension / width);
                    width = maxDimension;
                } else {
                    width = width * (maxDimension / height);
                    height = maxDimension;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 70% quality
            newPlant.image = canvas.toDataURL('image/jpeg', 0.7);
        } catch (e) {
            console.error("Error resizing plant image:", e);
            // Keep original image if resize fails
        }
    }
    
    garden.push(newPlant);
    
    // Save changes
    try {
        // If user is logged in, save directly to cloud
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
    } catch (error) {
        console.error("Error saving plant to garden:", error);
        showNotification("Error saving to garden. Please try again.");
        
        // Remove the plant from the array if save failed
        garden = garden.filter(p => p.id !== newPlant.id);
    }
}

async function removeFromGarden(plantId) {
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plantName = garden[plantIndex].commonName;
        
        // Keep a copy in case save fails
        const removedPlant = garden[plantIndex];
        const originalGarden = [...garden];
        
        // Remove from array
        garden.splice(plantIndex, 1);
        
        try {
            // If user is logged in, save directly to cloud
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
        } catch (error) {
            console.error("Error removing plant:", error);
            
            // Restore garden if save failed
            garden = originalGarden;
            showNotification("Error removing plant. Please try again.");
        }
    }
}

async function waterPlant(plantId) {
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plant = garden[plantIndex];
        const now = new Date();
        
        // Keep a backup in case save fails
        const originalPlant = { ...plant };
        
        // Update plant data
        plant.lastWatered = now.toISOString();
        plant.nextWater = new Date(now.getTime() + (plant.waterInterval * 24 * 60 * 60 * 1000)).toISOString();
        
        try {
            // If user is logged in, save directly to cloud
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
        } catch (error) {
            console.error("Error updating plant water status:", error);
            
            // Restore original data if save failed
            Object.assign(plant, originalPlant);
            showNotification("Error updating plant status. Please try again.");
        }
    }
}

function renderGarden() {
    const gardenContent = document.getElementById('gardenContent');
    const emptyGarden = document.getElementById('emptyGarden');
    
    if (!gardenContent || !emptyGarden) return;
    
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
        
        // Check if the plant needs water
        const needsWater = nextWater < now;
        const waterStatusClass = needsWater ? 'text-red-500 font-semibold' : '';
        
        plantCard.innerHTML = `
            <div class="relative">
                <img src="${plant.image}" alt="${plant.commonName}" class="w-full h-32 object-cover">
                ${needsWater ? '<div class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"><i class="fas fa-tint"></i></div>' : ''}
            </div>
            <div class="p-3">
                <h3 class="font-semibold truncate">${plant.commonName}</h3>
                <div class="mt-2">
                    <div class="flex justify-between text-xs mb-1">
                        <span>Water</span>
                        <span class="${waterStatusClass}">${nextWater < now ? 'Needs water!' : timeDifference(nextWater)}</span>
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
    
    if (!careContent || !emptyCare) return;
    
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
    
    // Add body class to prevent scrolling background
    document.body.classList.add('modal-open');
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
    
    // Update water status with appropriate styling
    const waterStatus = document.getElementById('modalWaterStatus');
    waterStatus.textContent = nextWater < now ? 'Needs water now!' : `Water in ${timeDifference(nextWater)}`;
    
    if (nextWater < now) {
        waterStatus.className = 'text-red-500 font-semibold';
    } else {
        waterStatus.className = '';
    }
    
    document.getElementById('modalWaterProgress').style.width = `${waterProgress}%`;
    
    document.getElementById('modalSunlightStatus').textContent = 
        `Needs ${plant.sunlightHours} hours of sunlight per day`;
    document.getElementById('modalSunProgress').style.width = `${sunProgress}%`;
}

function closePlantDetailModal() {
    selectedPlantId = null;
    plantDetailModal.classList.add('hidden');
    
    // Remove body class to allow scrolling
    document.body.classList.remove('modal-open');
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
async function showWelcomeMessage() {
    // Check if the user has seen the welcome message before
    if (await loadSetting('hasSeenWelcome', false)) {
        hasSeenWelcome = true;
        return;
    }
    
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
    
    // Show loading state
    const button = document.getElementById('sign-in-button');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Signing in...';
    
    try {
        initializeFirebase();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        showNotification("Signed in successfully!");
        
        // Update last sync time
        lastSyncTime = Date.now();
        await saveSetting('lastSyncTime', lastSyncTime);
        
        // Switch to garden tab
        switchTab('garden');
    } catch (error) {
        console.error("Sign in error:", error);
        
        // More helpful error messages
        if (error.code === 'auth/user-not-found') {
            showNotification("No account found with this email. Please register first.");
        } else if (error.code === 'auth/wrong-password') {
            showNotification("Incorrect password. Please try again.");
        } else if (error.code === 'auth/too-many-requests') {
            showNotification("Too many failed attempts. Please try again later.");
        } else if (error.code === 'auth/network-request-failed') {
            showNotification("Network error. Please check your internet connection.");
        } else {
            showNotification(error.message || "Error signing in");
        }
    } finally {
        // Restore button state
        button.disabled = false;
        button.innerHTML = originalText;
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
    
    // Show loading state
    const button = document.getElementById('register-button');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Creating account...';
    
    try {
        initializeFirebase();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Send email verification
        if (userCredential.user) {
            await userCredential.user.sendEmailVerification();
            showNotification("Account created! Please check your email for verification.", 5000);
        } else {
            showNotification("Account created successfully!");
        }
        
        // Update last sync time
        lastSyncTime = Date.now();
        await saveSetting('lastSyncTime', lastSyncTime);
        
        // Switch to garden tab
        switchTab('garden');
    } catch (error) {
        console.error("Registration error:", error);
        
        // More helpful error messages
        if (error.code === 'auth/email-already-in-use') {
            showNotification("This email is already registered. Try signing in instead.");
        } else if (error.code === 'auth/invalid-email') {
            showNotification("Invalid email format. Please enter a valid email address.");
        } else if (error.code === 'auth/network-request-failed') {
            showNotification("Network error. Please check your internet connection.");
        } else {
            showNotification(error.message || "Registration failed");
        }
    } finally {
        // Restore button state
        button.disabled = false;
        button.innerHTML = originalText;
    }
});

document.getElementById('google-sign-in')?.addEventListener('click', async () => {
    try {
        // Show loading state
        const button = document.getElementById('google-sign-in');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Connecting...';
        
        await initializeFirebase();
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        if (result.user) {
            showNotification("Signed in with Google successfully!");
            
            // Update last sync time
            lastSyncTime = Date.now();
            await saveSetting('lastSyncTime', lastSyncTime);
            
            switchTab('garden');
        }
    } catch (error) {
        console.error("Google sign-in error:", error);
        
        // Show a special message for popup blocked errors
        if (error.code === 'auth/popup-blocked') {
            showNotification("Popup was blocked. Please allow popups for this site.", 5000);
        } else if (error.code === 'auth/cancelled-popup-request') {
            showNotification("Sign-in was cancelled.");
        } else if (error.code === 'auth/popup-closed-by-user') {
            showNotification("Sign-in popup was closed before completing the process.");
        } else if (error.code === 'auth/network-request-failed') {
            showNotification("Network error. Please check your internet connection.");
        } else {
            showNotification("Google sign-in failed: " + (error.message || "Unknown error"));
        }
    } finally {
        // Restore button state
        if (document.getElementById('google-sign-in')) {
            document.getElementById('google-sign-in').disabled = false;
            document.getElementById('google-sign-in').innerHTML = '<i class="fab fa-google mr-2"></i> Google';
        }
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
        // Show loading state
        const button = document.getElementById('sign-out-button');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Signing out...';
        
        initializeFirebase();
        await auth.signOut();
        
        // Clear last sync time
        lastSyncTime = null;
        await saveSetting('lastSyncTime', null);
        
        showNotification("Signed out successfully!");
        
        // Update UI
        document.getElementById('not-logged-in').classList.remove('hidden');
        document.getElementById('logged-in').classList.add('hidden');
        
        // Refresh the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (error) {
        console.error("Sign out error:", error);
        showNotification("Error signing out: " + (error.message || "Unknown error"));
        
        // Restore button state
        if (document.getElementById('sign-out-button')) {
            document.getElementById('sign-out-button').disabled = false;
            document.getElementById('sign-out-button').innerHTML = originalText;
        }
    }
});

document.getElementById('sync-now-btn')?.addEventListener('click', async () => {
    // Prevent multiple sync operations
    if (syncInProgress) {
        showNotification("Sync already in progress");
        return;
    }
    
    // Show loading state
    const button = document.getElementById('sync-now-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i> Syncing...';
    syncInProgress = true;
    
    try {
        const syncResult = await syncWithCloud();
        
        // Update last sync time
        lastSyncTime = Date.now();
        await saveSetting('lastSyncTime', lastSyncTime);
        
        // Update sync status in UI
        document.getElementById('sync-status').textContent = 'Just synced';
        document.getElementById('sync-status').className = 'text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full';
        
        if (syncResult.error) {
            showNotification("Sync issue: " + syncResult.error);
        } else if (syncResult.status === 'downloaded') {
            showNotification("Sync complete - Downloaded data from cloud");
        } else if (syncResult.status === 'uploaded') {
            showNotification("Sync complete - Uploaded data to cloud");
        } else {
            showNotification("Sync complete");
        }
    } catch (error) {
        console.error("Sync error:", error);
        showNotification("Sync failed: " + (error.message || "Unknown error"));
    } finally {
        // Restore button state
        button.innerHTML = originalText;
        syncInProgress = false;
    }
});

document.getElementById('export-garden-btn')?.addEventListener('click', () => {
    if (garden.length === 0) {
        showNotification("Your garden is empty. Nothing to export.");
        return;
    }
    
    try {
        // Create JSON data for download with metadata
        const exportData = {
            exportDate: new Date().toISOString(),
            appVersion: "1.0",
            gardenData: garden
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'plantify-garden.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification("Garden data exported successfully");
    } catch (error) {
        console.error("Export error:", error);
        showNotification("Export failed: " + (error.message || "Unknown error"));
    }
});

document.getElementById('clear-data-btn')?.addEventListener('click', async () => {
    if (garden.length === 0) {
        showNotification("Your garden is already empty.");
        return;
    }
    
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
        try {
            const count = garden.length;
            garden = [];
            await saveGarden(garden);
            renderGarden();
            renderCare();
            showNotification(`Local data cleared (${count} plants removed)`);
        } catch (error) {
            console.error("Clear data error:", error);
            showNotification("Error clearing data: " + (error.message || "Unknown error"));
        }
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
    
    // Show loading state
    const button = document.getElementById('save-api-key');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Saving...';
    
    try {
        // Test the API key with a simple request
        const testUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
        const testData = {
            contents: [{ parts: [{ text: "Hello" }] }],
            generation_config: { maxOutputTokens: 1 }
        };
        
        const testResponse = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        if (!testResponse.ok) {
            const errorData = await testResponse.json();
            throw new Error(errorData.error.message || "Invalid API key");
        }
        
        // If test passed, save the key
        const success = await setApiKey(key);
        
        if (success) {
            showNotification("API key saved and verified successfully");
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
    } catch (error) {
        console.error("API key verification error:", error);
        showNotification("API key verification failed: " + (error.message || "Unknown error"));
    } finally {
        // Restore button state
        button.disabled = false;
        button.innerHTML = originalText;
    }
});

document.getElementById('reset-api-key')?.addEventListener('click', async () => {
    try {
        // Show loading state
        const button = document.getElementById('reset-api-key');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Resetting...';
        
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
        } else {
            showNotification("Failed to reset API key");
        }
    } catch (error) {
        console.error("API key reset error:", error);
        showNotification("Error resetting API key: " + (error.message || "Unknown error"));
    } finally {
        // Restore button state
        if (document.getElementById('reset-api-key')) {
            document.getElementById('reset-api-key').disabled = false;
            document.getElementById('reset-api-key').innerHTML = originalText;
        }
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

startCameraButton?.addEventListener('click', startCamera);
captureButton?.addEventListener('click', captureImage);
imageUpload?.addEventListener('change', handleImageUpload);

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

searchInput?.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) {
        searchResults.classList.add('hidden');
        return;
    }
    
    try {
        const results = await searchPlantsByName(query);
        displaySearchResults(results);
    } catch (error) {
        console.error("Search error:", error);
        showNotification("Error searching plants. Please check your internet connection.");
    }
});

searchButton?.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query.length < 3) {
        showNotification("Please enter at least 3 characters to search");
        return;
    }
    
    try {
        // Show loading state
        const button = searchButton;
        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        
        const results = await searchPlantsByName(query);
        displaySearchResults(results);
    } catch (error) {
        console.error("Search error:", error);
        showNotification("Error searching plants. Please check your internet connection.");
    } finally {
        // Restore button state
        if (searchButton) {
            searchButton.disabled = false;
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
        }
    }
});

document.addEventListener('click', (e) => {
    // Close search results when clicking outside
    if (searchInput && searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

addToGardenButton?.addEventListener('click', () => {
    if (currentPlant) {
        addToGarden(currentPlant);
    }
});

searchAddToGardenButton?.addEventListener('click', () => {
    if (currentPlant) {
        addToGarden(currentPlant);
    }
});

closeModalButton?.addEventListener('click', closePlantDetailModal);

modalWaterButton?.addEventListener('click', () => {
    if (selectedPlantId) {
        waterPlant(selectedPlantId);
    }
});

modalRemoveButton?.addEventListener('click', () => {
    if (selectedPlantId) {
        removeFromGarden(selectedPlantId);
    }
});

// Handle modal backdrop click to close
plantDetailModal?.addEventListener('click', (e) => {
    if (e.target === plantDetailModal) {
        closePlantDetailModal();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !plantDetailModal.classList.contains('hidden')) {
        closePlantDetailModal();
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
    try {
        // Load API key from storage
        await initApiKey();
        
        // Load last sync time
        lastSyncTime = await loadSetting('lastSyncTime', null);
        
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
                        
                        // Update last sync time
                        lastSyncTime = Date.now();
                        await saveSetting('lastSyncTime', lastSyncTime);
                    } else {
                        // If no cloud data, but user has local data, push to cloud
                        garden = await loadGarden();
                        if (garden.length > 0) {
                            await saveToCloud();
                            
                            // Update last sync time
                            lastSyncTime = Date.now();
                            await saveSetting('lastSyncTime', lastSyncTime);
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
        
        // Show welcome message for first-time users
        if (!hasSeenWelcome && !auth?.currentUser) {
            setTimeout(showWelcomeMessage, 1000);
        } else {
            // Show welcome notification instead
            setTimeout(() => {
                showNotification("Welcome to Plantify! Identify and manage your plants with ease.");
            }, 1000);
        }
    } catch (error) {
        console.error("App initialization error:", error);
        
        // Show error notification only after a delay
        setTimeout(() => {
            showNotification("There was an error initializing the app. Some features may not work correctly.");
        }, 1500);
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
