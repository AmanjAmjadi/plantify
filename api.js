// Default plant image as fallback
const defaultPlantImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB4PSIwIiB5PSIwIiB2aWV3Qm94PSIwIDAgNjQgNjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiIGNsYXNzPSIiPjxnPjxwYXRoIGQ9Ik0yOS4zODYgMTIuMzA0Yy0uMTk5LS4yOTYtLjU5MS0uNDIxLS45MzQtLjMwMS0zLjMzOCAxLjE1OS04LjQ5MiAzLjg0LTEyLjkyOCA4LjQ0LTQuNjk1IDQuODcyLTcuNzI2IDEwLjk1Mi04Ljk5NSAxOC4wNTUtLjA3OS40MzcuMTMyLjg3Ny41MjIgMS4wODcuMTQ5LjA4LjMxMS4xMTkuNDczLjExOS4yNjIgMCAuNTIxLS4xMDMuNzE1LS4zMDEgNi4zNDYtNi40ODQgMTMuNzI1LTguMjA2IDE4LjUxOC04LjIwNi41MiAwIDEuMDE0LjAyMSAxLjQ3OC4wNTUuNDQzLjAzLjg1NC0uMjQ2Ljk4NC0uNjcyLjEzLS40MjYtLjA1MS0uODg2LS40MzUtMS4xMDktLjAyLS4wMTItMi4wNjQtMS4yMDctMi44Ni01LjUwMS0uNDM3LTIuMzY4LjExMi01Ljc1MiAzLjQ2Mi0xMC42NjZ6IiBmaWxsPSIjNmZiZTUxIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0iTTUzLjQzOSA0Mi4zYy42NjktLjI4MSAxLjMxNS0uNjEzIDEuOTEtMS4wNzUuMzc3LS4yOTIuNTA5LS44MDIuMzIxLTEuMjQzLS4xODgtLjQ0MS0uNjI5LS43MTktMS4xMDItLjY4NS0xLjA5NS4wNjUtMi4yMTYuMDk4LTMuMzMzLjA5OC04LjgzMSAwLTE1LjU4Ny0yLjI1LTE5LjQ1Ny03LjQ0OS0uMjgxLS4zNzgtLjc2NC0uNTIzLTEuMTkxLS4zNTctLjQyOC4xNjctLjcwOS41OTUtLjY5MSAxLjA1N2wuMTMzIDMuMjE4YzAgLjAxNi4wMDMuMDMxLjAwNC4wNDggMCAxMC4zMzggNi4yMTYgMTUuOTk4IDExLjMzOSAxOS4xNy42NjUuNDEyLjk2NS0uNzIxLjc4MS0xLjUwNmwtLjY1MS0yLjc2OS0uMDA3LS4wMzFjLS4wOTQtLjM5Ni0uMzYzLS43MTYtLjc0MS0uODczLS4zNzctLjE1Ny0uODA0LS4xMDctMS4xMzQuMTM5LTEuNTIzIDEuMTI5LTUuMTA0IDMuMTYzLTkuODI3IDMuNTIyQzM3LjA1MyA1OC42NiA0NC4zODkgNjQgNTIuNjE3IDY0aDQuOTE3QzU4LjYyNyA1OC41NzIgNTUuMjcgNTEuMTQgNTMuNDM5IDQyLjN6IiBmaWxsPSIjNGE5OTJzIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0iTTM0LjYxNCAyNC44MzNjLjM0My0xLjYwNCAxLjQ0LTUuOTg3IDQuOTA3LTEwLjQ0OS4yODEtLjM2My4yODMtLjg2NC4wMDUtMS4yMjktLjI3Ny0uMzY0LS43NTMtLjUxNS0xLjE4Ni0uMzc0LTQuNzU0IDEuNTQxLTguODQ5IDQuMjIxLTEyLjE2MiA3Ljk3NC0uMjk3LjMzNS0uMzEyLjgyOS0uMDM5IDEuMTc5LjI3My4zNS43NTIuNDY1IDEuMTUuMjc5IDEuNDYxLS42NzkgNC4xMTQtMS42NyA3LjMyNS0xLjM4eiIgZmlsbD0iIzc1ZTQ2ZSIgb3BhY2l0eT0iMSIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCI+PC9wYXRoPjxwYXRoIGQ9Ik00Ni45NzkgMTUuOTYzYy4yODItLjA0Ni41MjYtLjIyMi42NzUtLjQ4NS4xNDktLjI2My4xNzItLjU4LjA2NS0uODYzLS4xNzctLjQ2Ni0uMzQ2LS45MDYtLjU0My0xLjM0MS0yLjc2LTYuMDg2LTYuNDY1LTkuNDE5LTExLjAyOS05LjkyM2wtLjE2NS4wMDFjLTEuMTI0LS4xMDQtMi4xNTMuNjI2LTIuNDI0IDEuNzItLjI1MyAxLjAyNy4yMzIgMi4yMzUgMS4yMTIgMi45NDRsMS4wNDYuNzU4YzUuNjE0IDQuMDY4IDkuNzM3IDYuOTk2IDExLjE2MyA3Ljg5Ni4xNzYuMTExLjM3Ni4xNjcuNTc2LjE2Ny4xNjIgMCAuMzIzLS4wMzUuNDc0LS4xMDZ6IiBmaWxsPSIjNzVlNDZlIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0iTTUxLjc5NSAyNC45OTJjLS4yODctLjMyOS0uNzQ0LS40NjMtMS4xNTMtLjMzNi0uNDA5LjEyNy0uNzE3LjQ3LS43NzkuODg5LS4wNzcuNTIxLS40MzMgMS4xMzgtLjk0NyAxLjYzN2wtLjAwMy0uMDAzYy0uODI1LjgxOC0xLjkxMi44MTgtMi43MjIuMDAyLTQuOTA0LTQuOTI3LTkuMzE3LTcuMzIzLTEzLjgxNS03LjUxNC0uNDc3LS4wMjItLjkyMi4yNDQtMS4xMS42ODctLjE4OC40NDItLjEwOC45NTQuMiAxLjMxNyA2LjgwOSA4LjA1NiA5LjY2NyAxOC40MjYgOS42OTEgMTguNTAyLjA5Ny4zMDQuMzM5LjU0LjY0Ni42My4zMDcuMDkuNjM3LjAxMi44NzQtLjIwN2w0LjMzMy00LjAzMnYuMDA1YzEuNzI3LTEuNzEzIDQuMzktNi4zMzggNi4xNDItMTAuNDE5LjM2Ni0uODQ1LS4wNjQtLjk1My0uMzU3LTEuMTU4eiIgZmlsbD0iIzZmYmU1MSIgb3BhY2l0eT0iMSIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCI+PC9wYXRoPjxwYXRoIGQ9Ik0yNC45NTYgNDYuMDI0Yy0uMTM0LS40MzMtLjUzLS43NDEtLjk4My0uNzY0LS40NTItLjAyMi0uODcyLjI0Ni0xLjA0My42NjctLjA0LjA5OS0xLjAyNyAyLjQ2MS0zLjMwNyA0LjY3Ni0yLjI2NyAyLjIwNC00Ljk2OCAzLjMwOC03LjE4OCAzLjMwOGgtNC40NjhDNi43ODggNTYuNjUyIDYgNTguMjQxIDYgNjBoMTMuMzc1YzQuMTMxIDAgOC4wMDUtMS44ODMgMTAuNjEtNS4zNzJsLjAwNS4wMDRjLjk2Ni0xLjI4OCAxLjA0OC0zLjAzNy4yMDctNC40MTlsLS4wMDUtLjAwNWMtMS4wMDYtMS42NDgtMi4yNzMtMi41MzYtMy43NzQtMi42NDUtLjU4Ny0uMDQyLTEuNDYyLS41NzYtMS40NjItMS41Mzl6IiBmaWxsPSIjNGE5OTJzIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PC9nPjwvc3ZnPg==';

