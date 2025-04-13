// Global variables
let garden = [];
let currentPlant = null;
let selectedPlantId = null;
let stream = null;
let hasSeenWelcome = false;

// DOM elements - use safe accessor pattern
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

// Create a fallback plant when offline
function createFallbackPlant(canvas) {
    console.log("Creating fallback plant");
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
    const identifiedPlantName = getElement('identifiedPlantName');
    const identifiedPlantScientific = getElement('identifiedPlantScientific');
    const identifiedPlantInfo = getElement('identifiedPlantInfo');
    const identifiedPlantImage = getElement('identifiedPlantImage');
    
    if (identifiedPlantName) identifiedPlantName.textContent = currentPlant.commonName;
    if (identifiedPlantScientific) identifiedPlantScientific.textContent = currentPlant.scientificName;
    if (identifiedPlantInfo) identifiedPlantInfo.innerHTML = currentPlant.info;
    if (identifiedPlantImage) identifiedPlantImage.src = currentPlant.image;
    
    // Enable add to garden button
    const addToGardenButton = getElement('addToGardenButton');
    if (addToGardenButton) {
        addToGardenButton.disabled = false;
        addToGardenButton.classList.remove('opacity-50');
    }
    
    // Hide error and show results
    const identificationError = getElement('identificationError');
    const identificationContent = getElement('identificationContent');
    
    if (identificationError) identificationError.classList.add('hidden');
    if (identificationContent) identificationContent.classList.remove('hidden');
}

function displaySearchResults(results) {
    const searchResults = getElement('searchResults');
    if (!searchResults) return;
    
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
    const searchLoading = getElement('searchLoading');
    const searchContent = getElement('searchContent');
    
    if (!searchLoading || !searchContent) return;
    
    searchLoading.classList.remove('hidden');
    searchContent.classList.add('hidden');
    
    try {
        // Get plant details from GBIF API
        currentPlant = await getPlantDetails(speciesKey);
        
        // Update search results
        const searchPlantName = getElement('searchPlantName');
        const searchPlantScientific = getElement('searchPlantScientific');
        const searchPlantInfo = getElement('searchPlantInfo');
        const searchPlantImage = getElement('searchPlantImage');
        
        if (searchPlantName) searchPlantName.textContent = currentPlant.commonName;
        if (searchPlantScientific) searchPlantScientific.textContent = currentPlant.scientificName;
        if (searchPlantInfo) searchPlantInfo.textContent = currentPlant.info;
        if (searchPlantImage) searchPlantImage.src = currentPlant.image;
        
        searchContent.classList.remove('hidden');
    } catch (error) {
        console.error("Error getting plant details:", error);
        showNotification("Error loading plant details. Please try again.");
    } finally {
        if (searchLoading) searchLoading.classList.add('hidden');
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
    console.log("Garden now has", garden.length, "plants");
    
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

async function removeFromGarden(plantId) {
    console.log("Removing plant from garden:", plantId);
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plantName = garden[plantIndex].commonName;
        garden.splice(plantIndex, 1);
        
        // If user is logged in, save directly to cloud
        // Otherwise save to IndexedDB
        try {
            if (typeof auth !== 'undefined' && auth?.currentUser) {
                await saveToCloud();
            } else {
                await saveGarden(garden);
            }
            
            // Update UI
            renderGarden();
            if (typeof renderCare === 'function') {
                renderCare();
            }
            
            showNotification(`${plantName} removed from your garden.`);
            
            // Close modal
            closePlantDetailModal();
        } catch (error) {
            console.error("Error removing plant from garden:", error);
            showNotification("Error removing plant. Please try again.");
        }
    }
}

async function waterPlant(plantId) {
    console.log("Watering plant:", plantId);
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plant = garden[plantIndex];
        const now = new Date();
        
        plant.lastWatered = now.toISOString();
        plant.nextWater = new Date(now.getTime() + (plant.waterInterval * 24 * 60 * 60 * 1000)).toISOString();
        
        // If user is logged in, save directly to cloud
        // Otherwise save to IndexedDB
        try {
            if (typeof auth !== 'undefined' && auth?.currentUser) {
                await saveToCloud();
            } else {
                await saveGarden(garden);
            }
            
            // Update UI
            renderGarden();
            if (typeof renderCare === 'function') {
                renderCare();
            }
            
            // If modal is open, update it
            if (selectedPlantId === plantId) {
                updatePlantDetailModal(plant);
            }
            
            showNotification(`${plant.commonName} has been watered!`);
        } catch (error) {
            console.error("Error watering plant:", error);
            showNotification("Error watering plant. Please try again.");
        }
    }
}

