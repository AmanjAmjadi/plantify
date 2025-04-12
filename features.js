// features.js - Handles new features like growth tracking, health checks, social sharing

// Growth Tracking
const plantGrowthData = {}; // Stores growth data by plant ID

// Initialize features
async function initFeatures() {
    // Load growth data
    const savedGrowthData = await loadSetting('plantGrowthData', null);
    if (savedGrowthData) {
        Object.assign(plantGrowthData, savedGrowthData);
    }
    
    // Setup event listeners
    setupFeatureEventListeners();
    
    // Initialize location-based features if location is allowed
    const locationAllowed = await loadSetting('locationAllowed', false);
    if (locationAllowed) {
        initLocationBasedFeatures();
    }
}

// Initialize location-based recommendations
function initLocationBasedFeatures() {
    if (!userLocation) return;
    
    // Load local plant recommendations based on location
    loadLocalPlantRecommendations();
    
    // Load nearby plant stores
    loadNearbyPlantStores();
}

// Find plant shops near user's location
async function loadNearbyPlantStores() {
    if (!userLocation) return;
    
    const storesList = document.getElementById('storesList');
    if (!storesList) return;
    
    // In a real implementation, you would use Google Places API
    // For demo purposes, we'll use mock data
    
    // Mock data for nearby stores
    const mockStores = [
        {
            name: "Green Thumb Garden Center",
            distance: "1.2 km",
            rating: 4.7,
            address: "123 Plant Street"
        },
        {
            name: "Blossom Nursery",
            distance: "2.5 km",
            rating: 4.5,
            address: "456 Flower Avenue"
        },
        {
            name: "Plantify Emporium",
            distance: "3.8 km",
            rating: 4.9,
            address: "789 Botanical Boulevard"
        }
    ];
    
    // Clear loading state
    storesList.innerHTML = '';
    
    // Populate the stores list
    mockStores.forEach(store => {
        const storeItem = document.createElement('div');
        storeItem.className = 'p-3 border rounded-lg flex justify-between items-center';
        storeItem.innerHTML = `
            <div>
                <h5 class="font-medium">${store.name}</h5>
                <p class="text-xs text-gray-500">${store.address}</p>
            </div>
            <div class="text-right">
                <p class="text-xs">${store.distance}</p>
                <p class="flex items-center text-yellow-500 text-xs">
                    ${store.rating} <i class="fas fa-star ml-1"></i>
                </p>
            </div>
        `;
        storesList.appendChild(storeItem);
    });
}

// Load plant recommendations based on location
async function loadLocalPlantRecommendations() {
    if (!userLocation) return;
    
    const recommendationsContainer = document.getElementById('locationRecommendations');
    if (!recommendationsContainer) return;
    
    // In a real implementation, you would use a plant database with geolocation data
    // For demo purposes, we'll use mock recommendations based on season
    
    // Clear loading state
    recommendationsContainer.innerHTML = '';
    
    // Get recommended plants based on current season and location
    const seasonalPlants = getSeasonalPlantRecommendations();
    
    // Add recommendations to container
    seasonalPlants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.className = 'card p-4';
        plantCard.innerHTML = `
            <div class="h-32 mb-3 overflow-hidden rounded bg-green-50 flex items-center justify-center">
                <img src="${plant.image}" alt="${plant.name}" class="w-full h-full object-cover">
            </div>
            <h4 class="font-medium text-lg mb-1">${plant.name}</h4>
            <p class="text-xs text-gray-500 mb-2">${plant.scientific}</p>
            <p class="text-sm mb-3">${plant.description}</p>
            <button class="recommend-search-btn btn-outline text-xs px-3 py-1.5 w-full" data-name="${plant.name}">
                <i class="fas fa-search mr-1"></i> Find This Plant
            </button>
        `;
        recommendationsContainer.appendChild(plantCard);
    });
    
    // Add event listeners to search buttons
    const searchButtons = document.querySelectorAll('.recommend-search-btn');
    searchButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const plantName = btn.getAttribute('data-name');
            
            // Fill search field with plant name and switch to search tab
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = plantName;
                switchTab('search');
                
                // Trigger search
                setTimeout(() => {
                    const searchButton = document.getElementById('searchButton');
                    if (searchButton) searchButton.click();
                }, 100);
            }
        });
    });
}