// Default API key - will be used as fallback
const DEFAULT_API_KEY = "AIzaSyCbGxHgvv7vFS4lBmvFDJG6z30ks3lTdik";
let currentApiKey = DEFAULT_API_KEY;

// Google Search API configuration
const GOOGLE_API_KEY = 'AIzaSyD0da9inNI3ZDOXeE_lyoQMAF--zmDTviI';
const SEARCH_ENGINE_ID = '5327828c696fb4f99'; // Your Custom Search Engine ID

// Cache for plant images to reduce API calls
const plantImageCache = new Map();

// Function to set an active API key
async function setApiKey(key) {
    if (key && typeof key === 'string' && key.trim() !== "") {
        currentApiKey = key.trim();
        // Save the key to storage
        await saveSetting('geminiApiKey', currentApiKey);
        return true;
    }
    return false;
}



// Add this function to api.js file

/**
 * Diagnose plant disease using Gemini AI
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} - Diagnosis data
 */
async function diagnosePlantDisease(imageBase64) {
    try {
        const imageData = imageBase64.split(',')[1]; // Remove data URL prefix
        
        // Using the Gemini model for multimodal (image) inputs
        const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
        
        // The prompt for diagnosis
        const prompt = `
            Examine this plant image carefully and identify any diseases or disorders affecting it. 
            If you see signs of disease or nutrient deficiency, provide a detailed diagnosis.
            If the plant appears healthy, state that there are no signs of disease.
            
            Please provide the following details:
            
            1. Disease Name: Identify the specific disease, disorder, or state that "No disease detected" if plant appears healthy
            2. Affected Plant: If possible, identify what type of plant this is
            3. Severity: Rate as Mild, Moderate, or Severe
            4. Cause: What causes this disease or disorder (pathogen, environmental factor, pest, etc.)
            5. Treatment: Specific actions to treat the existing condition
            6. Prevention: Steps to prevent this issue in the future
            
            Return the information in JSON format with these exact keys:
            {
                "diseaseName": "...",
                "affectedPlant": "...",
                "severity": "...", 
                "cause": "...",
                "treatment": ["..." , "..." , "..."],
                "prevention": ["..." , "..." , "..."]
            }
            
            Be specific and practical in your recommendations. If you're unsure about the exact disease, provide the most likely diagnosis based on visible symptoms.
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
                                data: imageData
                            }
                        }
                    ]
                }
            ],
            generation_config: {
                temperature: 0.4,
                top_k: 32,
                top_p: 1,
                max_output_tokens: 4096,
            }
        };
        
        // Make request to Gemini API with API key as URL parameter
        const response = await fetch(`${apiUrl}?key=${currentApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Plant disease diagnosis API error:", errorText);
            
            // If gemini-2.0-flash fails, try gemini-1.5-pro as fallback
            if (response.status === 404) {
                console.log("Trying fallback model for disease diagnosis...");
                return await diagnosePlantDiseaseWithFallbackModel(imageBase64);
            }
            
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Gemini API Disease Diagnosis Response:", data);
        
        // Extract text from the response
        const text = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }
        
        // Parse JSON and return the diagnosis data
        try {
            const diagnosisData = JSON.parse(jsonMatch[0]);
            
            // Set default values for missing fields
            if (!diagnosisData.diseaseName) {
                diagnosisData.diseaseName = "Unknown Issue";
            }
            
            if (!diagnosisData.affectedPlant) {
                diagnosisData.affectedPlant = "Unknown Plant";
            }
            
            if (!diagnosisData.severity) {
                diagnosisData.severity = "Unknown";
            }
            
            if (!diagnosisData.cause) {
                diagnosisData.cause = "Could not determine the cause based on the image.";
            }
            
            if (!diagnosisData.treatment || !Array.isArray(diagnosisData.treatment)) {
                diagnosisData.treatment = ["Consult with a plant specialist for proper diagnosis and treatment."];
            }
            
            if (!diagnosisData.prevention || !Array.isArray(diagnosisData.prevention)) {
                diagnosisData.prevention = ["Maintain good plant hygiene and proper growing conditions."];
            }
            
            return diagnosisData;
        } catch (jsonError) {
            console.error("JSON parsing error for disease diagnosis:", jsonError, "Raw JSON:", jsonMatch[0]);
            throw new Error("Error parsing plant disease diagnosis data");
        }
        
    } catch (error) {
        console.error("Error diagnosing plant disease:", error);
        throw error;
    }
}