// Completely rewritten renderGarden function to fix the loading issue
function renderGarden() {
    console.log("Rendering garden with", garden.length, "plants");
    
    const gardenContent = getElement('gardenContent');
    const emptyGarden = getElement('emptyGarden');
    
    if (!gardenContent || !emptyGarden) {
        console.error("Garden elements not found in DOM");
        return;
    }
    
    if (!garden || garden.length === 0) {
        console.log("Garden is empty");
        gardenContent.classList.add('hidden');
        emptyGarden.classList.remove('hidden');
        return;
    }
    
    console.log("Garden has plants - displaying");
    gardenContent.classList.remove('hidden');
    emptyGarden.classList.add('hidden');
    
    // Clear previous garden content
    gardenContent.innerHTML = '';
    
    // Loop through garden plants
    garden.forEach(plant => {
        console.log("Processing plant:", plant.commonName);
        const now = new Date();
        const lastWatered = new Date(plant.lastWatered);
        const nextWater = new Date(plant.nextWater);
        
        // Calculate water progress
        const waterTotal = plant.waterInterval * 24 * 60 * 60 * 1000;
        const waterElapsed = now - lastWatered;
        const waterProgress = Math.min(100, Math.max(0, (waterElapsed / waterTotal) * 100));
        
        // Create plant card
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
        
        // Add click handler to open modal
        plantCard.addEventListener('click', () => {
            openPlantDetailModal(plant.id);
        });
        
        // Add card to garden
        gardenContent.appendChild(plantCard);
    });
}

function renderCare() {
    console.log("Rendering care tab");
    const careContent = getElement('careContent');
    const emptyCare = getElement('emptyCare');
    
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
        if (waterButton) {
            waterButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening the modal
                waterPlant(plant.id);
            });
        }
        
        taskCard.addEventListener('click', () => {
            openPlantDetailModal(plant.id);
        });
        
        careContent.appendChild(taskCard);
    });
}

// Modal functions
function openPlantDetailModal(plantId) {
    console.log("Opening modal for plant:", plantId);
    const plant = garden.find(p => p.id === plantId);
    if (!plant) {
        console.warn("Plant not found in garden:", plantId);
        return;
    }
    
    const plantDetailModal = getElement('plantDetailModal');
    if (!plantDetailModal) {
        console.warn("Plant detail modal not found");
        return;
    }
    
    selectedPlantId = plantId;
    updatePlantDetailModal(plant);
    
    // Reset to the info tab when opening
    if (typeof switchModalTab === 'function') {
        switchModalTab('info');
    } else {
        // Fallback tab switching
        const infoTab = getElement('modal-content-info');
        const tabs = document.querySelectorAll('.modal-tab-content');
        if (tabs) {
            tabs.forEach(tab => tab.classList.add('hidden'));
        }
        if (infoTab) {
            infoTab.classList.remove('hidden');
        }
        
        const tabBtns = document.querySelectorAll('[id^="modal-tab-"]');
        if (tabBtns) {
            tabBtns.forEach(btn => {
                btn.classList.remove('border-primary-color', 'active');
                btn.classList.add('border-transparent', 'hover:border-gray-300');
                btn.removeAttribute('aria-current');
            });
        }
        const infoBtn = getElement('modal-tab-info');
        if (infoBtn) {
            infoBtn.classList.add('border-primary-color', 'active');
            infoBtn.setAttribute('aria-current', 'page');
        }
    }
    
    plantDetailModal.classList.remove('hidden');
}

