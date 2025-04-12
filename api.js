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

// Default plant image - more photo-realistic
const defaultPlantImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB4PSIwIiB5PSIwIiB2aWV3Qm94PSIwIDAgNjQgNjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiIGNsYXNzPSIiPjxnPjxwYXRoIGQ9Ik0yOS4zODYgMTIuMzA0Yy0uMTk5LS4yOTYtLjU5MS0uNDIxLS45MzQtLjMwMS0zLjMzOCAxLjE1OS04LjQ5MiAzLjg0LTEyLjkyOCA4LjQ0LTQuNjk1IDQuODcyLTcuNzI2IDEwLjk1Mi04Ljk5NSAxOC4wNTUtLjA3OS40MzcuMTMyLjg3Ny41MjIgMS4wODcuMTQ5LjA4LjMxMS4xMTkuNDczLjExOS4yNjIgMCAuNTIxLS4xMDMuNzE1LS4zMDEgNi4zNDYtNi40ODQgMTMuNzI1LTguMjA2IDE4LjUxOC04LjIwNi41MiAwIDEuMDE0LjAyMSAxLjQ3OC4wNTUuNDQzLjAzLjg1NC0uMjQ2Ljk4NC0uNjcyLjEzLS40MjYtLjA1MS0uODg2LS40MzUtMS4xMDktLjAyLS4wMTItMi4wNjQtMS4yMDctMi44Ni01LjUwMS0uNDM3LTIuMzY4LjExMi01Ljc1MiAzLjQ2Mi0xMC42NjZ6IiBmaWxsPSIjNmZiZTUxIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0iTTUzLjQzOSA0Mi4zYy42NjktLjI4MSAxLjMxNS0uNjEzIDEuOTEtMS4wNzUuMzc3LS4yOTIuNTA5LS44MDIuMzIxLTEuMjQzLS4xODgtLjQ0MS0uNjI5LS43MTktMS4xMDItLjY4NS0xLjA5NS4wNjUtMi4yMTYuMDk4LTMuMzMzLjA5OC04LjgzMSAwLTE1LjU4Ny0yLjI1LTE5LjQ1Ny03LjQ0OS0uMjgxLS4zNzgtLjc2NC0uNTIzLTEuMTkxLS4zNTctLjQyOC4xNjctLjcwOS41OTUtLjY5MSAxLjA1N2wuMTMzIDMuMjE4YzAgLjAxNi4wMDMuMDMxLjAwNC4wNDggMCAxMC4zMzggNi4yMTYgMTUuOTk4IDExLjMzOSAxOS4xNy42NjUuNDEyLjk2NS0uNzIxLjc4MS0xLjUwNmwtLjY1MS0yLjc2OS0uMDA3LS4wMzFjLS4wOTQtLjM5Ni0uMzYzLS43MTYtLjc0MS0uODczLS4zNzctLjE1Ny0uODA0LS4xMDctMS4xMzQuMTM5LTEuNTIzIDEuMTI5LTUuMTA0IDMuMTYzLTkuODI3IDMuNTIyQzM3LjA1MyA1OC42NiA0NC4zODkgNjQgNTIuNjE3IDY0aDQuOTE3QzU4LjYyNyA1OC41NzIgNTUuMjcgNTEuMTQgNTMuNDM5IDQyLjN6IiBmaWxsPSIjNGE5OTJzIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0iTTM0LjYxNCAyNC44MzNjLjM0My0xLjYwNCAxLjQ0LTUuOTg3IDQuOTA3LTEwLjQ0OS4yODEtLjM2My4yODMtLjg2NC4wMDUtMS4yMjktLjI3Ny0uMzY0LS43NTMtLjUxNS0xLjE4Ni0uMzc0LTQuNzU0IDEuNTQxLTguODQ5IDQuMjIxLTEyLjE2MiA3Ljk3NC0uMjk3LjMzNS0uMzEyLjgyOS0uMDM5IDEuMTc5LjI3My4zNS43NTIuNDY1IDEuMTUuMjc5IDEuNDYxLS42NzkgNC4xMTQtMS42NyA3LjMyNS0xLjM4eiIgZmlsbD0iIzc1ZTQ2ZSIgb3BhY2l0eT0iMSIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCI+PC9wYXRoPjxwYXRoIGQ9Ik00Ni45NzkgMTUuOTYzYy4yODItLjA0Ni41MjYtLjIyMi42NzUtLjQ4NS4xNDktLjI2My4xNzItLjU4LjA2NS0uODYzLS4xNzctLjQ2Ni0uMzQ2LS45MDYtLjU0My0xLjM0MS0yLjc2LTYuMDg2LTYuNDY1LTkuNDE5LTExLjAyOS05LjkyM2wtLjE2NS4wMDFjLTEuMTI0LS4xMDQtMi4xNTMuNjI2LTIuNDI0IDEuNzItLjI1MyAxLjAyNy4yMzIgMi4yMzUgMS4yMTIgMi45NDRsMS4wNDYuNzU4YzUuNjE0IDQuMDY4IDkuNzM3IDYuOTk2IDExLjE2MyA3Ljg5Ni4xNzYuMTExLjM3Ni4xNjcuNTc2LjE2Ny4xNjIgMCAuMzIzLS4wMzUuNDc0LS4xMDZ6IiBmaWxsPSIjNzVlNDZlIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0iTTUxLjc5NSAyNC45OTJjLS4yODctLjMyOS0uNzQ0LS40NjMtMS4xNTMtLjMzNi0uNDA5LjEyNy0uNzE3LjQ3LS43NzkuODg5LS4wNzcuNTIxLS40MzMgMS4xMzgtLjk0NyAxLjYzN2wtLjAwMy0uMDAzYy0uODI1LjgxOC0xLjkxMi44MTgtMi43MjIuMDAyLTQuOTA0LTQuOTI3LTkuMzE3LTcuMzIzLTEzLjgxNS03LjUxNC0uNDc3LS4wMjItLjkyMi4yNDQtMS4xMS42ODctLjE4OC40NDItLjEwOC45NTQuMiAxLjMxNyA2LjgwOSA4LjA1NiA5LjY2NyAxOC40MjYgOS42OTEgMTguNTAyLjA5Ny4zMDQuMzM5LjU0LjY0Ni42My4zMDcuMDkuNjM3LjAxMi44NzQtLjIwN2w0LjMzMy00LjAzMnYuMDA1YzEuNzI3LTEuNzEzIDQuMzktNi4zMzggNi4xNDItMTAuNDE5LjM2Ni0uODQ1LS4wNjQtLjk1My0uMzU3LTEuMTU4eiIgZmlsbD0iIzZmYmU1MSIgb3BhY2l0eT0iMSIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCI+PC9wYXRoPjxwYXRoIGQ9Ik0yNC45NTYgNDYuMDI0Yy0uMTM0LS40MzMtLjUzLS43NDEtLjk4My0uNzY0LS40NTItLjAyMi0uODcyLjI0Ni0xLjA0My42NjctLjA0LjA5OS0xLjAyNyAyLjQ2MS0zLjMwNyA0LjY3Ni0yLjI2NyAyLjIwNC00Ljk2OCAzLjMwOC03LjE4OCAzLjMwOGgtNC40NjhDNi43ODggNTYuNjUyIDYgNTguMjQxIDYgNjBoMTMuMzc1YzQuMTMxIDAgOC4wMDUtMS44ODMgMTAuNjEtNS4zNzJsLjAwNS4wMDRjLjk2Ni0xLjI4OCAxLjA0OC0zLjAzNy4yMDctNC40MTlsLS4wMDUtLjAwNWMtMS4wMDYtMS42NDgtMi4yNzMtMi41MzYtMy43NzQtMi42NDUtLjU4Ny0uMDQyLTEuNDYyLS41NzYtMS40NjItMS41Mzl6IiBmaWxsPSIjNGE5OTJzIiBvcGFjaXR5PSIxIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIj48L3BhdGg+PC9nPjwvc3ZnPg==';