// Fallback model for plant disease diagnosis
async function diagnosePlantDiseaseWithFallbackModel(imageBase64) {
    try {
        const imageData = imageBase64.split(',')[1];
        const fallbackApiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
        
        // Same prompt as the main function
        const prompt = `
            Examine this plant image carefully and identify any diseases or disorders affecting it. 
            If you see signs of disease or nutrient deficiency, provide a detailed diagnosis.
            If the plant appears healthy, state that there are no signs of disease.
            
            Please provide the following details:
            
            1. Disease Name: Identify the specific disease, disorder, or state that "No disease detected" if plant appears healthy
            2. Affected Plant: If possible, identify what type of plant this is
            3. Severity: Rate as Mild, Moderate, or Severe
            4. Cause: What causes this disease or disorder (pathogen, environmental factor, pest, etc.)
            5. Treatment: Specific actions to treat the existing condition
            6. Prevention: Steps to prevent this issue in the future
            
            Return the information in JSON format with these exact keys:
            {
                "diseaseName": "...",
                "affectedPlant": "...",
                "severity": "...", 
                "cause": "...",
                "treatment": ["..." , "..." , "..."],
                "prevention": ["..." , "..." , "..."]
            }
            
            Be specific and practical in your recommendations. If you're unsure about the exact disease, provide the most likely diagnosis based on visible symptoms.
        `;
        
        const requestData = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageData
                            }
                        }
                    ]
                }
            ],
            generation_config: {
                temperature: 0.4,
                top_k: 32,
                top_p: 1,
                max_output_tokens: 4096,
            }
        };
        
        const response = await fetch(`${fallbackApiUrl}?key=${currentApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fallback model disease diagnosis error:", errorText);
            throw new Error(`Fallback model request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract text from the response
        const text = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in fallback response");
        }
        
        // Parse JSON and return the diagnosis data
        try {
            const diagnosisData = JSON.parse(jsonMatch[0]);
            
            // Set default values for missing fields (same as main function)
            if (!diagnosisData.diseaseName) {
                diagnosisData.diseaseName = "Unknown Issue";
            }
            
            if (!diagnosisData.affectedPlant) {
                diagnosisData.affectedPlant = "Unknown Plant";
            }
            
            if (!diagnosisData.severity) {
                diagnosisData.severity = "Unknown";
            }
            
            if (!diagnosisData.cause) {
                diagnosisData.cause = "Could not determine the cause based on the image.";
            }
            
            if (!diagnosisData.treatment || !Array.isArray(diagnosisData.treatment)) {
                diagnosisData.treatment = ["Consult with a plant specialist for proper diagnosis and treatment."];
            }
            
            if (!diagnosisData.prevention || !Array.isArray(diagnosisData.prevention)) {
                diagnosisData.prevention = ["Maintain good plant hygiene and proper growing conditions."];
            }
            
            return diagnosisData;
        } catch (jsonError) {
            console.error("Fallback JSON parsing error:", jsonError);
            throw new Error("Error parsing plant disease data from fallback model");
        }
        
    } catch (error) {
        console.error("Error in fallback disease diagnosis:", error);
        throw error;
    }
}