function updatePlantDetailModal(plant) {
    console.log("Updating modal for plant:", plant.commonName);
    const now = new Date();
    const lastWatered = new Date(plant.lastWatered);
    const nextWater = new Date(plant.nextWater);
    
    // Calculate water progress
    const waterTotal = plant.waterInterval * 24 * 60 * 60 * 1000; // in ms
    const waterElapsed = now - lastWatered; // in ms
    const waterProgress = Math.min(100, Math.max(0, (waterElapsed / waterTotal) * 100));
    
    // Calculate sun progress (simplified)
    const sunProgress = 50; // This would be calculated based on actual sunlight data
    
    // Update plant details in modal
    const modalElements = {
        'modalPlantName': plant.commonName,
        'modalPlantScientific': plant.scientificName,
        'modalPlantInfo': plant.info,
        'modalPlantImage': { src: plant.image },
        'modalWaterStatus': nextWater < now ? 'Needs water now!' : `Water in ${timeDifference(nextWater)}`,
        'modalWaterProgress': { style: { width: `${waterProgress}%` } },
        'modalSunlightStatus': `Needs ${plant.sunlightHours} hours of sunlight per day`,
        'modalSunProgress': { style: { width: `${sunProgress}%` } }
    };
    
    // Update each element
    for (const [id, value] of Object.entries(modalElements)) {
        const element = getElement(id);
        if (element) {
            if (typeof value === 'string') {
                element.textContent = value;
            } else if (typeof value === 'object') {
                for (const [prop, propValue] of Object.entries(value)) {
                    if (prop === 'style' && typeof propValue === 'object') {
                        for (const [styleProp, styleValue] of Object.entries(propValue)) {
                            element.style[styleProp] = styleValue;
                        }
                    } else {
                        element[prop] = propValue;
                    }
                }
            }
        }
    }
    
    // Update seasonal care section if available
    if (typeof getSeasonalCareTips === 'function') {
        const seasonalTips = getSeasonalCareTips(plant);
        const modalSeasonalCare = getElement('modalSeasonalCare');
        
        if (seasonalTips && modalSeasonalCare) {
            modalSeasonalCare.innerHTML = `
                <p class="mb-2"><strong>Water:</strong> ${seasonalTips.water || 'No specific recommendations'}</p>
                <p class="mb-2"><strong>Light:</strong> ${seasonalTips.light || 'No specific recommendations'}</p>
                <p class="mb-2"><strong>Fertilizer:</strong> ${seasonalTips.fertilizer || 'No specific recommendations'}</p>
                <p><strong>Maintenance:</strong> ${seasonalTips.maintenance || 'No specific recommendations'}</p>
            `;
        }
    }
}

function closePlantDetailModal() {
    console.log("Closing plant detail modal");
    selectedPlantId = null;
    const plantDetailModal = getElement('plantDetailModal');
    if (plantDetailModal) {
        plantDetailModal.classList.add('hidden');
    }
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
    getElement('welcomeSignUp')?.addEventListener('click', () => {
        document.body.removeChild(welcomeDialog);
        hasSeenWelcome = true;
        saveSetting('hasSeenWelcome', true);
        switchTab('account');
    });
    
    getElement('welcomeLater')?.addEventListener('click', () => {
        document.body.removeChild(welcomeDialog);
        hasSeenWelcome = true;
        saveSetting('hasSeenWelcome', true);
    });
}

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

// Storage utility functions
async function saveGarden(gardenData) {
    try {
        console.log("Saving garden data to storage:", gardenData?.length, "plants");
        localStorage.setItem('plantify-garden', JSON.stringify(gardenData));
        return true;
    } catch (error) {
        console.error("Error saving garden data:", error);
        return false;
    }
}