// Get seasonal plant recommendations
function getSeasonalPlantRecommendations() {
    // Use the current season to recommend plants
    // This is a simplified example - in a real app, you would use more sophisticated data
    
    const recommendationsBySeason = {
        spring: [
            {
                name: "Phlox",
                scientific: "Phlox paniculata",
                description: "Hardy perennial with fragrant blooms perfect for spring planting in your region.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNkNDgxYzgiPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEwMCIgcj0iMzAiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSIxMjQiIHI9IjI1Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTY1IiByPSIyOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE2MCIgcj0iMjYiLz48Y2lyY2xlIGN4PSI4NiIgY3k9IjEyNCIgcj0iMjIiLz48L2c+PGcgZmlsbD0iIzc2YzI3NSI+PHBhdGggZD0iTTEyOCAxMzBWMjIwIi8+PHBhdGggZD0iTTEyOCAxODBMMTYwIDE1MCIgc3Ryb2tlPSIjNzZjMjc1IiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTI4IDE2MEw5MCAxNDAiIHN0cm9rZT0iIzc2YzI3NSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg=="
            },
            {
                name: "Hosta",
                scientific: "Hosta spp.",
                description: "Shade-loving perennial with beautiful foliage, perfect for areas with spring rain.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiM1MmEzNTEiPjxwYXRoIGQ9Ik0xMjggNjBDOTAgOTAgNzAgMTQwIDcwIDE5MEg5MFYxMzBDMTEwIDEwMCAxNDAgOTAgMTQwIDkwQzE0MCA5MCAxNzAgMTAwIDE5MCAxMzBWMTkwSDIxMEMyMTAgMTQwIDE5MCA5MCAxNTIgNjBIMTI4WiIvPjwvZz48cGF0aCBkPSJNOTAgMTMwVjE5MCIgc3Ryb2tlPSIjM2I4YTNhIiBzdHJva2Utd2lkdGg9IjMiLz48cGF0aCBkPSJNMTkwIDEzMFYxOTAiIHN0cm9rZT0iIzNiOGEzYSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
            },
            {
                name: "Bleeding Heart",
                scientific: "Dicentra spectabilis",
                description: "Classic spring perennial with heart-shaped flowers suited to partial shade.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNlODc5OTgiPjxwYXRoIGQ9Ik05MCAxMDBDNzAgODAgNjAgMTAwIDcwIDEyMEM4MCAxNDAgMTIwIDE2MCAxMjggMTgwQzEzNiAxNjAgMTc2IDE0MCAxODYgMTIwQzE5NiAxMDAgMTg2IDgwIDE2NiAxMDBDMTQ2IDEyMCAxMjggMTQwIDEyOCAxNDBDMTI4IDE0MCAxMTAgMTIwIDkwIDEwMFoiLz48L2c+PHBhdGggZD0iTTEyOCAxNDBWMTkwIiBzdHJva2U9IiM3NmMyNzUiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg=="
            }
        ],
        summer: [
            {
                name: "Echinacea",
                scientific: "Echinacea purpurea",
                description: "Drought-tolerant perennial with vibrant flowers that attract butterflies.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiNiODRmOWEiLz48ZyBmaWxsPSIjZThhOWRhIj48cGF0aCBkPSJNOTAgOTBMMTEwIDExMCIvPjxwYXRoIGQ9Ik03NSAxMjBMMTA1IDEyMCIvPjxwYXRoIGQ9Ik05MCAxNTBMMTEwIDEzMCIvPjxwYXRoIGQ9Ik0xMjggMTY1VjE5MCIvPjxwYXRoIGQ9Ik0xNjYgMTUwTDE0NiAxMzAiLz48cGF0aCBkPSJNMTgxIDEyMEwxNTEgMTIwIi8+PHBhdGggZD0iTTE2NiA5MEwxNDYgMTEwIi8+PHBhdGggZD0iTTEyOCA3NVY1MCIvPjwvZz48cGF0aCBkPSJNMTI4IDE2MFYyMjAiIHN0cm9rZT0iIzc2YzI3NSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
            },
            {
                name: "Lantana",
                scientific: "Lantana camara",
                description: "Heat-loving plant with clusters of flowers that bloom all summer long.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnPjxjaXJjbGUgY3g9IjExOCIgY3k9IjEwMCIgcj0iMTIiIGZpbGw9IiNmZmNjMDAiLz48Y2lyY2xlIGN4PSIxMzgiIGN5PSIxMDAiIHI9IjEyIiBmaWxsPSIjZmY5OTAwIi8+PGNpcmNsZSBjeD0iMTQ4IiBjeT0iMTE1IiByPSIxMiIgZmlsbD0iI2ZmNjY2NiIvPjxjaXJjbGUgY3g9IjE0OCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiNmZjMzNjYiLz48Y2lyY2xlIGN4PSIxMzgiIGN5PSIxNTAiIHI9IjEyIiBmaWxsPSIjY2M2NmZmIi8+PGNpcmNsZSBjeD0iMTE4IiBjeT0iMTUwIiByPSIxMiIgZmlsbD0iIzY2OTlmZiIvPjxjaXJjbGUgY3g9IjEwOCIgY3k9IjEzNSIgcj0iMTIiIGZpbGw9IiMzM2NjZmYiLz48Y2lyY2xlIGN4PSIxMDgiIGN5PSIxMTUiIHI9IjEyIiBmaWxsPSIjMzNmZmNjIi8+PC9nPjxwYXRoIGQ9Ik0xMjggMTYwVjIyMCIgc3Ryb2tlPSIjNzZjMjc1IiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4="
            },
            {
                name: "Zinnia",
                scientific: "Zinnia elegans",
                description: "Easy-to-grow annual with colorful flowers that thrive in summer heat.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNmZjY2NjYiPjxwYXRoIGQ9Ik0xMjggODBMMTQzIDExMEgxMTNaIi8+PHBhdGggZD0iTTE2OCA5NUwxNTMgMTI1SDE4M1oiLz48cGF0aCBkPSJNMTY4IDE1NUwxNTMgMTI1SDE4M1oiLz48cGF0aCBkPSJNMTI4IDE3MEwxNDMgMTQwSDExM1oiLz48cGF0aCBkPSJNODggMTU1TDEwMyAxMjVINzNaIi8+PHBhdGggZD0iTTg4IDk1TDEwMyAxMjVINzNaIi8+PC9nPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEyNSIgcj0iMTUiIGZpbGw9IiNmZmNjMDAiLz48cGF0aCBkPSJNMTI4IDE3MFYyMjAiIHN0cm9rZT0iIzc2YzI3NSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
            }
        ],
        fall: [
            {
                name: "Chrysanthemum",
                scientific: "Chrysanthemum × morifolium",
                description: "Classic fall perennial with showy blooms in many colors.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNmZmNjMDAiPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEyNSIgcj0iMjUiLz48cGF0aCBkPSJNMTI4IDgwVjUwIi8+PHBhdGggZD0iTTE2OCA5NUwxOTggODUiLz48cGF0aCBkPSJNMTcwIDE0MEwyMDAgMTYwIi8+PHBhdGggZD0iTTEyOCAxNzBWMjAwIi8+PHBhdGggZD0iTTg4IDE0MEw1OCAxNjAiLz48cGF0aCBkPSJNODUgOTVMNTUgODUiLz48cGF0aCBkPSJNMTQ4IDg1TDE2OCA1NSIvPjxwYXRoIGQ9Ik0xNzAgMTEwTDIwMCAxMDAiLz48cGF0aCBkPSJNMTUzIDE1NUwxODMgMTg1Ii8+PHBhdGggZD0iTTEyOCAxNjVWMjE1Ii8+PHBhdGggZD0iTTEwMyAxNTVMNzMgMTg1Ii8+PHBhdGggZD0iTTg1IDE0MEw1NSAxNTAiLz48cGF0aCBkPSJNODUgMTEwTDU1IDEwMCIvPjxwYXRoIGQ9Ik0xMDggODVMODggNTUiLz48L2c+PHBhdGggZD0iTTEyOCAxNzBWMjIwIiBzdHJva2U9IiM3NmMyNzUiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg=="
            },
            {
                name: "Sedum",
                scientific: "Sedum 'Autumn Joy'",
                description: "Succulent perennial with late-season blooms that attract butterflies.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNkNDc3YWIiPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjkwIiByPSIxNSIvPjxjaXJjbGUgY3g9IjE1MyIgY3k9IjEwMCIgcj0iMTUiLz48Y2lyY2xlIGN4PSIxNjgiIGN5PSIxMjAiIHI9IjE1Ii8+PGNpcmNsZSBjeD0iMTUzIiBjeT0iMTQwIiByPSIxNSIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjE1MCIgcj0iMTUiLz48Y2lyY2xlIGN4PSIxMDMiIGN5PSIxNDAiIHI9IjE1Ii8+PGNpcmNsZSBjeD0iODgiIGN5PSIxMjAiIHI9IjE1Ii8+PGNpcmNsZSBjeD0iMTAzIiBjeT0iMTAwIiByPSIxNSIvPjwvZz48cGF0aCBkPSJNMTI4IDE2MFYyMjAiIHN0cm9rZT0iIzc2YzI3NSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
            },
            {
                name: "Aster",
                scientific: "Symphyotrichum spp.",
                description: "Late-blooming perennial with daisy-like flowers, perfect for fall gardens.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNhNTgxZTIiPjxwYXRoIGQ9Ik0xMjggNjVMMTM4IDExNUgxMThaIi8+PHBhdGggZD0iTTE5MCA5NEwxNDUgMTIwSDE3NVoiLz48cGF0aCBkPSJNMTkwIDE1NkwxNDUgMTMwSDE3NVoiLz48cGF0aCBkPSJNMTI4IDE4NUwxMzggMTM1SDExOFoiLz48cGF0aCBkPSJNNjYgMTU2TDExMSAxMzBIODFaIi8+PHBhdGggZD0iTTY2IDk0TDExMSAxMjBIODFaIi8+PHBhdGggZD0iTTE1OCA4MEwxNTggMTMwIi8+PHBhdGggZD0iTTE1OCAxODBMMTU4IDEzMCIvPjxwYXRoIGQ9Ik85OCA4MEw5OCAxMzAiLz48cGF0aCBkPSJNOTggMTgwTDk4IDEzMCIvPjwvZz48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjUiIHI9IjE1IiBmaWxsPSIjZmZkNzAwIi8+PHBhdGggZD0iTTEyOCAxODBWMjIwIiBzdHJva2U9IiM3NmMyNzUiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg=="
            }
        ],
        winter: [
            {
                name: "Hellebore",
                scientific: "Helleborus orientalis",
                description: "Winter-flowering perennial with elegant blooms, also known as Lenten rose.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNlNGM2ZTMiPjxwYXRoIGQ9Ik05NSA5MEwxMjggMTI1TDE2MSA5MEgxMjNIOTVaIi8+PHBhdGggZD0iTTE3NSAxMDZMMTI4IDEyNUw4MSAxMDZWMTI1VjE0NVoiLz48cGF0aCBkPSJNMTYxIDE2MEwxMjggMTI1TDk1IDE2MEgxMzNIMTYxWiIvPjxwYXRoIGQ9Ik04MSAxNDVMMTI4IDEyNUwxNzUgMTQ1VjEyNVYxMDZaIi8+PC9nPjxwYXRoIGQ9Ik0xMjggMTUwVjIyMCIgc3Ryb2tlPSIjNzZjMjc1IiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4="
            },
            {
                name: "Winter Jasmine",
                scientific: "Jasminum nudiflorum",
                description: "Bright yellow flowers on green stems in winter, providing color when most plants are dormant.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNmZmQ3MDAiPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjkwIiByPSIxMCIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjExMCIgcj0iMTAiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSIxMzUiIHI9IjEwIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTYwIiByPSIxMCIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjE0MCIgcj0iMTAiLz48Y2lyY2xlIGN4PSI5MCIgY3k9IjEyNSIgcj0iMTAiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjEwMCIgcj0iMTAiLz48L2c+PHBhdGggZD0iTTgwIDEwMEMxMDAgODAgMTQwIDE2MCAxNzAgMTM1IiBzdHJva2U9IiM3NmMyNzUiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0xMjAgOTBDMTUwIDExMCAxMjAgMTQwIDkwIDEyNSIgc3Ryb2tlPSIjNzZjMjc1IiBzdHJva2Utd2lkdGg9IjMiLz48cGF0aCBkPSJNMTUwIDExMEMxNTAgMTYwIDEyMCAxNDAgODAgMTAwIiBzdHJva2U9IiM3NmMyNzUiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0xNzAgMTM1QzE1MCAxNjAgMTIwIDE0MCA5MCAxMjUiIHN0cm9rZT0iIzc2YzI3NSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
            },
            {
                name: "Winter Heath",
                scientific: "Erica carnea",
                description: "Low-growing evergreen shrub with tiny bell-shaped flowers in winter.",
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U4ZjVlOSIvPjxnIGZpbGw9IiNlNDc5OTgiPjxwYXRoIGQ9Ik0xMjAgOTVWMTI1Ii8+PHBhdGggZD0iTTEzMCA4NVYxMTUiLz48cGF0aCBkPSJNMTQwIDEwMFYxMzAiLz48cGF0aCBkPSJNMTUwIDkwVjEyMCIvPjxwYXRoIGQ9Ik0xNjAgMTA1VjEzNSIvPjxwYXRoIGQ9Ik0xMTAgOTBWMTIwIi8+PHBhdGggZD0iTTEwMCAxMDVWMTM1Ii8+PHBhdGggZD0iTTkwIDk1VjEyNSIvPjxwYXRoIGQ9Ik04MCAxMTBWMTQwIi8+PHBhdGggZD0iTTE3MCAxMjBWMTUwIi8+PC9nPjxnIGZpbGw9IiM1Mjg3YzAiPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEyNSIgcj0iNSIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjExNSIgcj0iNSIvPjxjaXJjbGUgY3g9IjE0MCIgY3k9IjEzMCIgcj0iNSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iNSIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjEzNSIgcj0iNSIvPjxjaXJjbGUgY3g9IjExMCIgY3k9IjEyMCIgcj0iNSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEzNSIgcj0iNSIvPjxjaXJjbGUgY3g9IjkwIiBjeT0iMTI1IiByPSI1Ii8+PGNpcmNsZSBjeD0iODAiIGN5PSIxNDAiIHI9IjUiLz48Y2lyY2xlIGN4PSIxNzAiIGN5PSIxNTAiIHI9IjUiLz48L2c+PHBhdGggZD0iTTgwIDE0MEMxMjAgMTgwIDE3MCAxNTAiIHN0cm9rZT0iIzZhYTA2OSIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTExMCAxMjBDMTMwIDE3MCAxNzAgMTUwIiBzdHJva2U9IiM2YWEwNjkiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik05MCAxMjVDMTQwIDE2MCAxNjAgMTM1IiBzdHJva2U9IiM2YWEwNjkiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg=="
            }
        ]
    };
    
    // Return recommendations for the current season
    return recommendationsBySeason[currentSeason] || recommendationsBySeason.spring;
}

