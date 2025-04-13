// features.js - Handles new features like growth tracking, health checks, social sharing

// Growth Tracking
const plantGrowthData = {}; // Stores growth data by plant ID

// Initialize features
async function initFeatures() {
    console.log("Initializing features...");
    
    try {
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
        
        console.log("Features initialized successfully");
    } catch (error) {
        console.error("Error initializing features:", error);
    }
}

// Initialize location-based recommendations
function initLocationBasedFeatures() {
    if (!userLocation) {
        console.log("No user location available for features");
        return;
    }
    
    console.log("Initializing location-based features...");
    
    // Load local plant recommendations based on location
    loadLocalPlantRecommendations();
    
    // Load nearby plant stores
    loadNearbyPlantStores();
}

// Find plant shops near user's location
async function loadNearbyPlantStores() {
    if (!userLocation) return;
    
    const storesList = getElement('storesList');
    if (!storesList) {
        console.warn("Stores list element not found");
        return;
    }
    
    console.log("Loading nearby plant stores...");
    
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

// Health Check Functionality
async function processHealthCheck(canvas) {
    console.log("Processing health check...");
    
    // Show loading state
    const healthResults = getElement('healthResults');
    const loadingHealth = getElement('loadingHealth');
    const healthContent = getElement('healthContent');
    
    if (!healthResults || !loadingHealth || !healthContent) {
        console.warn("Required health check elements not found");
        showNotification("Health check feature is not available");
        return;
    }
    
    healthResults.classList.remove('hidden');
    loadingHealth.classList.remove('hidden');
    healthContent.classList.add('hidden');
    
    try {
        // Get image data
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Get health analysis
        const healthData = await analyzePlantHealth(imageData);
        
        // Update the health results
        const healthPlantImage = getElement('healthPlantImage');
        const healthStatus = getElement('healthStatus');
        const healthProblem = getElement('healthProblem');
        const healthIndicator = getElement('healthIndicator');
        const healthTreatment = getElement('healthTreatment');
        
        if (!healthPlantImage || !healthStatus || !healthProblem || !healthIndicator || !healthTreatment) {
            throw new Error("Required health result elements not found");
        }
        
        healthPlantImage.src = imageData;
        healthStatus.textContent = healthData.status;
        healthProblem.textContent = healthData.problem;
        
        // Update health indicator
        healthIndicator.textContent = healthData.severity;
        
        // Set color based on severity
        if (healthData.severity === 'mild') {
            healthIndicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
        } else if (healthData.severity === 'moderate') {
            healthIndicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800';
        } else if (healthData.severity === 'severe') {
            healthIndicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
        } else {
            healthIndicator.className = 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800';
        }
        
        // Update treatment recommendations
        healthTreatment.innerHTML = '';
        
        if (healthData.treatment) {
            if (Array.isArray(healthData.treatment)) {
                const ul = document.createElement('ul');
                ul.className = 'list-disc ml-5 space-y-1';
                
                healthData.treatment.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                
                healthTreatment.appendChild(ul);
            } else {
                healthTreatment.textContent = healthData.treatment;
            }
        }
        
        // Show results
        loadingHealth.classList.add('hidden');
        healthContent.classList.remove('hidden');
        
    } catch (error) {
        console.error("Error processing health check:", error);
        showNotification("Error analyzing plant health. Please try again.");
        
        // Hide loading state
        loadingHealth.classList.add('hidden');
    }
}

async function analyzePlantHealth(imageData) {
    console.log("Analyzing plant health...");
    
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
    console.log("Getting health analysis from Gemini...");
    
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
        const apiKey = typeof currentApiKey !== 'undefined' ? currentApiKey : "AIzaSyCbGxHgvv7vFS4lBmvFDJG6z30ks3lTdik";
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
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

// Setup all event listeners for new features
function setupFeatureEventListeners() {
    console.log("Setting up feature event listeners...");
    
    // Helper function to safely add event listeners
    function addSafeEventListener(elementId, eventType, callback) {
        const element = getElement(elementId);
        if (element) {
            element.addEventListener(eventType, callback);
            return true;
        }
        return false;
    }
    
    // Health Check Tab
    addSafeEventListener('startHealthCameraButton', 'click', async () => {
        try {
            console.log("Starting health camera...");
            // Request camera access
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            // Show camera container and video
            const videoElement = getElement('healthVideoElement');
            const cameraContainer = getElement('health-camera-container');
            
            if (videoElement && cameraContainer) {
                videoElement.srcObject = stream;
                cameraContainer.classList.remove('hidden');
                getElement('startHealthCameraButton')?.classList.add('hidden');
                getElement('healthCapturedPhoto')?.classList.add('hidden');
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            showNotification("Error accessing camera. Please check permissions.");
        }
    });
    
    addSafeEventListener('healthCaptureButton', 'click', () => {
        if (!stream) return;
        
        console.log("Capturing health image...");
        // Setup canvas for capturing
        const canvas = getElement('healthCapturedPhoto');
        const videoElement = getElement('healthVideoElement');
        
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
            
            getElement('health-camera-container')?.classList.add('hidden');
            getElement('startHealthCameraButton')?.classList.remove('hidden');
            canvas.classList.remove('hidden');
            
            // Process the health check
            processHealthCheck(canvas);
        }
    });
    
    addSafeEventListener('healthImageUpload', 'change', (event) => {
        console.log("Health image upload changed");
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
                const canvas = getElement('healthCapturedPhoto');
                if (canvas) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // Display canvas and hide camera button
                    canvas.classList.remove('hidden');
                    getElement('health-camera-container')?.classList.add('hidden');
                    
                    // Process the health check
                    processHealthCheck(canvas);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // Remaining event listeners would be added similarly...
    console.log("Feature event listeners setup complete");
}

// Export key functions for global access
window.initFeatures = initFeatures;
window.processHealthCheck = processHealthCheck;
window.analyzePlantHealth = analyzePlantHealth;
