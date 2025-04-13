// Global variables
let garden = [];
let currentPlant = null;
let selectedPlantId = null;
let stream = null;
let hasSeenWelcome = false;

// Function to safely get DOM elements with fallbacks
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found in the DOM`);
    }
    return element;
}

// Utility functions
function showNotification(message, duration = 3000) {
    const notification = getElement('notification');
    const notificationMessage = getElement('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    } else {
        console.warn("Notification elements not found:", message);
    }
}

function switchTab(tabId) {
    console.log(`Switching to tab: ${tabId}`);
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
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
        console.log("Starting camera...");
        const cameraContainer = getElement('camera-container');
        const startCameraButton = getElement('startCameraButton');
        const videoElement = getElement('videoElement');
        const capturedPhoto = getElement('capturedPhoto');
        
        if (!cameraContainer || !startCameraButton || !videoElement || !capturedPhoto) {
            throw new Error("Required camera elements not found");
        }
        
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

// Same pattern for other camera functions
async function startHealthCamera() {
    try {
        console.log("Starting health camera...");
        const cameraContainer = getElement('health-camera-container');
        const startCameraButton = getElement('startHealthCameraButton');
        const videoElement = getElement('healthVideoElement');
        const capturedPhoto = getElement('healthCapturedPhoto');
        
        if (!cameraContainer || !startCameraButton || !videoElement || !capturedPhoto) {
            throw new Error("Required health camera elements not found");
        }
        
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
        console.error("Error accessing health camera:", err);
        showNotification("Error accessing camera. Please check permissions.");
        return false;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        
        const videoElement = getElement('videoElement');
        if (videoElement) {
            videoElement.srcObject = null;
        }
    }
    
    const cameraContainer = getElement('camera-container');
    const startCameraButton = getElement('startCameraButton');
    
    if (cameraContainer) {
        cameraContainer.classList.add('hidden');
    }
    
    if (startCameraButton) {
        startCameraButton.classList.remove('hidden');
    }
}

function captureImage() {
    console.log("Capturing image...");
    if (!stream) {
        console.warn("No active stream for capture");
        return;
    }
    
    const canvas = getElement('capturedPhoto');
    const videoElement = getElement('videoElement');
    
    if (!canvas || !videoElement) {
        console.warn("Required capture elements not found");
        return;
    }
    
    // Setup canvas for capturing
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
    console.log("Handling image upload...");
    const file = event.target.files[0];
    if (!file || !file.type.match('image.*')) {
        showNotification("Please select a valid image file");
        return;
    }
    
    const canvas = getElement('capturedPhoto');
    const cameraContainer = getElement('camera-container');
    
    if (!canvas || !cameraContainer) {
        console.warn("Required upload elements not found");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Setup canvas for uploaded image
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

function handleHealthImageUpload(event) {
    console.log("Handling health image upload...");
    const file = event.target.files[0];
    if (!file || !file.type.match('image.*')) {
        showNotification("Please select a valid image file");
        return;
    }
    
    const canvas = getElement('healthCapturedPhoto');
    const cameraContainer = getElement('health-camera-container');
    
    if (!canvas || !cameraContainer) {
        console.warn("Required health upload elements not found");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Setup canvas for uploaded image
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Display canvas and hide camera button
            canvas.classList.remove('hidden');
            cameraContainer.classList.add('hidden');
            
            // Process the health check
            processHealthCheck(canvas);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Process image using Gemini API
async function processImage(canvas) {
    console.log("Processing image for identification...");
    const identificationResults = getElement('identificationResults');
    const loadingIdentification = getElement('loadingIdentification');
    const identificationContent = getElement('identificationContent');
    const identificationError = getElement('identificationError');
    
    if (!identificationResults || !loadingIdentification || !identificationContent) {
        console.warn("Required identification elements not found");
        return;
    }
    
    identificationResults.classList.remove('hidden');
    loadingIdentification.classList.remove('hidden');
    identificationContent.classList.add('hidden');
    
    // Hide any previous error state
    if (identificationError) {
        identificationError.classList.add('hidden');
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
        const identifiedPlantName = getElement('identifiedPlantName');
        const identifiedPlantScientific = getElement('identifiedPlantScientific');
        const identifiedPlantInfo = getElement('identifiedPlantInfo');
        const identifiedPlantImage = getElement('identifiedPlantImage');
        const addToGardenButton = getElement('addToGardenButton');
        
        if (!identifiedPlantName || !identifiedPlantScientific || !identifiedPlantInfo || !identifiedPlantImage || !addToGardenButton) {
            throw new Error("Required result elements not found");
        }
        
        identifiedPlantName.textContent = currentPlant.commonName;
        identifiedPlantScientific.textContent = currentPlant.scientificName;
        identifiedPlantInfo.innerHTML = currentPlant.info;
        identifiedPlantImage.src = currentPlant.image;
        
        // Enable add to garden button
        addToGardenButton.disabled = false;
        addToGardenButton.classList.remove('opacity-50');
        
        // Hide loading and show results
        loadingIdentification.classList.add('hidden');
        identificationContent.classList.remove('hidden');
        
    } catch (error) {
        console.error("Error identifying plant:", error);
        
        // Show error interface
        if (loadingIdentification) {
            loadingIdentification.classList.add('hidden');
        }
        
        // Create error section if it doesn't exist
        if (!identificationError) {
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
            identificationResults.appendChild(errorDiv);
            
            // Add event listeners to new buttons
            getElement('retryIdentification')?.addEventListener('click', () => {
                // Retry identification with current image
                processImage(getElement('capturedPhoto'));
            });
            
            getElement('offlineIdentification')?.addEventListener('click', () => {
                // Create offline fallback plant
                createFallbackPlant(getElement('capturedPhoto'));
            });
        } else {
            // Show existing error interface
            identificationError.classList.remove('hidden');
            const errorMessage = getElement('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = "We couldn't identify this plant due to a connection issue.";
            }
        }
    }
}

// Garden management functions
async function addToGarden(plant) {
    console.log("Adding plant to garden:", plant?.commonName);
    if (!plant) {
        console.warn("No plant data provided to addToGarden");
        return;
    }
    
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
    try {
        if (typeof auth !== 'undefined' && auth?.currentUser) {
            await saveToCloud();
        } else {
            await saveGarden(garden);
        }
        
        // Try to get plant care tips asynchronously
        if (typeof generatePlantCareTips === 'function') {
            generatePlantCareTips(newPlant).then(tips => {
                if (tips) {
                    // Store tips with the plant
                    const plantIndex = garden.findIndex(p => p.id === newPlant.id);
                    if (plantIndex >= 0) {
                        garden[plantIndex].careTips = tips;
                        
                        // Save updated garden data
                        if (typeof auth !== 'undefined' && auth?.currentUser) {
                            saveToCloud();
                        } else {
                            saveGarden(garden);
                        }
                    }
                }
            }).catch(error => {
                console.error("Failed to get plant care tips:", error);
            });
        }
        
        // Update UI
        renderGarden();
        if (typeof renderCare === 'function') {
            renderCare();
        }
        
        showNotification(`${plant.commonName} added to your garden!`);
        
        // Switch to garden tab
        switchTab('garden');
    } catch (error) {
        console.error("Error adding plant to garden:", error);
        showNotification("Error adding plant to garden. Please try again.");
    }
}

// Initial setup and events
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded");
    
    // Setup theme toggle
    const themeToggle = getElement('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            console.log("Toggle theme clicked");
            // Toggle dark class
            document.documentElement.classList.toggle('dark');
            
            // Save preference to localStorage
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // Tab navigation
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.id.replace('tab-', '');
            console.log(`Tab clicked: ${tabId}`);
            switchTab(tabId);
        });
    });
    
    // Camera controls
    const startCameraButton = getElement('startCameraButton');
    if (startCameraButton) {
        startCameraButton.addEventListener('click', () => {
            console.log("Start camera button clicked");
            startCamera();
        });
    }
    
    const captureButton = getElement('captureButton');
    if (captureButton) {
        captureButton.addEventListener('click', () => {
            console.log("Capture button clicked");
            captureImage();
        });
    }
    
    const imageUpload = getElement('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', (event) => {
            console.log("Image upload changed");
            handleImageUpload(event);
        });
    }
    
    // Health camera controls
    const startHealthCameraButton = getElement('startHealthCameraButton');
    if (startHealthCameraButton) {
        startHealthCameraButton.addEventListener('click', () => {
            console.log("Start health camera button clicked");
            startHealthCamera();
        });
    }
    
    const healthCaptureButton = getElement('healthCaptureButton');
    if (healthCaptureButton) {
        healthCaptureButton.addEventListener('click', () => {
            console.log("Health capture button clicked");
            captureHealthImage();
        });
    }
    
    const healthImageUpload = getElement('healthImageUpload');
    if (healthImageUpload) {
        healthImageUpload.addEventListener('change', (event) => {
            console.log("Health image upload changed");
            handleHealthImageUpload(event);
        });
    }
    
    // Garden buttons
    const addToGardenButton = getElement('addToGardenButton');
    if (addToGardenButton) {
        addToGardenButton.addEventListener('click', () => {
            console.log("Add to garden button clicked");
            if (currentPlant) {
                addToGarden(currentPlant);
            } else {
                console.warn("No current plant to add to garden");
            }
        });
    }
    
    const searchAddToGardenButton = getElement('searchAddToGardenButton');
    if (searchAddToGardenButton) {
        searchAddToGardenButton.addEventListener('click', () => {
            console.log("Search add to garden button clicked");
            if (currentPlant) {
                addToGarden(currentPlant);
            } else {
                console.warn("No current plant from search to add to garden");
            }
        });
    }
    
    // Check health button
    const checkHealthButton = getElement('checkHealthButton');
    if (checkHealthButton) {
        checkHealthButton.addEventListener('click', () => {
            console.log("Check health button clicked");
            // If we have a current plant, switch to health tab with this image
            if (currentPlant && currentPlant.image) {
                const img = new Image();
                img.onload = function() {
                    // Switch to health tab
                    switchTab('health');
                    
                    // Setup canvas for health check
                    const canvas = getElement('healthCapturedPhoto');
                    if (canvas) {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        
                        // Draw image to canvas
                        ctx.drawImage(img, 0, 0);
                        
                        // Display canvas
                        canvas.classList.remove('hidden');
                        
                        // Process the health check
                        if (typeof processHealthCheck === 'function') {
                            processHealthCheck(canvas);
                        } else {
                            console.warn("processHealthCheck function not available");
                        }
                    }
                };
                img.src = currentPlant.image;
            } else {
                // Just switch to health tab
                switchTab('health');
            }
        });
    }
    
    // Search instead button
    const searchForPlantButton = getElement('searchForPlantButton');
    if (searchForPlantButton) {
        searchForPlantButton.addEventListener('click', () => {
            console.log("Search for plant button clicked");
            if (currentPlant) {
                // Fill search field with plant name and switch to search tab
                const searchInput = getElement('searchInput');
                if (searchInput) {
                    searchInput.value = currentPlant.commonName;
                    switchTab('search');
                    
                    // Trigger search
                    setTimeout(() => {
                        const searchButton = getElement('searchButton');
                        if (searchButton) searchButton.click();
                    }, 100);
                }
            }
        });
    }
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Initialize app
    if (typeof initApp === 'function') {
        initApp().catch(error => {
            console.error("Error initializing app:", error);
        });
    } else {
        // Basic initialization if full init not available
        console.log("Basic initialization (initApp not available)");
        loadGarden().then(loadedGarden => {
            garden = loadedGarden || [];
            if (typeof renderGarden === 'function') {
                renderGarden();
            }
            if (typeof renderCare === 'function') {
                renderCare();
            }
        }).catch(error => {
            console.error("Error loading garden:", error);
        });
    }
});

// Capture health image
function captureHealthImage() {
    console.log("Capturing health image...");
    if (!stream) {
        console.warn("No active stream for health capture");
        return;
    }
    
    const canvas = getElement('healthCapturedPhoto');
    const videoElement = getElement('healthVideoElement');
    const cameraContainer = getElement('health-camera-container');
    const startButton = getElement('startHealthCameraButton');
    
    if (!canvas || !videoElement || !cameraContainer || !startButton) {
        console.warn("Required health capture elements not found");
        return;
    }
    
    // Setup canvas for capturing
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Stop the camera
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        videoElement.srcObject = null;
    }
    
    // Update UI
    cameraContainer.classList.add('hidden');
    startButton.classList.remove('hidden');
    canvas.classList.remove('hidden');
    
    // Process the health check
    if (typeof processHealthCheck === 'function') {
        processHealthCheck(canvas);
    } else {
        console.warn("processHealthCheck function not available");
        showNotification("Health check feature not available");
    }
}

// Add these fallback functions to avoid errors if the other JavaScript files haven't loaded properly

function processHealthCheck(canvas) {
    console.warn("processHealthCheck function not properly loaded");
    showNotification("Health check processing not available. Please refresh the page.");
}

function renderGarden() {
    console.log("Fallback renderGarden called - waiting for full implementation");
    const gardenContent = getElement('gardenContent');
    const emptyGarden = getElement('emptyGarden');
    
    if (!gardenContent || !emptyGarden) return;
    
    if (garden.length === 0) {
        gardenContent.classList.add('hidden');
        emptyGarden.classList.remove('hidden');
    } else {
        gardenContent.classList.remove('hidden');
        emptyGarden.classList.add('hidden');
        
        gardenContent.innerHTML = '<p class="text-center p-4">Loading garden...</p>';
    }
}

function renderCare() {
    console.log("Fallback renderCare called - waiting for full implementation");
}

// Export key functions so they're available globally
window.addToGarden = addToGarden;
window.processImage = processImage;
window.processHealthCheck = processHealthCheck;
window.switchTab = switchTab;
window.showNotification = showNotification;
window.getElement = getElement;


// Add this to app.js to make the toggles work
document.addEventListener('DOMContentLoaded', function() {
    // App settings toggles
    const toggles = [
        { id: 'social-sharing-toggle', setting: 'socialSharingEnabled', defaultValue: true },
        { id: 'location-toggle', setting: 'locationAllowed', defaultValue: false },
        { id: 'community-toggle', setting: 'communityEnabled', defaultValue: true }
    ];
    
    // Initialize toggles
    toggles.forEach(async toggle => {
        const element = document.getElementById(toggle.id);
        if (element) {
            // Get saved setting
            let settingValue = false;
            try {
                if (typeof loadSetting === 'function') {
                    settingValue = await loadSetting(toggle.setting, toggle.defaultValue);
                } else {
                    // Fallback if loadSetting not available
                    const saved = localStorage.getItem(toggle.setting);
                    settingValue = saved ? JSON.parse(saved) : toggle.defaultValue;
                }
            } catch (error) {
                console.error(`Error loading setting ${toggle.setting}:`, error);
                settingValue = toggle.defaultValue;
            }
            
            // Set initial state
            element.checked = settingValue;
            
            // Add event listener
            element.addEventListener('change', function() {
                console.log(`Toggle ${toggle.id} changed to ${this.checked}`);
                
                try {
                    // Save setting
                    if (typeof saveSetting === 'function') {
                        saveSetting(toggle.setting, this.checked);
                    } else {
                        // Fallback if saveSetting not available
                        localStorage.setItem(toggle.setting, JSON.stringify(this.checked));
                    }
                    
                    // Special handling for location toggle
                    if (toggle.id === 'location-toggle' && this.checked) {
                        // Try to get user location
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                position => {
                                    console.log("Got user location");
                                    showNotification("Location access granted!");
                                },
                                error => {
                                    console.error("Error getting location:", error);
                                    showNotification("Could not get location. Please check permissions.");
                                }
                            );
                        }
                    }
                    
                    showNotification(`${toggle.setting} set to ${this.checked}`);
                } catch (error) {
                    console.error(`Error saving setting ${toggle.setting}:`, error);
                }
            });
        }
    });
});

// Ensure these utility functions are available globally
window.showNotification = function(message, duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    } else {
        console.log("Notification (fallback):", message);
        alert(message);
    }
};

// Storage utility functions
window.saveSetting = async function(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Error saving setting:", error);
        return false;
    }
};

window.loadSetting = async function(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error("Error loading setting:", error);
        return defaultValue;
    }
};
