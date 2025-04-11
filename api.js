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

// Default plant images based on plant types
const defaultPlantImages = {
    tree: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjNEE5MTA1Ij48cGF0aCBkPSJNMjU2IDY0QzIzMi4zIDY0IDIxMy4xIDg2IDIwOCAxMTMuNkMxOTguOCAxMDUuMyAxODcuOCAxMDAgMTc2IDEwMEMxNDkuNSAxMDAgMTI4IDEyMS41IDEyOCAxNDhDMTI4IDE1Mi4xIDEyOC40IDE1Ni4xIDEyOS40IDE2MEMxMTYuNiAxNjggMTA4IDE4MS44IDEwOCAxOTguMUMxMDggMjIzLjEgMTI4IDI0NCAxNTIuOSAyNDQuOEMyNTMuOSAyNDcuMSAyNzQuNSAyOTcuNCAxODEuNiAyOTYuOUMxMzIuNCAyOTYuNSA5NiAyNTkuOSA5NiAyMTAuNkM5NiAxNjEuOCA1My45IDExNCAyIDExNFY4QzMwLjAgOCA1NiAxOC4zIDc2LjEgMzYuNEM4OC43IDE3LjYgMTA2LjEgNCAxMjguMSA0QzE0Mi42IDQgMTU2IDkuNyAxNjcgMTkuNUMxODQgOCAxOTguOSAwIDIxNS4xIDBDMjY4LjEgMCAzMTIgNTUuNyAzMTIgMTEwLjNDMzEyIDEyNS4yIDMwOC43IDEzOSAzMDIuOCAxNTEuNkMzMjkuNSAxNTYuMiAzNTIgMTc5LjEgMzUyIDIwNy42QzM1MiAyMzkuMSAzMjUuNyAyNjQuMiAyOTIuNCAgMjY0LjJDMjQwLjQgMjY0LjIgMjE1LjQgMzIwLjQgMzA3LjYgMzI0LjhDMzQ2LjUgMzI2LjggMzgzLjggMzEwLjUgNDA2LjIgMjgxLjdDNDE0LjcgMjcwLjYgNDIwLjEgMjU3LjIdMjI0IDI0MlYzMjguNEgyNDRWNDE2SDI2OFY1MTJIMTI0VjQxNkgxNDhWMzI4LjRIMTY4VjI0MkMxNjYuMSAyNDYuNCAxNDMuMiAyNDQgMTQxLjMgMjQ0LjhDMTE2LjQgMjQ0IDk2IDIyMy4xIDk2IDE5OC4xQzk2IDE4MS44IDEwNC42IDE2OCAxMTcuNSAxNjBDMTE2LjQgMTU2LjEgMTE2IDE1Mi4xIDExNiAxNDhDMTE2IDEyMS41IDEzNy41IDEwMCAxNjQgMTAwQzE3NS44IDEwMCAxODYuOCAxMDUuMyAxOTYgMTEzLjZDMjAxLjEgODYgMjIwLjMgNjQgMjQ0IDY0SDI1NloiLz48L3N2Zz4=',
    flower: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjRUQ2Q2EwIj48cGF0aCBkPSJNMjU2IDUxMkMyNTYgNTEyIDM1MiA0NjQgMzUyIDM2OEM0ODAgMzY4IDM5MS41IDI4OCAzOTEuNSAyODhDMzkxLjUgMjg4IDQxNiAyMjQgMzUyIDE3NkM0MDAgMTI4IDM1MiA5NiAzNTIgOTZDNDAwIDY0IDM2OC0zLjggMzA0IDMuMTE3QzMwNCAtODEgMjI0IDgwIDIyNCA4MEMyNzYgLTMyIDE3NS44IDUuMTE3IDE2MCAxMTJDMTI4IDQ4IDAgMTYwIDAgMTkyQzAgMTc2IDMyIDI4OCAxMTIgMjcyQzExMiAzNTIgMTkyIDM1MiAxOTIgMzUyQzEyOCAzNzAgMTYwIDQ2NCAxNjAgNDY0QzE2MCA0NjQgMjY0IDUxMiAyNTYgNTEyek0yNTYgMTI4QzMxNC40IDEyOCAzNjIuNSAxNzYgMzYyLjUgMjI0QzM2Mi41IDI3MiAzMTQuNCAgMzIwIDI1NiAzMjBDMTk3LjYgMzIwIDE0OS41IDI3MiAxNDkuNSAyMjRDMTQ5LjUgMTc2IDE5Ny42IDEyOCAyNTYgMTI4eiIvPjwvc3ZnPg==',
    succulent: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjMjlBQTVFIj48cGF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjQgMzk3LjQgNTEyIDI1NiA1MTJDMTE0LjYgNTEyIDAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxMTQuNiAwIDI1NiAwQzM5Ny40IDAgNTEyIDExNC42IDUxMiAyNTZaTTI1NiAxMjhDMjI2LjgKMTI4IDIwMy4xIDE1MiAxOTcuNiAxODAuMkMxODUuMSAxNzUuNSAxNzQuMSAxNzIgMTYyLjUgMTcyQzEyMCAxNzIgODUuNDkgMjA2LjUgODUuNDkgMjQ5QzEyNC44IDIyNiAxNTggMjg4IDIxNiAyODhDMjI1IDI4OCAyMzQuNCAyODYuMyAyNDQgMjgzLjRWMzMyLjdDMjQ0IDM3Mi4yIDI3NS44IDQwNCAzMTUuMyA0MDRDMTM4LjMgNDA0IDEzMCAyMjAgMjc2IDIyMEMzMjEuMSAyMjAgMzYwIDI1OSAzNjAKMzA0QzM2MCAzNDEgMzMwIDM3MC4xIDI5Ny40IDM3NS41QzI5MS45IDM1Mi4yIDI3NSAzNDQgMjU2IDM0NEMyNDIuNyAzNDQgMjMyIDM1NC43IDIzMiAzNjhDMjMyIDM4MS4zIDI0Mi43IDM5MiAyNTYgMzkyQzI2Ny4xIDM5MiAyNzYuMyAzODQuNSAyNzguOCAzNzQuNEMzNDcuMiAzNjEuOSA0MDggMzA5LjkgNDA4IDI0OEM0MDggMTgxLjMgMzU0LjcgMTI4IDI4OC0xMjggMjc4LjUgMTI4IDI2Ny41IDEyOCAyNTYgMTI4eiIvPjwvc3ZnPg==',
    herb: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjM0ZCRjU2Ij48cGF0aCBkPSJNMjQwIDBDMTY2LjEgMCA5My4wNyA0OC43MSA1MC4zMyA5MS42NEMzNC41MiAxMDcuNiAzNC41MiAxMzMuNCAxMC4zMyAxNDkuM0MtMC44MDQgMTYwLjQtMC44MDQgMTc4LjYgMTAuMzMgMTg5LjdDMjEuNDcgMjAwLjggMzkuMiAyMDAuOCA1MC4zMyAxODkuN0MxMTIuMiAxMjggMTg2LjggMTI4IDI0OCAxMjhDMjQ4IDk0LjggMjQ4IDYxLjYgMjQ4IDI4LjRDMjQ4IDEyLjggMjU1LjYgMCAyNzIgMEMyODggMCAyOTYgMTIuOCAyOTYgMjguNEMyOTYgNjEuNiAyOTYgOTQuOCAyOTYgMTI4QzM1Ny4yIDEyOCA0MzEuOCAxMjggNDkzLjcgMTg5LjdDNTA0LjggMjAwLjggNTIyLjUgMjAwLjggNTMzLjcgMTg5LjdDNTQ0LjggMTc4LjYgNTQ0LjggMTYwLjQgNTMzLjcgMTQ5LjNDNTA5LjUgMTMzLjQgNTA5LjUgMTA3LjYgNDkzLjcgOTEuNjRDNDUwLjkgNDguNzEgMzc3ICA1MTIgMzA0IDUxMkMyMzAgNTEyIDE1NyA1MTIgODMgNDYwLjVDNzYuNjcgNDU3LjUgNzEuMjkgNDUzIDY1LjMzIDQ0Ny41QzY1LjMzIDQ1Mi40IDY2LjY3IDQ1OC43IDcwLjY3IDQ2Ni40QzczLjExIDQ3MS4yIDc2LjcxIDQ3Ni4yIDgxLjYyIDQ4MS4xQzg1LjIgNDg0LjcgODkuMzkgNDg3LjggOTMuNzUgNDkwLjRDMTA0LjQgNDk2LjUgMTE2LjcgNDk2LjcgMTI3IDQ5MC4yQzEzNy4zIDQ4My44IDE0My4xIDQ3MS4zIDE0My4xIDQ1OEMxNDMuMSA0MzMuOCAxNDQgNDA5LjkgMTQ0LjkgMzg2LjFDMTQ1LjUgMzczLjQgMTQ2LjIgMzYwLjYgMTQ2LjkgMzQ3LjlDMTQ4LjMgMzI0LjEgMTQ5LjcgMzAwLjQgMTUxLjggMjc2LjhWMjc2LjdDMTUyLjkgMjY0LjMgMTU0LjEgMjUyLjEgMTU1LjQgMjM5LjlDMTU3LjIgMjIxLjUgMTQ0LjMgMjA0LjggMTI1LjkgMjAzQzEwNy41IDIwMS4yIDkwLjc5IDIxNC4xIDg4Ljk4IDIzMi41QzQ4LjQ0IDIzMy41IDExLjg2IDIzNC42LTI0LjQzIDIzNS4xQy0zLjM1IDI1My43IDI0LjQ1IDI2MC44IDUwLjMyIDI2Ni4yQzYwLjUgMjY4LjQgNzAuMSAyNzAuNSA3Ny4zMyAyNzIuN0M3Ny40OSAyNzIuOCA3Ny42MyAyNzIuOCA3Ny43OCAyNzIuOUM5Mi44OCAyNzguMiAxNzYgMjk1LjcgMTc2IDM4NEMyMDEuMSAzODQgMjE5LjUgMzgzLjggMjQwIDM4My42QzI2MC4xIDM4My40IDI4My42IDM4My4yIDMxOS41IDM4NEMzMzUuOSAzNDAuMiAzNTguNyAzMDguOSAzNzYuMyAyODMuOEMzOTAuMSAyNjMuOCA0MDAuOSAyNDggNDA4IDIzMkMzODEuMiAyMTcuMyAzNzMuMyAyMDcuOCAzNjUuNSAxOTguM0MzNTkuNSAxOTEgMzUzLjUgMTgzLjcgMzM1LjcgMTczLjNDMzIzLjcgMTY2IDMwNy45IDE3Mi44IDMwMC43IDE4NC44QzI5My41IDE5Ni44IDMwMC4zIDIxMi42IDMxMi4zIDIxOS44QzMxOC4xIDIyMy42IDMxOS44IDIyNS41IDMyMi4yIDIyOC42QzMyNC40IDIzMS41IDMyNy4zIDIzNS41IDMzNS4yIDI0MEMzMTkuMiAyNjAuNiAzMTEuOSAyODcuNSAzMDQgMzEzLjJDMjk2LjYgMzM3LjIgMjg4LjcgMzYyLjcgMjcyIDM4NEMyMjIuMSAzNzkuOCAxOTEuNCAzNzQuOCAxNzYgMzY4QzE3Ni4xIDM3OS45IDE3NS4xIDM5MS4zIDE3My4xIDQwMS44QzE3MC4yIDQxNy41IDE2NS4yIDQzMCAxNTcuNCA0MzkuNEMxNDYuOSA0NTIuMyAxMzAuOSA0NTUuOSAxMTIgNDU1LjlDMTYzLjMgNDgyLjIgMjAxLjggNDk2LjEgMjIzLjggNTA0QzIzNC4zIDUwNy45IDI0MS4zIDUxMCAyNDAgNTEwLjFDMjQwLjcgNTEwLjEgMjQ2LjMgNTA4LjQgMjU2IDUwNS4zQzI3Mi4yIDUwMC41IDI5Ni43IDQ4OS45IDMyMC4xIDQ3My43QzM0My4zIDQ1Ny43IDM2Ni4zIDQzNS42IDM4Mi40IDQwNy41QzM5OC41IDM3OS41IDQwOCAzNDQuOSA0MDggMzA0QzM4NCAzMDQgMzYwIDMwNCAzMzYgMzA0QzMzNiAyNTYuMyAzMjAgMjA4IDI3MiAxNzZDMjcyIDE3NiAyMjQgMTkzLjIgMjI0IDI0MEMxNTUgMjY0IDEyMSAyMDggMTIxIDIwOEMxMjAgMjA4IDEyMC43IDIzOS45IDEyMCAyNDBDMTIwIDI0NSAyMDggMzA0IDIwOCAzMDRDMTY2LjEgMzA0IDIwOCA0MDggMjQwIDQ4MEMxNjggNDA4IDE1MiAzNTIgMTUyIDMwNEMxMzEuMiAzMDQgMTEyIDI3Mi44IDExMiAyNDBILTExMkMtNDggMzUyIDY0IDQ4MCAxOTIgNDgwQzMyMCA0ODAgNDMyIDM1MiA0OTYgMjQwSDI3MkMyNzIgMjcyLjggMjUyLjggMzA0IDIzMiAzMDRDMjMyIDM1MiAyMTYgNDA4IDE0NCA0ODBDMTc1LjEgNDA4IDIxNiAzMDQgMTc0LjEgMzA0QzE3NC4xIDMwNCAyNjQgMjQ4IDI2NCAyNDBDMjY0IDIzOS45IDI2MyAyMDggMjYzIDIwOEMyNjMgMjA4IDIyOSAyNjQgMTYwLjkgMjQwQzE2MC45IDE5My4yIDE0NiAxNzYgMTQ2IDE3NkM5NiAyMDggODAuMDQgMjU2LjMgODAuMDQgMzA0QzU2LjA0IDMwNCAzMi4wMiAzMDQgOC4wMiAzMDRDOC4wMjMgMzQ0LjkgMTcuNTIgMzc5LjUgMzMuNTUgNDA3LjVDNDkuNTkgNDM1LjYgNzEuOTkgNDU3LjcgOTEuOTYgNDczLjdDMTE5LjYgNDg5LjkgMTQzLjggNTAwLjUgMTYwIDUwNS4zQzE2OS43IDUwOC40IDE3NS4zIDUxMC4xIDE3NiA1MTAuMUMxNzQuOCA1MTAgMTgxLjcgNTA3LjkgMTkyLjIgNTA0QzIxNC4yIDQ5Ni4xIDI2Mi43IDQ4Mi4yIDMwNCA0NTUuOUMyODUuMSA0NTUuOSAyNjkuMSA0NTIuMyAyNTguNiA0MzkuNEMyNTAuOCA0MzAgMjQ1LjggNDE3LjUgMjQyLjkgNDAxLjhDMjQxIDM5MS4zIDI0MCAzNzkuOSAyNDAgMzY4QzIyNC42IDM3NC44IDE5My45IDM3OS44IDE0NCAzODRDMTI3LjMgMzYyLjcgMTE5LjQgMzM3LjIgMTEyIDMxMy4yQzEwNC4xIDI4Ny41IDk2LjgxIDI2MC42IDgwLjgxIDI0MEMxNzYgMTI4IDIzNyAxNzYgMjQwIDBMMjQwIDB6Ii8+PC9zdmc+',
    fern: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjMDA4MDAwIj48cGF0aCBkPSJNMjg4IDMyQzI4OCAzMiAyODIgNDMuMTMgMjU2IDQzLjEzQzIzMCA0My4xMyAyMjQgMzIgMjI0IDMyQzIyNCAzMiAxNTAgNTEuMjUgMTUwIDExMkMxNTAgMTQ0IDE4Mi45IDE3NC40IDIxMC43IDE5MEMxODYuMSAxOTcuMSAxNjguMzIgMjI0IDE2OC4zMiAyNTZDMTY4LjMyIDI4OCAxODYuMSAzMTQuOSAyMTAuNyAzMjJDMTg2LjEgMzI5LjEgMTY4LjMyIDM1NiAxNjguMzIgMzg4QzE2OC4zMiA0MjUuNyAxOTguNjggNDU2IDIzNi4zMiA0NTZDMjU5LjggNDU2IDI4MC4zIDQ0My43IDI5MS4zIDQyNS4xQzMwMi4zIDQzMC45IDMxNC43IDQzNCAzMjggNDM0QzM3NS41IDQzNCA0MTQgMzk1LjUgNDE0IDM0OEMxMjYgMjI0IDE0NCAxOTIgMjE0LjcgMTg0QzE0NiAxNTQgMjA4IDgwIDIyNCAxMTJDMjI0IDExMiAyMjQgMTI4IDI1NiAxMjhDMjg4IDEyOCAyODggMTEyIDI4OCAxMTJDMzA0IDgwIDM2NiAxNTQgMjk4IDE4NEMzNjggMTkyIDM4NiAyMjQgMzg2IDM0OEM1NDQgMTI4IDM1MiAzMiAyODggMzJaTTMwNC4zIDMzNkMzMTYuNiAzMzYgMzI4IDMyNC43IDMyOCAzMTIuMyZDMzI4IDMwMC4xIDMxNi42IDI4OCAzMDQuMyAyODhDMjkyLjEgMjg4IDI4MCAyOTkuNCgyODAgMzExLjdDMjgwIDMyNCAyOTIuMSAzMzYgMzA0LjMgMzM2Wk0yNTYgMzEyQzI2OC4yIDMxMiAyNzkuNSAzMDAuNyAyNzkuNSAyODguNSZDMjc5LjUgMjc2LjMgMjY4LjIgMjY0IDI1NiAyNjRDMjQzLjggMjY0IDIzMiAyNzUuMyAyMzIgMjg3LjVDMjMyIDI5OS43IDI0My44IDMxMiAyNTYgMzEyWk0yODggMzk5LjVDMjg4IDM4Ny4zIDI3Ni43IDM3NiAyNjQuNSAzNzZDMjUyLjMgMzc2IDI0MSAzODcuMyAyNDEgMzk5LjVDMjQxIDQxMS43IDI1Mi4zIDQyNCAyNjQuNSA0MjRDMjc2LjcgNDI0IDI4OCA0MTEuNyAyODggMzk5LjVaIi8+PC9zdmc+',
    cactus: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjMDA5QjRGIj48cGF0aCBkPSJNNjEuMzcgNTEySDE5OS41QzIyMiA1MTIgMjQwIDQ5NCAyNDAgNDcxLjVWMTkyLjNDMjQwIDE2OS44IDI1OCAxNTEuOCAyODAuNSAxNTEuOEgzMDRDMzIxLjcgMTUxLjggMzM2IDE2Ni4xIDMzNiAxODMuOFY0NzEuNUMzMzYgNDk0IDM1NCA1MTIgMzc2LjUgNTEySDQ1MC42QzQ3My4xIDUxMiA0OTEuMSA0OTQgNDkxLjEgNDcxLjVWMTI0LjdDNDkxLjEgOTYuMzIgNDkxLjkgNjcuODUgNDcyLjQgNDIuMzJDNDU5LjkgMjYuMjIgNDQxLjUgMTYgNDIyLjEgMTZIMzcwLjFDMzQ0IDYyIDMyMC4xIDgwIDMwNC4xIDgwQzI4My41IDgwIDI2Ny40IDY3LjY1IDI1NC45IDUwLjM1QzI0Mi40IDMzLjA1IDIzMy4xIDE2IDIxOC4xIDE2QzIwMy4yIDE2IDE5My44IDMzLjA1IDE4MS4zIDUwLjM1QzE2OC44IDY3LjY1IDE1Mi43IDgwIDEzMiA4MEMxMTUuOSA4MCA5Mi4wMyA2MiA2Ni4wNCAxNkg4OS45NEMxMDguNSAxNiAxMjQgMzEuNDcgMTI0IDUwLjA2QzEyNCAxMzAuOCAxMjQgMjM4IDEyNCAzMThDMTI0IDMzMy44IDExOCAzNDIuMyAxMDQgMzQ5LjRDODkuOTUgMzU2LjUgNzUuNDQgMzc1LjcgNzUuNDQgMzkxLjVDNzUuNDQgNDA3LjMgNjkuOTUgNDI0LjUgNTYgNDI0LjJDNDIuMTkgNDI0LjIgMjguNDQgNDI2LjUgMjAgNDM5LjhDMTEuNjkgNDUzIDIwLjg4IDQ3MS42IDM4Ljg3IDQ3OS40QzU2Ljg3IDQ4Ny4xIDYxLjM3IDQ5MyA2MS4zNyA1MTJaIi8+PC9zdmc+',
    generic: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjMmU3ZDMyIj48cGF0aCBkPSJNMjk0LjQgMjIxLjNMNzkuMSA1MC43Yy0zLjctMy00LjItOC40LTEuMS0xMi4yIDMtMy44IDguNS00LjMgMTIuMi0xLjFsMjE1LjMgMTcwLjZjMy43IDMgNC4yIDguNCAxLjEgMTIuMi0zIDMuOC04LjUgNC4zLTEyLjIgMS4xem0tNzYuOCAyNjBsLTIxNS4zLTE3MC42Yy0zLjctMy00LjItOC40LTEuMS0xMi4yIDMtMy44IDguNS00LjMgMTIuMi0xLjFsMjE1LjMgMTcwLjZjMy43IDMgNC4yIDguNCAxLjEgMTIuMi0zIDMuOC04LjUgNC4zLTEyLjIgMS4xeiIvPjxwYXRoIGQ9Ik0yOTQuNCAxOEw3OS4xIDE4OC42Yy0zLjcgMy00LjIgOC40LTEuMSAxMi4yIDMgMy44IDguNSA0LjMgMTIuMiAxLjFsMjE1LjMtMTcwLjZjMy43LTMgNC4yLTguNCAxLjEtMTIuMi0zLTMuOC04LjUtNC4zLTEyLjIgMS4xem0wIDQxNS40TDc5LjEgNjA0Yy0zLjcgMy00LjIgOC40LTEuMSAxMi4yIDMgMy44IDguNSA0LjMgMTIuMiAxLjFsMjE1LjMtMTcwLjZjMy43LTMgNC4yLTguNCAxLjEtMTIuMi0zLTMuOC04LjUtNC4zLTEyLjIgMS4xeiIvPjxwYXRoIGQ9Ik0zOTYuMyA2NEwxODEgMjM0LjZjLTMuNyAzLTQuMiA4LjQtMS4xIDEyLjIgMyAzLjggOC41IDQuMyAxMi4yIDEuMWwyMTUuMy0xNzAuNmMzLjctMyA0LjItOC40IDEuMS0xMi4yLTMtMy44LTguNS00LjMtMTIuMiAxLjF6bTAgMTk1LjhMMTgxIDQzMC40Yy0zLjcgMy00LjIgOC40LTEuMSAxMi4yIDMgMy44IDguNSA0LjMgMTIuMiAxLjFsMjE1LjMtMTcwLjZjMy43LTMgNC4yLTguNCAxLjEtMTIuMi0zLTMuOC04LjUtNC4zLTEyLjIgMS4xeiIvPjxwYXRoIGQ9Ik0yNTYgNDBjLTEzLjMgMC0yNCA5LjgtMjQgMjIgMCAxMi4yIDEwLjcgMjIgMjQgMjJzMjQtOS44IDI0LTIyYzAtMTIuMi0xMC43LTIyLTI0LTIyem0wIDE5NWMtMTMuMyAwLTI0IDkuOC0yNCAyMiAwIDEyLjIgMTAuNyAyMiAyNCAyMnMyNC05LjggMjQtMjJjMC0xMi4yLTEwLjctMjItMjQtMjJ6bTAtMzljLTEzLjMgMC0yNCA5LjgtMjQgMjIgMCAxMi4yIDEwLjcgMjIgMjQgMjJzMjQtOS44IDI0LTIyYzAtMTIuMi0xMC43LTIyLTI0LTIyem0wIDE5NWMtMTMuMyAwLTI0IDkuOC0yNCAyMiAwIDEyLjIgMTAuNyAyMiAyNCAyMnMyNC05LjggMjQtMjJjMC0xMi4yLTEwLjctMjItMjQtMjJ6Ii8+PC9zdmc+'
};

