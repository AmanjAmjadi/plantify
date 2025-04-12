// care.js - Handles advanced care features and weather-based recommendations

// Weather and location data for seasonal adjustments
let userLocation = null;
let weatherData = null;
let currentSeason = null;

// Define preferences with default values
let carePreferences = {
    notificationFrequency: 'medium',
    adjustForWeather: true,
    seasonalAdjustments: true
};

// Initialize care management
async function initCare() {
    // Load care preferences
    const savedPrefs = await loadSetting('carePreferences', null);
    if (savedPrefs) {
        carePreferences = savedPrefs;
        
        // Update UI with saved preferences
        if (document.getElementById('notificationFrequency')) {
            document.getElementById('notificationFrequency').value = carePreferences.notificationFrequency;
        }
        if (document.getElementById('adjustForWeather')) {
            document.getElementById('adjustForWeather').checked = carePreferences.adjustForWeather;
        }
        if (document.getElementById('seasonalAdjustments')) {
            document.getElementById('seasonalAdjustments').checked = carePreferences.seasonalAdjustments;
        }
    }
    
    // Determine current season based on hemisphere and date
    determineSeason();
    
    // Try to get user location if they've allowed it
    const locationAllowed = await loadSetting('locationAllowed', false);
    if (locationAllowed) {
        getUserLocation();
    }
    
    // Setup event listeners
    setupCareEventListeners();
}

// Determine current season
function determineSeason() {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    // Default to Northern Hemisphere
    let hemisphere = 'northern';
    
    // Try to detect hemisphere from location if available
    if (userLocation && userLocation.latitude) {
        hemisphere = userLocation.latitude >= 0 ? 'northern' : 'southern';
    }
    
    if (hemisphere === 'northern') {
        if (month >= 2 && month <= 4) currentSeason = 'spring';
        else if (month >= 5 && month <= 7) currentSeason = 'summer';
        else if (month >= 8 && month <= 10) currentSeason = 'fall';
        else currentSeason = 'winter';
    } else {
        if (month >= 2 && month <= 4) currentSeason = 'fall';
        else if (month >= 5 && month <= 7) currentSeason = 'winter';
        else if (month >= 8 && month <= 10) currentSeason = 'spring';
        else currentSeason = 'summer';
    }
    
    return currentSeason;
}

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                // Save location preference
                saveSetting('locationAllowed', true);
                
                // Get weather data
                getWeatherData();
                
                // Update location-based UI
                updateLocationBasedUI();
            },
            error => {
                console.error("Error getting location:", error);
                userLocation = null;
                
                // Show error in weather widget
                const weatherElement = document.getElementById('weatherLocation');
                if (weatherElement) {
                    weatherElement.textContent = "Location access denied. Enable in settings.";
                }
            }
        );
    }
}