// Health Check Functionality
async function analyzePlantHealth(imageData) {
    try {
        // First try using Gemini API
        const healthData = await getHealthAnalysisFromGemini(imageData);
        
        if (healthData) {
            return healthData;
        }
        
        // Fallback to mock data if Gemini fails
        return {
            status: "Possible Issues Detected",
            problem: "Yellowing leaves may indicate overwatering or nutrient deficiency. Some leaf spots visible.",
            severity: "moderate",
            treatment: [
                "Allow soil to dry out between waterings",
                "Consider adding a balanced fertilizer",
                "Remove affected leaves and improve air circulation"
            ]
        };
    } catch (error) {
        console.error("Error analyzing plant health:", error);
        
        // Return basic fallback data
        return {
            status: "Analysis Failed",
            problem: "We couldn't analyze your plant. The image may be unclear or our service is temporarily unavailable.",
            severity: "unknown",
            treatment: [
                "Try taking a clearer photo with better lighting",
                "Make sure the affected areas are clearly visible",
                "Check your internet connection and try again"
            ]
        };
    }
}

// Get health analysis from Gemini
async function getHealthAnalysisFromGemini(imageData) {
    try {
        const imageBase64 = imageData.split(',')[1]; // Remove data URL prefix
        
        // Using the Gemini model for health analysis
        const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
        
        // The prompt for health diagnosis
        const prompt = `
            Analyze this plant for health issues. Identify any diseases, pest problems, or care issues.
            
            Return your analysis as JSON with these exact fields:
            {
                "status": "Healthy" or a brief status like "Nutrient Deficiency Detected",
                "problem": Detailed description of the issue(s),
                "severity": "mild", "moderate", or "severe",
                "treatment": Array of treatment recommendations as specific actions
            }
            
            Return ONLY the JSON without additional text or markdown formatting.
        `;
        
        // Format request data
        const requestData = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generation_config: {
                temperature: 0.2,
                top_k: 32,
                top_p: 1,
                max_output_tokens: 2048,
            }
        };
        
        // Make request to Gemini API
        const response = await fetch(`${apiUrl}?key=${currentApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }
        
        // Parse JSON and return the health data
        return JSON.parse(jsonMatch[0]);
        
    } catch (error) {
        console.error("Error in Gemini API for health check:", error);
        return null;
    }
}

// Growth Tracking Functions
function addGrowthEntry(plantId, entryData) {
    if (!plantId || !entryData) return false;
    
    // Initialize the growth data array for this plant if it doesn't exist
    if (!plantGrowthData[plantId]) {
        plantGrowthData[plantId] = [];
    }
    
    // Add the new entry
    plantGrowthData[plantId].push({
        ...entryData,
        date: entryData.date || new Date().toISOString().split('T')[0], // Use provided date or today
        id: generateId()
    });
    
    // Sort entries by date
    plantGrowthData[plantId].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    // Save growth data
    saveSetting('plantGrowthData', plantGrowthData);
    
    return true;
}

function getGrowthData(plantId) {
    return plantGrowthData[plantId] || [];
}

function calculateGrowthStats(plantId) {
    const entries = getGrowthData(plantId);
    
    if (entries.length < 2) {
        return {
            heightIncrease: 0,
            newLeaves: 0,
            growthRate: "N/A",
            daysTracked: entries.length > 0 ? 1 : 0
        };
    }
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate stats
    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    
    const firstDate = new Date(firstEntry.date);
    const lastDate = new Date(lastEntry.date);
    const daysDiff = Math.round((lastDate - firstDate) / (24 * 60 * 60 * 1000));
    
    const heightIncrease = (lastEntry.height || 0) - (firstEntry.height || 0);
    const leafIncrease = (lastEntry.leaves || 0) - (firstEntry.leaves || 0);
    
    // Calculate growth rate (cm per month)
    let growthRate = "N/A";
    if (heightIncrease > 0 && daysDiff > 0) {
        const monthlyRate = (heightIncrease / daysDiff) * 30;
        growthRate = monthlyRate.toFixed(1) + " cm/month";
    }
    
    return {
        heightIncrease,
        newLeaves: leafIncrease,
        growthRate,
        daysTracked: daysDiff || 1
    };
}

// Social Sharing Functions
function sharePlant(platform, plantData, message = "") {
    if (!plantData) return false;
    
    // Build share message
    const shareText = `Check out my ${plantData.commonName} (${plantData.scientificName}) on Plantify! ${message}`;
    
    // Platform-specific sharing
    switch (platform) {
        case 'facebook':
            // In a real app, this would open a Facebook share dialog
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank');
            break;
            
        case 'twitter':
            // Twitter (now X) sharing
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
            break;
            
        case 'instagram':
            // Instagram doesn't support direct sharing via web links
            // In a real app, you would generate a shareable image and prompt user to save it
            alert("To share on Instagram: Screenshot this plant, open Instagram, and post the image!");
            break;
            
        case 'whatsapp':
            // WhatsApp sharing
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + window.location.href)}`, '_blank');
            break;
            
        default:
            // Copy to clipboard as fallback
            const textArea = document.createElement("textarea");
            textArea.value = shareText + " " + window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showNotification("Share link copied to clipboard!");
            return true;
    }
    
    return true;
}