// Get a custom plant image
async function getCustomPlantImage(plantName) {
    try {
        // Try to get a relevant image from Gemini (if available)
        const prompt = `Generate a simple, beautiful SVG icon for the plant "${plantName}" with mostly green colors. Return ONLY the SVG code with no markdown, explanation or other text.`;
        
        // Use the currentApiKey from the parent scope
        const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
        
        const requestData = {
            contents: [{ parts: [{ text: prompt }] }],
            generation_config: {
                temperature: 0.2,
                top_k: 32,
                top_p: 1,
                max_output_tokens: 2048,
            }
        };
        
        const response = await fetch(`${apiUrl}?key=${currentApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        const svgText = data.candidates[0].content.parts[0].text;
        
        // Extract just the SVG content (removing any code blocks or explanations)
        const svgMatch = svgText.match(/<svg[\s\S]*<\/svg>/i);
        if (svgMatch) {
            return 'data:image/svg+xml;base64,' + btoa(svgMatch[0]);
        }
        
        return null;
    } catch (error) {
        console.error("Error getting custom plant image:", error);
        return null;
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
            
            // If gemini-2.0-flash fails, try gemini-1.5-pro as fallback
            if (response.status === 404) {
                console.log("Trying fallback model gemini-1.5-pro...");
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
        // Use GBIF API to search for plants, prioritizing vernacular (common) names
        const response = await fetch(`https://api.gbif.org/v1/species/search?q=${encodeURIComponent(query)}&rank=SPECIES&kingdom=Plantae&limit=20`);
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
        
        // Try to get a custom plant image
        let imageUrl = null;
        
        // First try to find an image in the occurrences
        if (occurrenceData.results && occurrenceData.results.length > 0) {
            for (const result of occurrenceData.results) {
                if (result.media && result.media.length > 0) {
                    const mediaItem = result.media.find(m => m.type === 'StillImage');
                    if (mediaItem && mediaItem.identifier) {
                        // Verify the image URL is accessible
                        try {
                            const imgResponse = await fetch(mediaItem.identifier, { method: 'HEAD' });
                            if (imgResponse.ok) {
                                imageUrl = mediaItem.identifier;
                                break;
                            }
                        } catch (error) {
                            console.log("Image URL not accessible, trying next option");
                        }
                    }
                }
            }
        }
        
        // If no image was found, try to get a custom one from Gemini
        if (!imageUrl) {
            const plantName = data.vernacularNames && data.vernacularNames.length > 0 
                ? data.vernacularNames[0].vernacularName 
                : data.scientificName;
                
            const customImage = await getCustomPlantImage(plantName);
            if (customImage) {
                imageUrl = customImage;
            } else {
                // If all else fails, use the default plant image
                imageUrl = defaultPlantImage;
            }
        }
        
        // Generate plant info
        const waterDays = Math.floor(Math.random() * 10) + 2; // Random between 2-12 days
        const sunlightHours = Math.floor(Math.random() * 6) + 3; // Random between 3-8 hours
        
        return {
            id: data.key,
            scientificName: data.scientificName,
            commonName: data.vernacularNames && data.vernacularNames.length > 0 
                ? data.vernacularNames[0].vernacularName 
                : data.scientificName,
            info: `${data.scientificName} belongs to the ${data.family || 'plant'} family. ` +
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