async function getPlantDetails(speciesKey) {
    try {
        // Get species details from GBIF API
        const response = await fetch(`https://api.gbif.org/v1/species/${speciesKey}`);
        const data = await response.json();
        
        // Get occurrence data for images
        const occurrenceResponse = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${speciesKey}&limit=5&mediaType=StillImage`);
        const occurrenceData = await occurrenceResponse.json();
        
        // Get a suitable default image based on plant type
        let defaultImage = defaultPlantImages.generic;
        if (data.family) {
            // Try to match family to a plant type
            const family = data.family.toLowerCase();
            if (family.includes('cactac')) {
                defaultImage = defaultPlantImages.cactus;
            } else if (family.includes('orchi')) {
                defaultImage = defaultPlantImages.flower;
            } else if (family.includes('rosa')) {
                defaultImage = defaultPlantImages.flower;
            } else if (family.includes('asterac')) {
                defaultImage = defaultPlantImages.flower;
            } else if (family.includes('fab')) {
                defaultImage = defaultPlantImages.herb;
            } else if (family.includes('poac')) {
                defaultImage = defaultPlantImages.herb;
            } else if (family.includes('arec')) {
                defaultImage = defaultPlantImages.tree;
            } else if (family.includes('fern')) {
                defaultImage = defaultPlantImages.fern;
            } else if (family.includes('succu')) {
                defaultImage = defaultPlantImages.succulent;
            }
        }
        
        let imageUrl = defaultImage;
        
        // Try to find an image in the occurrences
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
                            console.log("Image URL not accessible, using default image");
                        }
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