// Function to reset to default API key
async function resetApiKey() {
    currentApiKey = DEFAULT_API_KEY;
    await saveSetting('geminiApiKey', null);
    return true;
}

// Function to get current API key
function getApiKey() {
    return currentApiKey;
}

// Initialize API key from storage
async function initApiKey() {
    try {
        const savedKey = await loadSetting('geminiApiKey', null);
        if (savedKey) {
            currentApiKey = savedKey;
        }
    } catch (error) {
        console.error("Error initializing API key:", error);
        // Fall back to default key
        currentApiKey = DEFAULT_API_KEY;
    }
}

/**
 * Get a plant image from Google Search API
 * @param {string} plantName - The name of the plant to search for
 * @returns {Promise<string>} - A URL to an image of the plant
 */
// Replace the getPlantImageFromGoogle function with this improved version

/**
 * Get a plant image from Google Search API with improved error handling
 * @param {string} plantName - The name of the plant to search for
 * @returns {Promise<string>} - A URL to an image of the plant
 */
async function getPlantImageFromGoogle(plantName) {
    try {
        // Check cache first
        if (plantImageCache.has(plantName)) {
            return plantImageCache.get(plantName);
        }

        // Create search query - improve search terms for better results
        // Add "plant photo" to improve results and filter out non-plant images
        const query = `${plantName} plant photo`;
        
        // Build API URL with safety parameters
        const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&imgSize=medium&num=10&safe=active`;
        
        console.log(`Searching for images of: ${query}`);
        
        // Make the request
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Google Search API error:", errorText);
            throw new Error(`Google Search API failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Google Image Search response received");
        
        // Check if we got results
        if (!data.items || data.items.length === 0) {
            console.warn(`No images found for plant: ${plantName}`);
            return defaultPlantImage;
        }
        
        // IMPROVEMENT: Instead of trying to verify images with HEAD requests (which can fail due to CORS),
        // just use the thumbnails directly from Google, which are more reliable
        
        // First try to use thumbnails which are more reliable and avoid CORS issues
        for (const item of data.items) {
            if (item.image && item.image.thumbnailLink) {
                // We'll use the actual link but keep the thumbnail as backup
                const imageUrl = item.link;
                
                // Cache both URLs
                plantImageCache.set(plantName, imageUrl);
                console.log(`Using image for ${plantName}: ${imageUrl}`);
                return imageUrl;
            }
        }
        
        // If no thumbnails, just use the first image link without verification
        if (data.items[0].link) {
            plantImageCache.set(plantName, data.items[0].link);
            return data.items[0].link;
        }
        
        // If all attempts fail, use the default image
        console.warn(`Could not find suitable image for ${plantName}, using default`);
        return defaultPlantImage;
        
    } catch (error) {
        console.error("Error getting plant image from Google:", error);
        return defaultPlantImage;
    }
}