async function loadGarden() {
    try {
        console.log("Loading garden data from storage");
        const storedGarden = localStorage.getItem('plantify-garden');
        if (storedGarden) {
            return JSON.parse(storedGarden);
        }
        return [];
    } catch (error) {
        console.error("Error loading garden data:", error);
        return [];
    }
}

async function saveSetting(key, value) {
    try {
        console.log(`Saving setting ${key}:`, value);
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Error saving setting:", error);
        return false;
    }
}

async function loadSetting(key, defaultValue) {
    try {
        console.log(`Loading setting ${key}`);
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error("Error loading setting:", error);
        return defaultValue;
    }
}

// Set up event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded - setting up event listeners");
    
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
    
    // Garden buttons
    const addToGardenButton = getElement('addToGardenButton');
    if (addToGardenButton) {
        addToGardenButton.addEventListener('click', () => {
            console.log("Add to garden button clicked");
            if (currentPlant) {
                addToGarden(currentPlant);
            } else {
                console.warn("No current plant to add to garden");
                showNotification("No plant identified yet");
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
                showNotification("No plant selected yet");
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
                            showNotification("Health check feature not available");
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
    
    // Modal buttons
    const closeModalButton = getElement('closeModal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            console.log("Close modal button clicked");
            closePlantDetailModal();
        });
    }
    
    const modalWaterButton = getElement('modalWaterButton');
    if (modalWaterButton) {
        modalWaterButton.addEventListener('click', () => {
            console.log("Modal water button clicked");
            if (selectedPlantId) {
                waterPlant(selectedPlantId);
            }
        });
    }
    
    const modalRemoveButton = getElement('modalRemoveButton');
    if (modalRemoveButton) {
        modalRemoveButton.addEventListener('click', () => {
            console.log("Modal remove button clicked");
            if (selectedPlantId) {
                removeFromGarden(selectedPlantId);
            }
        });
    }
    
    // Modal tab navigation
    const modalTabButtons = document.querySelectorAll('[id^="modal-tab-"]');
    modalTabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = button.id.replace('modal-tab-', '');
            console.log(`Modal tab clicked: ${tabId}`);
            if (typeof switchModalTab === 'function') {
                switchModalTab(tabId);
            } else {
                // Fallback tab switching
                const tabContent = getElement(`modal-content-${tabId}`);
                if (tabContent) {
                    document.querySelectorAll('.modal-tab-content').forEach(tab => tab.classList.add('hidden'));
                    tabContent.classList.remove('hidden');
                    
                    modalTabButtons.forEach(btn => {
                        btn.classList.remove('border-primary-color', 'active');
                        btn.classList.add('border-transparent', 'hover:border-gray-300');
                        btn.removeAttribute('aria-current');
                    });
                    
                    button.classList.add('border-primary-color', 'active');
                    button.setAttribute('aria-current', 'page');
                }
            }
        });
    });
    
    // App settings toggles
    const toggles = [
        { id: 'social-sharing-toggle', setting: 'socialSharingEnabled', defaultValue: true },
        { id: 'location-toggle', setting: 'locationAllowed', defaultValue: false },
        { id: 'community-toggle', setting: 'communityEnabled', defaultValue: true }
    ];
    
    // Initialize toggles
    toggles.forEach(async toggle => {
        const element = getElement(toggle.id);
        if (element) {
            // Get saved setting
            let settingValue = false;
            try {
                settingValue = await loadSetting(toggle.setting, toggle.defaultValue);
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
                    saveSetting(toggle.setting, this.checked);
                    
                    // Special handling for location toggle
                    if (toggle.id === 'location-toggle' && this.checked) {
                        // Try to get user location
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                position => {
                                    console.log("Got user location");
                                    showNotification("Location access granted!");
                                    
                                    if (typeof getUserLocation === 'function') {
                                        getUserLocation();
                                    }
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
    
    // Care tab buttons
    const saveCarePrefsBtn = getElement('saveCarePreferences');
    if (saveCarePrefsBtn) {
        saveCarePrefsBtn.addEventListener('click', () => {
            console.log("Save care preferences clicked");
            
            // Get values from UI
            const notificationFreq = getElement('notificationFrequency')?.value || 'medium';
            const adjustWeather = getElement('adjustForWeather')?.checked || false;
            const seasonalAdjust = getElement('seasonalAdjustments')?.checked || false;
            
            // Save preferences
            saveSetting('carePreferences', {
                notificationFrequency: notificationFreq,
                adjustForWeather: adjustWeather,
                seasonalAdjustments: seasonalAdjust
            });
            
            // Apply changes
            if (adjustWeather && typeof updateCareForWeather === 'function') {
                updateCareForWeather();
            }
            
            showNotification("Care preferences saved!");
        });
    }
    
    // Refresh weather button
    const refreshWeatherBtn = getElement('refreshWeather');
    if (refreshWeatherBtn) {
        refreshWeatherBtn.addEventListener('click', () => {
            console.log("Refresh weather clicked");
            
            if (typeof getUserLocation === 'function') {
                getUserLocation();
                showNotification("Refreshing weather data...");
            } else {
                // Fallback
                if (navigator.geolocation) {
                    showNotification("Updating weather data...");
                    navigator.geolocation.getCurrentPosition(
                        position => {
                            if (typeof userLocation !== 'undefined') {
                                userLocation = {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude
                                };
                            }
                            
                            // Update weather UI with mock data
                            const weatherLocation = getElement('weatherLocation');
                            const weatherIcon = getElement('weatherIcon');
                            const weatherAdvice = getElement('weatherAdvice');
                            
                            if (weatherLocation) {
                                weatherLocation.textContent = "Your Location";
                            }
                            
                            if (weatherIcon) {
                                weatherIcon.innerHTML = '<i class="fas fa-cloud-sun"></i>';
                            }
                            
                            if (weatherAdvice) {
                                weatherAdvice.textContent = "Weather data updated! Current conditions: 22°C, 65% humidity, Partly Cloudy.";
                            }
                            
                            showNotification("Weather data updated!");
                        },
                        error => {
                            console.error("Error getting location:", error);
                            showNotification("Could not get location. Please check permissions.");
                        }
                    );
                }
            }
        });
    }
    
    // Explore tab buttons
    const refreshLocationBtn = getElement('refreshLocationBtn');
    if (refreshLocationBtn) {
        refreshLocationBtn.addEventListener('click', () => {
            console.log("Refresh location clicked");
            
            if (typeof initLocationBasedFeatures === 'function') {
                if (navigator.geolocation) {
                    showNotification("Updating location...");
                    navigator.geolocation.getCurrentPosition(
                        position => {
                            if (typeof userLocation !== 'undefined') {
                                userLocation = {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude
                                };
                                
                                initLocationBasedFeatures();
                                showNotification("Location updated!");
                            }
                        },
                        error => {
                            console.error("Error getting location:", error);
                            showNotification("Could not get location. Please check permissions.");
                        }
                    );
                }
            } else {
                showNotification("Location features not available");
            }
        });
    }
    
    const findStoresBtn = getElement('findStoresBtn');
    if (findStoresBtn) {
        findStoresBtn.addEventListener('click', () => {
            console.log("Find stores button clicked");
            
            if (typeof loadNearbyPlantStores === 'function') {
                loadNearbyPlantStores();
                showNotification("Finding plant stores near you...");
            } else {
                showNotification("Store finder not available");
            }
        });
    }
    
    const newPostBtn = getElement('newPostBtn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', () => {
            console.log("New post button clicked");
            showNotification("Community posting will be available soon!");
        });
    }
    
    const loadMorePostsBtn = getElement('loadMorePostsBtn');
    if (loadMorePostsBtn) {
        loadMorePostsBtn.addEventListener('click', () => {
            console.log("Load more posts button clicked");
            showNotification("More community posts will be available soon!");
        });
    }
    
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
});

// Initialize the app
async function initApp() {
    console.log("Initializing app...");
    
    try {
        // Load API key from storage if available
        if (typeof initApiKey === 'function') {
            await initApiKey();
        }
        
        // Check if user has seen welcome message
        hasSeenWelcome = await loadSetting('hasSeenWelcome', false);
        
        // Try to initialize Firebase (silent if fails)
        try {
            if (typeof initializeFirebase === 'function') {
                await initializeFirebase();
                
                // If user is logged in, load data from cloud
                if (typeof auth !== 'undefined' && auth?.currentUser) {
                    try {
                        // Get cloud data
                        const docRef = db.collection('users').doc(auth.currentUser.uid);
                        const doc = await docRef.get();
                        
                        if (doc.exists && doc.data().garden) {
                            garden = doc.data().garden;
                        } else {
                            // If no cloud data, but user has local data, push to cloud
                            garden = await loadGarden();
                            if (garden.length > 0 && typeof saveToCloud === 'function') {
                                await saveToCloud();
                            }
                        }
                    } catch (error) {
                        console.error("Error loading cloud data:", error);
                        garden = await loadGarden();
                    }
                } else {
                    // Not logged in, load from localStorage
                    garden = await loadGarden();
                }
            } else {
                garden = await loadGarden();
            }
        } catch (error) {
            console.log("Firebase not initialized, continuing with local storage only");
            garden = await loadGarden();
        }
        
        // Update API key UI based on whether custom key is set
        if (typeof currentApiKey !== 'undefined' && typeof DEFAULT_API_KEY !== 'undefined') {
            if (currentApiKey !== DEFAULT_API_KEY) {
                getElement('api-key-section')?.classList.add('hidden');
                getElement('api-key-saved-message')?.classList.remove('hidden');
            } else {
                getElement('api-key-section')?.classList.remove('hidden');
                getElement('api-key-saved-message')?.classList.add('hidden');
            }
        }
        
        // Initialize toggle switches
        const socialSharingEnabled = await loadSetting('socialSharingEnabled', true);
        const locationAllowed = await loadSetting('locationAllowed', false);
        const communityEnabled = await loadSetting('communityEnabled', true);
        
        if (getElement('social-sharing-toggle')) {
            getElement('social-sharing-toggle').checked = socialSharingEnabled;
        }
        
        if (getElement('location-toggle')) {
            getElement('location-toggle').checked = locationAllowed;
        }
        
        if (getElement('community-toggle')) {
            getElement('community-toggle').checked = communityEnabled;
        }
        
        // Initialize care features if available
        if (typeof initCare === 'function') {
            await initCare();
        }
        
        // Initialize new features if available
        if (typeof initFeatures === 'function') {
            await initFeatures();
        }
        
        // Render initial garden and care data
        renderGarden();
        if (typeof renderCare === 'function') {
            renderCare();
        }
        
        // Setup notifications
        setupNotifications();
        
        // Show welcome message for first-time users
        if (!hasSeenWelcome && !(typeof auth !== 'undefined' && auth?.currentUser)) {
            setTimeout(showWelcomeMessage, 1000);
        } else {
            // Show welcome notification instead
            setTimeout(() => {
                showNotification("Welcome to Plantify! Identify and manage your plants with ease.");
            }, 1000);
        }
        
        console.log("App initialization complete");
    } catch (error) {
        console.error("Error initializing app:", error);
    }
}

// Make key functions globally available
window.addToGarden = addToGarden;
window.renderGarden = renderGarden;
window.renderCare = renderCare;
window.switchTab = switchTab;
window.showNotification = showNotification;
window.openPlantDetailModal = openPlantDetailModal;
window.closePlantDetailModal = closePlantDetailModal;
window.waterPlant = waterPlant;
window.removeFromGarden = removeFromGarden;
window.timeDifference = timeDifference;