// Setup all event listeners for new features
function setupFeatureEventListeners() {
    // Health Check Tab
    document.getElementById('startHealthCameraButton')?.addEventListener('click', async () => {
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
            const videoElement = document.getElementById('healthVideoElement');
            const cameraContainer = document.getElementById('health-camera-container');
            
            if (videoElement && cameraContainer) {
                videoElement.srcObject = stream;
                cameraContainer.classList.remove('hidden');
                document.getElementById('startHealthCameraButton').classList.add('hidden');
                document.getElementById('healthCapturedPhoto').classList.add('hidden');
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            showNotification("Error accessing camera. Please check permissions.");
        }
    });
    
    document.getElementById('healthCaptureButton')?.addEventListener('click', () => {
        if (!stream) return;
        
        // Setup canvas for capturing
        const canvas = document.getElementById('healthCapturedPhoto');
        const videoElement = document.getElementById('healthVideoElement');
        
        if (canvas && videoElement) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Draw video frame to canvas
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            // Stop the camera and display captured photo
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                videoElement.srcObject = null;
            }
            
            document.getElementById('health-camera-container').classList.add('hidden');
            document.getElementById('startHealthCameraButton').classList.remove('hidden');
            canvas.classList.remove('hidden');
            
            // Process the health check
            processHealthCheck(canvas);
        }
    });
    
    document.getElementById('healthImageUpload')?.addEventListener('change', (event) => {
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
                const canvas = document.getElementById('healthCapturedPhoto');
                if (canvas) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // Display canvas and hide camera button
                    canvas.classList.remove('hidden');
                    document.getElementById('health-camera-container')?.classList.add('hidden');
                    
                    // Process the health check
                    processHealthCheck(canvas);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // "Check Health" button from Identify tab
    document.getElementById('checkHealthButton')?.addEventListener('click', () => {
        // If we have a current plant, switch to health tab with this image
        if (currentPlant && currentPlant.image) {
            const img = new Image();
            img.onload = function() {
                // Switch to health tab
                switchTab('health');
                
                // Setup canvas for health check
                const canvas = document.getElementById('healthCapturedPhoto');
                if (canvas) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // Display canvas
                    canvas.classList.remove('hidden');
                    
                    // Process the health check
                    processHealthCheck(canvas);
                }
            };
            img.src = currentPlant.image;
        } else {
            // Just switch to health tab
            switchTab('health');
        }
    });
    
    // Social Sharing
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('data-platform');
            const message = document.getElementById('shareMessage')?.value || "";
            
            // Get the plant data
            const plantName = document.getElementById('sharePlantName')?.textContent;
            const plantInfo = document.getElementById('sharePlantInfo')?.textContent;
            const plantImage = document.getElementById('shareImage')?.src;
            
            const plantData = {
                commonName: plantName || "My Plant",
                scientificName: "Plant species",
                info: plantInfo || "A beautiful plant in my collection.",
                image: plantImage || ""
            };
            
            sharePlant(platform, plantData, message);
            
            showNotification(`Sharing to ${platform}...`);
            
            // Close modal after sharing
            document.getElementById('shareModal')?.classList.add('hidden');
        });
    });
    
    // Copy Share Link Button
    document.getElementById('copyShareLink')?.addEventListener('click', () => {
        const message = document.getElementById('shareMessage')?.value || "";
        
        // Get the plant data
        const plantName = document.getElementById('sharePlantName')?.textContent;
        const plantInfo = document.getElementById('sharePlantInfo')?.textContent;
        
        const plantData = {
            commonName: plantName || "My Plant",
            scientificName: "Plant species",
            info: plantInfo || "A beautiful plant in my collection."
        };
        
        sharePlant('copy', plantData, message);
    });
    
    // Modal Share Button
    document.getElementById('modalShareButton')?.addEventListener('click', () => {
        if (!selectedPlantId) return;
        
        const plant = garden.find(p => p.id === selectedPlantId);
        if (!plant) return;
        
        // Populate share modal
        document.getElementById('sharePlantName').textContent = plant.commonName;
        document.getElementById('sharePlantInfo').textContent = 
            `${plant.scientificName} - ${plant.info.substring(0, 100)}...`;
        document.getElementById('shareImage').src = plant.image;
        
        // Clear previous message
        document.getElementById('shareMessage').value = "";
        
        // Show share modal
        document.getElementById('shareModal').classList.remove('hidden');
    });
    
    // Close Share Modal
    document.getElementById('closeShareModal')?.addEventListener('click', () => {
        document.getElementById('shareModal').classList.add('hidden');
    });
    
    // Growth Tracking
    document.getElementById('addGrowthEntryButton')?.addEventListener('click', () => {
        if (!selectedPlantId) return;
        
        // Set date field to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('growthDate').value = today;
        
        // Clear previous values
        document.getElementById('plantHeight').value = "";
        document.getElementById('leafCount').value = "";
        document.getElementById('growthNotes').value = "";
        
        // Hide image preview
        document.getElementById('growthImagePreview').classList.add('hidden');
        
        // Show growth entry modal
        document.getElementById('growthEntryModal').classList.remove('hidden');
    });
    
    // Preview Growth Image
    document.getElementById('growthImageUpload')?.addEventListener('change', handleGrowthImageUpload);
    document.getElementById('growthImageBrowse')?.addEventListener('change', handleGrowthImageUpload);
    
    // Close Growth Modal
    document.getElementById('closeGrowthModal')?.addEventListener('click', () => {
        document.getElementById('growthEntryModal').classList.add('hidden');
    });
    
    // Save Growth Entry
    document.getElementById('saveGrowthEntry')?.addEventListener('click', () => {
        if (!selectedPlantId) return;
        
        // Get values
        const date = document.getElementById('growthDate').value;
        const height = parseFloat(document.getElementById('plantHeight').value) || 0;
        const leaves = parseInt(document.getElementById('leafCount').value) || 0;
        const notes = document.getElementById('growthNotes').value;
        
        // Get image if available
        const imagePreview = document.getElementById('growthPreviewImage');
        const image = imagePreview?.src || null;
        
        // Create entry data
        const entryData = {
            date,
            height,
            leaves,
            notes,
            image
        };
        
        // Add entry
        const success = addGrowthEntry(selectedPlantId, entryData);
        
        if (success) {
            showNotification("Growth entry saved!");
            document.getElementById('growthEntryModal').classList.add('hidden');
            
            // Update growth timeline
            updateGrowthTimeline(selectedPlantId);
        } else {
            showNotification("Error saving growth entry");
        }
    });
    
    // Modal Tab Navigation
    document.getElementById('modal-tab-info')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchModalTab('info');
    });
    
    document.getElementById('modal-tab-care')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchModalTab('care');
    });
    
    document.getElementById('modal-tab-growth')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchModalTab('growth');
    });
    
    document.getElementById('modal-tab-tips')?.addEventListener('click', async (e) => {
        e.preventDefault();
        switchModalTab('tips');
        
        // Load plant tips if not already loaded
        if (selectedPlantId) {
            const plant = garden.find(p => p.id === selectedPlantId);
            if (plant) {
                await loadPlantTips(plant);
            }
        }
    });
    
    // Location features
    document.getElementById('refreshLocationBtn')?.addEventListener('click', () => {
        getUserLocation();
        showNotification("Updating location...");
    });
    
    document.getElementById('findStoresBtn')?.addEventListener('click', () => {
        loadNearbyPlantStores();
        showNotification("Finding plant stores near you...");
    });
    
    // Community features
    document.getElementById('newPostBtn')?.addEventListener('click', () => {
        showNotification("Community posting is coming soon!");
    });
    
    document.getElementById('loadMorePostsBtn')?.addEventListener('click', () => {
        showNotification("More community posts are coming soon!");
    });
}