// Gemini API functions
async function identifyPlantWithGemini(imageBase64) {
    try {
        const imageData = imageBase64.split(',')[1]; // Remove data URL prefix
        
        // Using the latest Gemini model available for multimodal (image) inputs
        const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
        
        // The prompt for identification
        const prompt = `
            Identify this plant from the image and provide the following details:
            1. Common name
            2. Scientific name (genus and species)
            3. Description (include appearance, characteristics, and origin)
            4. Care instructions: how often to water (in days) and how many hours of sunlight per day
            
            Return the information in JSON format with these exact keys:
            {
                "commonName": "...",
                "scientificName": "...",
                "description": "...",
                "waterDays": number,
                "sunlightHours": number
            }
            
            Be concise but comprehensive. If you cannot identify the plant with certainty, make your best guess and indicate this in the description.
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
                                data: imageData
                            }
                        }
                    ]
                }
            ],
            generation_config: {
                temperature: 0.4,
                top_k: 32,
                top_p: 1,
                max_output_tokens: 4096,
            }
        };
        
        // Make request to Gemini API with API key as URL parameter
        const response = await fetch(`${apiUrl}?key=${currentApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Full API error response:", errorText);
            
            // Handle specific error codes
            if (response.status === 400) {
                if (errorText.includes("API key")) {
                    throw new Error("Invalid API key. Please check your Gemini API key in the Account tab.");
                } else if (errorText.includes("quota")) {
                    throw new Error("API quota exceeded. Try again later or use your own API key.");
                }
            } else if (response.status === 403) {
                throw new Error("API access denied. Your API key may not have permission for this model.");
            } else if (response.status === 429) {
                throw new Error("Too many requests. Please try again later.");
            } else if (response.status >= 500) {
                throw new Error("Gemini API service unavailable. Please try again later.");
            }
            
            // If gemini-2.0-flash fails, try gemini-1.5-pro as fallback
            if (response.status === 404) {
                console.log("Trying fallback model gemini-1.5-pro...");
                return await identifyPlantWithFallbackModel(imageBase64);
            }
            
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Gemini API Response:", data);
        
        // Check data structure for errors
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error("Invalid or empty response from Gemini API");
        }
        
        // Extract text from the response
        const text = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }
        
        // Parse JSON and return the plant data
        try {
            const plantData = JSON.parse(jsonMatch[0]);
            
            // Validate the required fields
            if (!plantData.commonName || !plantData.scientificName || !plantData.description || 
                typeof plantData.waterDays !== 'number' || typeof plantData.sunlightHours !== 'number') {
                
                // If validation fails, try to fix the data
                if (!plantData.waterDays || isNaN(plantData.waterDays)) {
                    plantData.waterDays = 7; // Default to weekly watering
                }
                
                if (!plantData.sunlightHours || isNaN(plantData.sunlightHours)) {
                    plantData.sunlightHours = 6; // Default to 6 hours
                }
                
                // If still missing critical data, throw error
                if (!plantData.commonName || !plantData.scientificName || !plantData.description) {
                    throw new Error("Missing required plant data fields");
                }
            }
            
            return plantData;
        } catch (jsonError) {
            console.error("JSON parsing error:", jsonError, "Raw JSON:", jsonMatch[0]);
            throw new Error("Error parsing plant data JSON");
        }
        
    } catch (error) {
        // Check for network errors
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw new Error("Network error. Please check your internet connection.");
        }
        console.error("Error in Gemini API:", error);
        throw error;
    }
}

