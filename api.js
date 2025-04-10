// Default API key - will be used as fallback
const DEFAULT_API_KEY = "AIzaSyCbGxHgvv7vFS4lBmvFDJG6z30ks3lTdik";
let currentApiKey = DEFAULT_API_KEY;

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
    const savedKey = await loadSetting('geminiApiKey', null);
    if (savedKey) {
        currentApiKey = savedKey;
    }
}

// Gemini API functions
async function identifyPlantWithGemini(imageBase64) {
    try {
        const imageData = imageBase64.split(',')[1]; // Remove data URL prefix
        
        // Using the most current Gemini model available for multimodal (image) inputs
        const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
        
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
            
            // If gemini-1.5-pro fails, try gemini-1.5-flash as fallback
            if (response.status === 404) {
                console.log("Trying fallback model gemini-1.5-flash...");
                return await identifyPlantWithFallbackModel(imageBase64);
            }
            
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Gemini API Response:", data);
        
        // Extract text from the response
        const text = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }
        
        // Parse JSON and return the plant data
        return JSON.parse(jsonMatch[0]);
        
    } catch (error) {
        console.error("Error in Gemini API:", error);
        throw error;
    }
}

// Fallback to gemini-1.5-flash if pro model fails
async function identifyPlantWithFallbackModel(imageBase64) {
    try {
        const imageData = imageBase64.split(',')[1];
        const fallbackApiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
        
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
            throw new Error(`Fallback API request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Fallback Gemini API Response:", data);
        
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("No valid JSON found in fallback response");
        }
        
        return JSON.parse(jsonMatch[0]);
        
    } catch (error) {
        console.error("Error in fallback Gemini API:", error);
        throw error;
    }
}

// GBIF API functions
async function searchPlantsByName(query) {
    try {
        // Use GBIF API to search for plants
        const response = await fetch(`https://api.gbif.org/v1/species/search?q=${encodeURIComponent(query)}&rank=SPECIES&kingdom=Plantae&limit=10`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results.map(result => ({
                key: result.key,
                scientificName: result.scientificName,
                commonName: result.vernacularNames && result.vernacularNames.length > 0 
                    ? result.vernacularNames[0].vernacularName 
                    : result.scientificName
            }));
        }
        return [];
    } catch (error) {
        console.error("Error searching GBIF:", error);
        throw error;
    }
}

async function getPlantDetails(speciesKey) {
    try {
        // Get species details from GBIF API
        const response = await fetch(`https://api.gbif.org/v1/species/${speciesKey}`);
        const data = await response.json();
        
        // Get occurrence data for images
        const occurrenceResponse = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${speciesKey}&limit=5&mediaType=StillImage`);
        const occurrenceData = await occurrenceResponse.json();
        
        let imageUrl = 'https://via.placeholder.com/400x300?text=No+Image+Available';
        
        // Try to find an image in the occurrences
        if (occurrenceData.results && occurrenceData.results.length > 0) {
            for (const result of occurrenceData.results) {
                if (result.media && result.media.length > 0) {
                    const mediaItem = result.media.find(m => m.type === 'StillImage');
                    if (mediaItem && mediaItem.identifier) {
                        imageUrl = mediaItem.identifier;
                        break;
                    }
                }
            }
        }
        
        // Generate plant info
        // In a real app, you would want to get this information from a database
        // For now, we'll use some placeholder text
        const waterDays = Math.floor(Math.random() * 10) + 2; // Random between 2-12 days
        const sunlightHours = Math.floor(Math.random() * 6) + 3; // Random between 3-8 hours
        
        return {
            id: data.key,
            scientificName: data.scientificName,
            commonName: data.vernacularNames && data.vernacularNames.length > 0 
                ? data.vernacularNames[0].vernacularName 
                : data.scientificName,
            info: `${data.scientificName} belongs to the ${data.family} family. ` +
                  `Native to various regions, it's known for its adaptability and beauty. ` +
                  `This plant prefers ${sunlightHours} hours of sunlight and should be watered every ${waterDays} days.`,
            image: imageUrl,
            waterDays: waterDays,
            sunlightHours: sunlightHours
        };
    } catch (error) {
        console.error("Error getting plant details:", error);
        throw error;
    }
}