// Process health check
async function processHealthCheck(canvas) {
    // Show loading state
    document.getElementById('healthResults').classList.remove('hidden');
    document.getElementById('loadingHealth').classList.remove('hidden');
    document.getElementById('healthContent').classList.add('hidden');
    
    try {
        // Get image data
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Get health analysis
        const healthData = await analyzePlantHealth(imageData);
        
        // Update the health results
        document.getElementById('healthPlantImage').src = imageData;
        document.getElementById('healthStatus').textContent = healthData.status;
        document.getElementById('healthProblem').textContent = healthData.problem;
        
        // Update health indicator
        const indicator = document.getElementById('healthIndicator');
        if (indicator) {
            indicator.textContent = healthData.severity;
            
            // Set color based on severity
            if (healthData.severity === 'mild') {
                indicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
            } else if (healthData.severity === 'moderate') {
                indicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800';
            } else if (healthData.severity === 'severe') {
                indicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
            } else {
                indicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800';
            }
        }
        
        // Update treatment recommendations
        const treatmentEl = document.getElementById('healthTreatment');
        if (treatmentEl && healthData.treatment) {
            treatmentEl.innerHTML = '';
            
            if (Array.isArray(healthData.treatment)) {
                const ul = document.createElement('ul');
                ul.className = 'list-disc ml-5 space-y-1';
                
                healthData.treatment.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                
                treatmentEl.appendChild(ul);
            } else {
                treatmentEl.textContent = healthData.treatment;
            }
        }
        
        // Show results
        document.getElementById('loadingHealth').classList.add('hidden');
        document.getElementById('healthContent').classList.remove('hidden');
        
    } catch (error) {
        console.error("Error processing health check:", error);
        showNotification("Error analyzing plant health. Please try again.");
        
        // Hide loading state
        document.getElementById('loadingHealth').classList.add('hidden');
    }
}