// Fallback to gemini-1.5-pro if flash model fails
async function identifyPlantWithFallbackModel(imageBase64) {
    try {
        const imageData = imageBase64.split(',')[1];
        const fallbackApiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
        
        const prompt = `
            Identify this plant from the image and provide the following details:
            1. Common name
            2. Scientific name (genus and species)
            3. Description (include appearance, characteristics, and origin)
            4. Care instructions: how often to water (in days) and how many hours of sunlight per day
            
            Return the information in JSON format with these exact keys:
            {
                "commonName": "...",
                "scientificName": "...",
                "description": "...",
                "waterDays": number,
                "sunlightHours": number
            }
            
            Be concise but comprehensive. If you cannot identify the plant with certainty, make your best guess and indicate this in the description.
        `;
        
        const requestData = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageData
                            }
                        }
                    ]
                }
            ],
            generation_config: {
                temperature: 0.4,
                top_k: 32,
                top_p: 1,
                max_output_tokens: 4096,
            }
        };
        
        const response = await fetch(`${fallbackApiUrl}?key=${currentApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fallback API error response:", errorText);
            
            // Handle specific error types
            if (response.status === 400) {
                if (errorText.includes("API key")) {
                    throw new Error("Invalid API key. Please check your Gemini API key in the Account tab.");
                } else if (errorText.includes("quota")) {
                    throw new Error("API quota exceeded. Try again later or use your own API key.");
                }
            }
            
            throw new Error(`Fallback API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fallback Gemini API Response:", data);
        
        // Check data structure for errors
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error("Invalid or empty response from fallback Gemini API");
        }
        
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("No valid JSON found in fallback response");
        }
        
        // Parse and validate JSON
        try {
            const plantData = JSON.parse(jsonMatch[0]);
            
            // Validate the required fields and provide defaults if needed
            if (!plantData.waterDays || isNaN(plantData.waterDays)) {
                plantData.waterDays = 7; // Default to weekly watering
            }
            
            if (!plantData.sunlightHours || isNaN(plantData.sunlightHours)) {
                plantData.sunlightHours = 6; // Default to 6 hours
            }
            
            return plantData;
        } catch (jsonError) {
            console.error("Fallback JSON parsing error:", jsonError);
            throw new Error("Error parsing plant data from fallback model");
        }
        
    } catch (error) {
        console.error("Error in fallback Gemini API:", error);
        throw error;
    }
}

