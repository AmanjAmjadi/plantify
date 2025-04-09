// Global variables
let garden = JSON.parse(localStorage.getItem('garden')) || [];
let currentPlant = null;
let selectedPlantId = null;
let stream = null;

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
const sampleImages = document.querySelectorAll('.sample-image');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const addToGardenButton = document.getElementById('addToGardenButton');
const searchAddToGardenButton = document.getElementById('searchAddToGardenButton');
const closeModalButton = document.getElementById('closeModal');
const plantDetailModal = document.getElementById('plantDetailModal');
const modalWaterButton = document.getElementById('modalWaterButton');
const modalRemoveButton = document.getElementById('modalRemoveButton');

// Check for dark mode preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}

// Listen for changes in color scheme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
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

function handleSampleImage(event) {
    const img = event.target;
    
    // Setup canvas for sample image
    const canvas = capturedPhoto;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw sample image to canvas
    ctx.drawImage(img, 0, 0);
    
    // Display canvas and hide camera
    canvas.classList.remove('hidden');
    cameraContainer.classList.add('hidden');
    
    // Process the sample image
    processImage(canvas);
}

// Process image using Gemini API
async function processImage(canvas) {
    document.getElementById('identificationResults').classList.remove('hidden');
    document.getElementById('loadingIdentification').classList.remove('hidden');
    document.getElementById('identificationContent').classList.add('hidden');
    
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
        showNotification("Error identifying plant. Please try again.");
        
        // Create a fallback plant identification
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
        
        // Hide loading and show results
        document.getElementById('loadingIdentification').classList.add('hidden');
        document.getElementById('identificationContent').classList.remove('hidden');
    }
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
function addToGarden(plant) {
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
    
    // Save to localStorage
    localStorage.setItem('garden', JSON.stringify(garden));
    
    // Update UI
    renderGarden();
    renderCare();
    
    showNotification(`${plant.commonName} added to your garden!`);
    
    // Switch to garden tab
    switchTab('garden');
}

function removeFromGarden(plantId) {
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plantName = garden[plantIndex].commonName;
        garden.splice(plantIndex, 1);
        
        // Save to localStorage
        localStorage.setItem('garden', JSON.stringify(garden));
        
        // Update UI
        renderGarden();
        renderCare();
        
        showNotification(`${plantName} removed from your garden.`);
        
        // Close modal
        closePlantDetailModal();
    }
}

function waterPlant(plantId) {
    const plantIndex = garden.findIndex(p => p.id === plantId);
    if (plantIndex >= 0) {
        const plant = garden[plantIndex];
        const now = new Date();
        
        plant.lastWatered = now.toISOString();
        plant.nextWater = new Date(now.getTime() + (plant.waterInterval * 24 * 60 * 60 * 1000)).toISOString();
        
        // Save to localStorage
        localStorage.setItem('garden', JSON.stringify(garden));
        
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

// Event listeners
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.id.replace('tab-', '');
        switchTab(tabId);
    });
});

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
});

startCameraButton.addEventListener('click', startCamera);
captureButton.addEventListener('click', captureImage);
imageUpload.addEventListener('change', handleImageUpload);

sampleImages.forEach(img => {
    img.addEventListener('click', handleSampleImage);
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
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
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
function initApp() {
    // Render initial garden and care data
    renderGarden();
    renderCare();
    
    // Setup notifications
    setupNotifications();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification("Welcome to Plantify! Identify and manage your plants with ease.");
    }, 1000);
}

// Start the app
initApp();
