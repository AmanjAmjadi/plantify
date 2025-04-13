// fix.js - Emergency fixes for critical functionality
console.log("Loading critical function fixes...");

// Make sure garden is accessible
if (typeof garden === 'undefined') {
    window.garden = [];
}

// Fixed renderGarden function
window.renderGarden = function() {
    console.log("Rendering garden with", garden.length, "plants");
    
    const gardenContent = document.getElementById('gardenContent');
    const emptyGarden = document.getElementById('emptyGarden');
    
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
            if (typeof openPlantDetailModal === 'function') {
                openPlantDetailModal(plant.id);
            } else {
                console.log("Plant details:", plant);
                alert(`Plant: ${plant.commonName}\nScientific name: ${plant.scientificName}\nWater in: ${timeDifference(nextWater)}`);
            }
        });
        
        // Add card to garden
        gardenContent.appendChild(plantCard);
    });
};

// Fixed addToGarden function to make sure it works
window.addToGarden = function(plant) {
    console.log("Adding plant to garden:", plant?.commonName);
    if (!plant) {
        console.error("No plant data provided to addToGarden");
        return;
    }
    
    // Initialize garden if not already done
    if (!window.garden) {
        window.garden = [];
    }
    
    // Check if plant already exists in garden
    const existingIndex = garden.findIndex(p => p.id === plant.id);
    
    if (existingIndex >= 0) {
        alert(`${plant.commonName} is already in your garden!`);
        return;
    }
    
    // Add water and sun tracking
    const now = new Date();
    const newPlant = {
        ...plant,
        id: plant.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
        added: now.toISOString(),
        lastWatered: now.toISOString(),
        nextWater: new Date(now.getTime() + (plant.waterDays * 24 * 60 * 60 * 1000)).toISOString(),
        waterInterval: plant.waterDays, // in days
        sunlightNeeded: plant.sunlightHours // hours per day
    };
    
    // Add to garden array
    garden.push(newPlant);
    console.log("Garden now has", garden.length, "plants");
    
    // Save to storage
    saveGardenData();
    
    // Render the garden
    renderGarden();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`${plant.commonName} added to your garden!`);
    } else {
        alert(`${plant.commonName} added to your garden!`);
    }
    
    // Switch to garden tab
    if (typeof switchTab === 'function') {
        switchTab('garden');
    } else {
        // Fallback tab switching
        const gardenTab = document.getElementById('garden-tab');
        if (gardenTab) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            gardenTab.classList.add('active');
        }
    }
};

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

// Storage functions
function saveGardenData() {
    try {
        localStorage.setItem('plantify-garden', JSON.stringify(garden));
        console.log("Garden data saved to localStorage");
        
        // Try Firebase if available
        if (typeof saveToCloud === 'function' && typeof auth !== 'undefined' && auth?.currentUser) {
            saveToCloud().catch(err => console.error("Cloud save error:", err));
        }
    } catch (error) {
        console.error("Error saving garden data:", error);
    }
}

// Load garden data
function loadGardenData() {
    try {
        const savedGarden = localStorage.getItem('plantify-garden');
        if (savedGarden) {
            window.garden = JSON.parse(savedGarden);
            console.log("Loaded garden with", garden.length, "plants");
        } else {
            window.garden = [];
            console.log("No saved garden found");
        }
    } catch (error) {
        console.error("Error loading garden data:", error);
        window.garden = [];
    }
    
    // Render garden after loading
    renderGarden();
}

// Make sure all the "Add to Garden" buttons work
document.addEventListener('DOMContentLoaded', function() {
    console.log("Setting up garden buttons...");
    
    // Add to garden button (Identify tab)
    const addToGardenButton = document.getElementById('addToGardenButton');
    if (addToGardenButton) {
        console.log("Found addToGardenButton, adding click handler");
        addToGardenButton.addEventListener('click', function() {
            console.log("Add to garden button clicked");
            if (typeof currentPlant !== 'undefined' && currentPlant) {
                addToGarden(currentPlant);
            } else {
                alert("No plant identified yet");
            }
        });
    }
    
    // Add to garden button (Search tab)
    const searchAddToGardenButton = document.getElementById('searchAddToGardenButton');
    if (searchAddToGardenButton) {
        console.log("Found searchAddToGardenButton, adding click handler");
        searchAddToGardenButton.addEventListener('click', function() {
            console.log("Search add to garden button clicked");
            if (typeof currentPlant !== 'undefined' && currentPlant) {
                addToGarden(currentPlant);
            } else {
                alert("No plant selected yet");
            }
        });
    }
    
    // Load garden data when page loads
    loadGardenData();
});

console.log("Critical function fixes loaded");