// Handle growth image upload
function handleGrowthImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.match('image.*')) {
        showNotification("Please select a valid image file");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('growthPreviewImage');
        if (previewImage) {
            previewImage.src = e.target.result;
            document.getElementById('growthImagePreview').classList.remove('hidden');
        }
    };
    reader.readAsDataURL(file);
}

// Update growth timeline
function updateGrowthTimeline(plantId) {
    const entries = getGrowthData(plantId);
    const timelineEl = document.getElementById('growthTimeline');
    const emptyTimelineEl = document.getElementById('emptyGrowthTimeline');
    
    if (!timelineEl || !emptyTimelineEl) return;
    
    if (entries.length === 0) {
        timelineEl.classList.add('hidden');
        emptyTimelineEl.classList.remove('hidden');
        return;
    }
    
    // Show timeline, hide empty state
    timelineEl.classList.remove('hidden');
    emptyTimelineEl.classList.add('hidden');
    
    // Clear timeline
    timelineEl.innerHTML = '';
    
    // Add entries to timeline
    entries.forEach((entry, index) => {
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const entryEl = document.createElement('div');
        entryEl.className = 'relative pl-8 pb-5';
        
        // Timeline line and dot
        entryEl.innerHTML = `
            <div class="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div class="absolute left-0 top-2 w-5 h-5 rounded-full border-2 border-primary-color bg-white dark:bg-gray-800"></div>
        `;
        
        // Entry content
        const contentEl = document.createElement('div');
        contentEl.className = 'border rounded-lg p-3';
        
        // Date header
        const dateEl = document.createElement('div');
        dateEl.className = 'flex justify-between items-center mb-2';
        dateEl.innerHTML = `
            <h5 class="font-medium">${formattedDate}</h5>
            <span class="text-xs text-gray-500">#${index + 1}</span>
        `;
        contentEl.appendChild(dateEl);
        
        // Stats grid
        if (entry.height || entry.leaves) {
            const statsEl = document.createElement('div');
            statsEl.className = 'grid grid-cols-2 gap-2 mb-2 text-sm';
            statsEl.innerHTML = `
                ${entry.height ? `<div><span class="text-gray-500">Height:</span> ${entry.height} cm</div>` : ''}
                ${entry.leaves ? `<div><span class="text-gray-500">Leaves:</span> ${entry.leaves}</div>` : ''}
            `;
            contentEl.appendChild(statsEl);
        }
        
        // Notes
        if (entry.notes) {
            const notesEl = document.createElement('p');
            notesEl.className = 'text-sm';
            notesEl.textContent = entry.notes;
            contentEl.appendChild(notesEl);
        }
        
        // Image if available
        if (entry.image) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'mt-2';
            imgContainer.innerHTML = `<img src="${entry.image}" alt="Growth entry" class="w-full h-32 object-cover rounded">`;
            contentEl.appendChild(imgContainer);
        }
        
        entryEl.appendChild(contentEl);
        timelineEl.appendChild(entryEl);
    });
    
    // Update growth stats
    const stats = calculateGrowthStats(plantId);
    
    document.getElementById('heightIncrease').textContent = stats.heightIncrease > 0 ? 
        `+${stats.heightIncrease} cm` : `${stats.heightIncrease} cm`;
        
    document.getElementById('newLeaves').textContent = stats.newLeaves > 0 ?
        `+${stats.newLeaves}` : `${stats.newLeaves}`;
        
    document.getElementById('growthRate').textContent = stats.growthRate;
    document.getElementById('daysTracked').textContent = stats.daysTracked;
}