// GBIF API functions
async function searchPlantsByName(query) {
    try {
        // Use GBIF API to search for plants, prioritizing vernacular (common) names
        const response = await fetch(`https://api.gbif.org/v1/species/search?q=${encodeURIComponent(query)}&rank=SPECIES&kingdom=Plantae&limit=20`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("GBIF search error:", errorText);
            throw new Error(`GBIF API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Filter results that have common names first
            const resultsWithCommonNames = data.results
                .filter(result => result.vernacularNames && result.vernacularNames.length > 0)
                .map(result => ({
                    key: result.key,
                    scientificName: result.scientificName,
                    commonName: result.vernacularNames[0].vernacularName
                }));
            
            // Add results without common names at the end
            const resultsWithoutCommonNames = data.results
                .filter(result => !result.vernacularNames || result.vernacularNames.length === 0)
                .map(result => ({
                    key: result.key,
                    scientificName: result.scientificName,
                    commonName: result.scientificName
                }));
            
            return [...resultsWithCommonNames, ...resultsWithoutCommonNames].slice(0, 10);
        }
        return [];
    } catch (error) {
        // Check for network errors
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw new Error("Network error when searching plants. Please check your internet connection.");
        }
        console.error("Error searching GBIF:", error);
        throw new Error("Failed to search for plants: " + (error.message || "Unknown error"));
    }
}

async function getPlantDetails(speciesKey) {
    try {
        // Get species details from GBIF API
        const response = await fetch(`https://api.gbif.org/v1/species/${speciesKey}`);
        
        if (!response.ok) {
            throw new Error(`GBIF API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Get plant name for image search
        const plantName = data.vernacularNames && data.vernacularNames.length > 0 
            ? data.vernacularNames[0].vernacularName 
            : data.scientificName;
        
        // Get image URL using Google Search
        let imageUrl = await getPlantImageFromGoogle(plantName);
        
        // If Google search fails, use default
        if (!imageUrl) {
            imageUrl = defaultPlantImage;
        }
        
        // Generate plant info with more realistic care data
        // Use family information when available
        const family = data.family || 'plant';
        
        // Generate more realistic watering frequency based on plant type
        let waterDays, sunlightHours;
        
        // Set watering frequency based on plant family (simplified)
        if (family.toLowerCase().includes('cactaceae') || family.toLowerCase().includes('succulent')) {
            // Cacti and succulents need less frequent watering
            waterDays = Math.floor(Math.random() * 7) + 14; // 14-21 days
            sunlightHours = Math.floor(Math.random() * 3) + 6; // 6-8 hours
        } else if (family.toLowerCase().includes('fern')) {
            // Ferns need more frequent watering
            waterDays = Math.floor(Math.random() * 3) + 3; // 3-5 days
            sunlightHours = Math.floor(Math.random() * 2) + 2; // 2-3 hours (indirect)
        } else {
            // Default for other plants
            waterDays = Math.floor(Math.random() * 4) + 4; // 4-7 days
            sunlightHours = Math.floor(Math.random() * 3) + 4; // 4-6 hours
        }
        
        return {
            id: data.key,
            scientificName: data.scientificName,
            commonName: data.vernacularNames && data.vernacularNames.length > 0 
                ? data.vernacularNames[0].vernacularName 
                : data.scientificName,
            info: `${data.scientificName} belongs to the ${family} family. ` +
                  `Native to various regions, it's known for its adaptability and beauty. ` +
                  `This plant prefers ${sunlightHours} hours of sunlight and should be watered every ${waterDays} days.`,
            image: imageUrl,
            waterDays: waterDays,
            sunlightHours: sunlightHours
        };
    } catch (error) {
        // Check for network errors
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw new Error("Network error when getting plant details. Please check your internet connection.");
        }
        console.error("Error getting plant details:", error);
        throw new Error("Failed to load plant details: " + (error.message || "Unknown error"));
    }
}