// Get weather data based on location
async function getWeatherData() {
    if (!userLocation) return;
    
    try {
        // Try to get location name first
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}`);
        const geocodeData = await geocodeResponse.json();
        
        let locationName = "Unknown Location";
        if (geocodeData && geocodeData.address) {
            locationName = geocodeData.address.city || geocodeData.address.town || geocodeData.address.village || geocodeData.address.county || "Unknown Location";
        }
        
        // For demo, we'll use a mock weather API response
        // In production, you would use a real weather API like OpenWeatherMap
        weatherData = {
            location: locationName,
            current: {
                temp: 22, // celsius
                humidity: 65, // percent
                conditions: "Partly Cloudy",
                icon: "cloud-sun"
            },
            forecast: [
                { day: "Today", temp: 22, conditions: "Partly Cloudy", icon: "cloud-sun" },
                { day: "Tomorrow", temp: 24, conditions: "Sunny", icon: "sun" },
                { day: "Day 3", temp: 21, conditions: "Rain", icon: "cloud-rain" }
            ]
        };
        
        // Update weather UI
        updateWeatherUI();
        
        // Update care recommendations based on weather
        if (carePreferences.adjustForWeather) {
            updateCareForWeather();
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Update care recommendations based on weather
function updateCareForWeather() {
    if (!weatherData || !garden || garden.length === 0) return;
    
    garden.forEach(plant => {
        // Basic algorithm for weather-based adjustments:
        
        // 1. Adjust for temperature
        let tempFactor = 1.0;
        if (weatherData.current.temp > 28) {
            // Hot weather - increase watering frequency
            tempFactor = 1.3;
        } else if (weatherData.current.temp < 10) {
            // Cold weather - decrease watering frequency
            tempFactor = 0.7;
        }
        
        // 2. Adjust for humidity
        let humidityFactor = 1.0;
        if (weatherData.current.humidity < 30) {
            // Dry air - increase watering
            humidityFactor = 1.2;
        } else if (weatherData.current.humidity > 80) {
            // Very humid - decrease watering
            humidityFactor = 0.8;
        }
        
        // 3. Adjust for rainfall (if we had this data)
        let rainFactor = 1.0;
        if (weatherData.current.conditions.toLowerCase().includes('rain')) {
            rainFactor = 0.5; // Significantly reduce watering need
        }
        
        // 4. Combine factors and apply to water interval
        const combinedFactor = tempFactor * humidityFactor * rainFactor;
        
        // Only apply if significant change is needed
        if (Math.abs(combinedFactor - 1.0) > 0.15) {
            // Adjust next watering date
            const lastWatered = new Date(plant.lastWatered);
            const originalInterval = plant.waterInterval * 24 * 60 * 60 * 1000; // in ms
            const adjustedInterval = originalInterval / combinedFactor;
            
            const newNextWater = new Date(lastWatered.getTime() + adjustedInterval);
            plant.nextWater = newNextWater.toISOString();
            
            // Don't change the base interval, just the next watering date
            // This keeps the adjustment temporary
        }
    });
    
    // Save adjusted garden
    saveGarden(garden);
    
    // Update UI
    renderGarden();
    renderCare();
}

// Update UI with weather data
function updateWeatherUI() {
    if (!weatherData) return;
    
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherAdvice = document.getElementById('weatherAdvice');
    const seasonTipsContent = document.getElementById('seasonTipsContent');
    
    if (weatherLocation) {
        weatherLocation.textContent = weatherData.location;
    }
    
    if (weatherIcon) {
        weatherIcon.innerHTML = `<i class="fas fa-${weatherData.current.icon}"></i>`;
    }
    
    if (weatherAdvice) {
        let adviceText = `Current conditions: ${weatherData.current.temp}°C, ${weatherData.current.humidity}% humidity, ${weatherData.current.conditions}.`;
        
        // Add weather-specific advice
        if (weatherData.current.conditions.toLowerCase().includes('rain')) {
            adviceText += " Skip watering your plants today as it's already raining.";
        } else if (weatherData.current.temp > 28) {
            adviceText += " Consider watering your plants more frequently due to hot weather.";
        } else if (weatherData.current.humidity < 30) {
            adviceText += " Low humidity may cause plants to dry out faster. Consider misting them.";
        }
        
        weatherAdvice.textContent = adviceText;
    }
    
    if (seasonTipsContent) {
        switch(currentSeason) {
            case 'spring':
                seasonTipsContent.textContent = "Spring is a time of growth. Consider repotting, fertilizing, and increasing watering as plants wake up.";
                break;
            case 'summer':
                seasonTipsContent.textContent = "Protect plants from intense sun and heat. Water more frequently and provide shade during peak hours.";
                break;
            case 'fall':
                seasonTipsContent.textContent = "Reduce watering and stop fertilizing as growth slows. Begin preparing plants for colder weather.";
                break;
            case 'winter':
                seasonTipsContent.textContent = "Minimize watering, avoid fertilizing, and keep plants away from cold drafts and heat sources.";
                break;
        }
    }
}

// Update UI elements that depend on location
function updateLocationBasedUI() {
    if (!userLocation) return;
    
    // This would be where you update any UI that depends on the user's location
    // For example, updating the location recommendations in the Explore tab
    
    // For demo purposes, we'll just ensure the weather section is displayed
    const weatherCare = document.getElementById('weatherCare');
    if (weatherCare) {
        weatherCare.classList.remove('hidden');
    }
}

// Setup event listeners for care-related functionality
function setupCareEventListeners() {
    // Care preferences save button
    const saveCarePrefsBtn = document.getElementById('saveCarePreferences');
    if (saveCarePrefsBtn) {
        saveCarePrefsBtn.addEventListener('click', () => {
            // Get values from UI
            const notificationFreq = document.getElementById('notificationFrequency').value;
            const adjustWeather = document.getElementById('adjustForWeather').checked;
            const seasonalAdjust = document.getElementById('seasonalAdjustments').checked;
            
            // Update preferences
            carePreferences = {
                notificationFrequency: notificationFreq,
                adjustForWeather: adjustWeather,
                seasonalAdjustments: seasonalAdjust
            };
            
            // Save preferences
            saveSetting('carePreferences', carePreferences);
            
            // Apply changes
            if (adjustWeather && userLocation) {
                updateCareForWeather();
            }
            
            showNotification("Care preferences saved!");
        });
    }
    
    // Refresh weather button
    const refreshWeatherBtn = document.getElementById('refreshWeather');
    if (refreshWeatherBtn) {
        refreshWeatherBtn.addEventListener('click', () => {
            getUserLocation();
            showNotification("Refreshing weather data...");
        });
    }
}

// Get seasonal care tips for a specific plant
function getSeasonalCareTips(plant) {
    if (!plant || !currentSeason) return {};
    
    // Default tips based on plant type (simplistic for demo)
    const isSunLoving = plant.sunlightHours >= 6;
    const isSucculent = plant.waterInterval >= 10; // Assuming succulents need less frequent watering
    
    const tips = {
        spring: {
            water: isSucculent ? "Gradually increase watering as new growth appears" : "Increase watering frequency as growth resumes",
            light: isSunLoving ? "Move to a brighter location as sun intensity increases" : "Maintain filtered light to protect new growth",
            fertilizer: "Begin fertilizing with half-strength fertilizer every 4-6 weeks",
            maintenance: "Good time for repotting and propagation"
        },
        summer: {
            water: isSucculent ? "Water thoroughly but only when soil is completely dry" : "Water more frequently, especially on hot days",
            light: isSunLoving ? "Provide bright light but protect from intense afternoon sun" : "Move away from hot windows to prevent leaf burn",
            fertilizer: "Continue regular fertilizing every 4 weeks",
            maintenance: "Monitor for pests more frequently as they thrive in warm weather"
        },
        fall: {
            water: isSucculent ? "Reduce watering significantly as dormancy approaches" : "Gradually reduce watering frequency",
            light: isSunLoving ? "Ensure maximum light exposure as days shorten" : "Maintain consistent light levels",
            fertilizer: "Stop fertilizing until spring",
            maintenance: "Clean leaves and prepare for reduced growth period"
        },
        winter: {
            water: isSucculent ? "Minimal watering, only when thoroughly dry" : "Water sparingly, allowing soil to dry more between waterings",
            light: isSunLoving ? "Move to brightest possible location" : "Maintain consistent indirect light",
            fertilizer: "No fertilizing needed during dormancy",
            maintenance: "Keep away from heaters and cold drafts"
        }
    };
    
    return tips[currentSeason] || {};
}

// Generate specialized care tips for a plant
async function generatePlantCareTips(plant) {
    if (!plant) return null;
    
    // Try getting from Gemini first
    try {
        const tips = await getPlantTipsFromGemini(plant.commonName, plant.scientificName);
        if (tips) {
            return tips;
        }
    } catch (error) {
        console.error("Could not get plant tips from Gemini:", error);
    }
    
    // Fallback to manual tips generation
    return {
        lighting: getLightingTipsForPlant(plant),
        watering: getWateringTipsForPlant(plant),
        soil: getSoilTipsForPlant(plant),
        commonIssues: getCommonIssuesForPlant(plant)
    };
}

// Helper functions for care tips
function getLightingTipsForPlant(plant) {
    const sunlightNeeded = plant.sunlightHours || 0;
    
    if (sunlightNeeded >= 8) {
        return "This plant thrives in bright, direct sunlight for most of the day. Place in a south-facing window or the brightest spot in your home.";
    } else if (sunlightNeeded >= 6) {
        return "This plant needs bright, indirect sunlight. East or west-facing windows are ideal, or slightly away from a south-facing window.";
    } else if (sunlightNeeded >= 4) {
        return "This plant prefers moderate light. Place in bright, indirect light but away from direct sun, which can burn the leaves.";
    } else {
        return "This plant does well in low to moderate light conditions. North-facing windows or areas away from windows are suitable.";
    }
}

function getWateringTipsForPlant(plant) {
    const waterInterval = plant.waterInterval || 7;
    
    if (waterInterval >= 14) {
        return "This drought-tolerant plant needs very little water. Allow soil to completely dry between waterings and err on the side of underwatering.";
    } else if (waterInterval >= 10) {
        return "This plant prefers to dry out between waterings. Check that the top 2 inches of soil are dry before watering again.";
    } else if (waterInterval >= 7) {
        return "Water when the top inch of soil feels dry to the touch. Avoid waterlogging and ensure good drainage.";
    } else {
        return "This plant likes consistently moist (but not soggy) soil. Water when the surface begins to feel dry, typically every few days.";
    }
}

function getSoilTipsForPlant(plant) {
    const waterInterval = plant.waterInterval || 7;
    
    if (waterInterval >= 14) {
        return "Use well-draining cactus or succulent mix. Add perlite or sand to improve drainage. Fertilize sparingly during growing season.";
    } else if (waterInterval >= 10) {
        return "Use a well-draining potting mix with some perlite. Fertilize every 2-3 months during growing season with balanced fertilizer.";
    } else if (waterInterval >= 7) {
        return "Standard potting mix with good organic content works well. Fertilize monthly during growing season with a balanced houseplant fertilizer.";
    } else {
        return "Use a rich, moisture-retentive potting mix with peat and compost. Fertilize regularly during growing season with a balanced fertilizer.";
    }
}

function getCommonIssuesForPlant(plant) {
    const sunlightNeeded = plant.sunlightHours || 0;
    const waterInterval = plant.waterInterval || 7;
    
    let issues = [];
    
    if (sunlightNeeded >= 6) {
        issues.push("Inadequate light can cause leggy growth and poor flowering.");
    } else {
        issues.push("Too much direct sun can cause leaf burn and color fading.");
    }
    
    if (waterInterval <= 5) {
        issues.push("Underwatering causes drooping, while overwatering leads to yellowing leaves and root rot.");
    } else {
        issues.push("Overwatering is the most common issue, leading to root rot and leaf yellowing.");
    }
    
    issues.push("Watch for common pests like spider mites, mealybugs, and scale insects.");
    
    return issues.join(" ");
}

// Get plant tips from Gemini API
async function getPlantTipsFromGemini(commonName, scientificName) {
    try {
        const plantName = scientificName || commonName;
        
        // Using the model to get specialized care tips
        const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
        
        const prompt = `
            Please provide detailed plant care tips for ${plantName}. Format your response as JSON with these fields:
            {
                "lighting": "Specific lighting needs and recommendations",
                "watering": "Detailed watering instructions including frequency and techniques",
                "soil": "Soil type, pH preferences, and fertilizer recommendations",
                "commonIssues": "Common problems, pests, diseases, and how to address them"
            }
            
            Return ONLY valid JSON without additional text, markdown formatting, or code blocks.
        `;
        
        // Format request data
        const requestData = {
            contents: [{ parts: [{ text: prompt }] }],
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        // Parse JSON from the response
        return JSON.parse(text);
        
    } catch (error) {
        console.error("Error getting plant tips from Gemini:", error);
        return null;
    }
}