// Load plant tips
async function loadPlantTips(plant) {
    // Show loading state
    document.getElementById('lightingTips').textContent = "Loading lighting tips...";
    document.getElementById('wateringTips').textContent = "Loading watering tips...";
    document.getElementById('soilTips').textContent = "Loading soil tips...";
    document.getElementById('commonIssues').textContent = "Loading common issues...";
    
    try {
        // Get plant care tips
        const tips = await generatePlantCareTips(plant);
        
        if (tips) {
            // Update tips UI
            document.getElementById('lightingTips').textContent = tips.lighting;
            document.getElementById('wateringTips').textContent = tips.watering;
            document.getElementById('soilTips').textContent = tips.soil;
            document.getElementById('commonIssues').textContent = tips.commonIssues;
        }
    } catch (error) {
        console.error("Error loading plant tips:", error);
        
        // Fallback to basic tips
        document.getElementById('lightingTips').textContent = getLightingTipsForPlant(plant);
        document.getElementById('wateringTips').textContent = getWateringTipsForPlant(plant);
        document.getElementById('soilTips').textContent = getSoilTipsForPlant(plant);
        document.getElementById('commonIssues').textContent = getCommonIssuesForPlant(plant);
    }
}

// Switch between modal tabs
function switchModalTab(tabId) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('[id^="modal-tab-"]');
    tabButtons.forEach(btn => {
        if (btn.id === `modal-tab-${tabId}`) {
            btn.classList.add('border-primary-color', 'active');
            btn.setAttribute('aria-current', 'page');
        } else {
            btn.classList.remove('border-primary-color', 'active');
            btn.classList.add('border-transparent', 'hover:border-gray-300');
            btn.removeAttribute('aria-current');
        }
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('[id^="modal-content-"]');
    tabContents.forEach(content => {
        if (content.id === `modal-content-${tabId}`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
    
    // Special actions for certain tabs
    if (tabId === 'growth' && selectedPlantId) {
        updateGrowthTimeline(selectedPlantId);
    }
}
