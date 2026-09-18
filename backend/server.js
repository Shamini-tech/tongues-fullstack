// Import the Express framework to create our HTTP web server
import express from 'express';
// Import CORS middleware to allow cross-origin requests from our React frontend (port 5173)
import cors from 'cors';
// Import node-fetch to make HTTP requests from Node.js to external APIs (Google & MyMemory)
import fetch from 'node-fetch';

// Initialize the Express application instance
const app = express();
// Define the backend port number
const PORT = 5000;

// Middleware 1: Enable CORS so browsers permit port 5173 to talk to port 5000
app.use(cors());
// Middleware 2: Automatically parse incoming request bodies containing raw JSON into req.body
app.use(express.json());

/**
 * Helper function to translate text via Google Translate's public endpoint.
 * @param {string} text - The input string to translate
 * @param {string} sourceCode - Source language code (e.g., 'en' or 'auto')
 * @param {string} targetCode - Target language code (e.g., 'es')
 */
async function translateViaGoogle(text, sourceCode, targetCode) {
  // Format the URL with query parameters, using encodeURIComponent to handle spaces/symbols safely
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
  
  // Send an asynchronous GET request to Google's translation service
  const res = await fetch(url);
  // Throw an error if Google returns an HTTP error status code (e.g., 429 Rate Limited or 500 Server Error)
  if (!res.ok) throw new Error(`Google responded ${res.status}`);
  
  // Parse the raw response into a JSON array
  const data = await res.json();
  
  // Google breaks long translations into array chunks: data[0] contains pairs like [['Hola', 'Hello']]
  // .map() extracts the translated string from each pair, and .join('') combines them into a full sentence
  return data[0].map(chunk => chunk[0]).join('');
}

/**
 * Fallback helper function to translate text via MyMemory API if Google fails.
 * @param {string} text - The input string to translate
 * @param {string} sourceCode - Source language code (e.g., 'en' or 'auto')
 * @param {string} targetCode - Target language code (e.g., 'es')
 */
async function translateViaMyMemory(text, sourceCode, targetCode) {
  // MyMemory does NOT support auto-detection ('auto'). If 'auto' is passed, default source language to 'en'
  const sl = sourceCode === 'auto' ? 'en' : sourceCode;
  
  // Format the MyMemory endpoint URL with language pairs (e.g., langpair=en|es)
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${targetCode}`;
  
  // Send an asynchronous GET request to MyMemory
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory responded ${res.status}`);
  
  const data = await res.json();
  
  // Safely extract the translated string using optional chaining (?.) to prevent crashes
  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error('MyMemory returned no translation');
  
  return translated;
}

// Define POST endpoint route at '/api/translate'
app.post('/api/translate', async (req, res) => {
  // Destructure payload properties sent from the React client
  const { text, sourceCode, targetCode } = req.body;

  // Validation: Guard clause to return a 400 Bad Request error if input text is empty
  if (!text) {
    return res.status(400).json({ error: 'Text input is required.' });
  }

  try {
    // Attempt 1: Call Google Translate primary provider
    const translated = await translateViaGoogle(text, sourceCode, targetCode);
    // Return successful translation as JSON back to React
    res.json({ translated });
  } catch (err) {
    // Log warning if primary call fails
    console.warn('Google endpoint failed, falling back to MyMemory:', err.message);
    
    try {
      // Attempt 2: Failover to MyMemory secondary provider
      const fallbackTranslated = await translateViaMyMemory(text, sourceCode, targetCode);
      // Return fallback translation back to React
      res.json({ translated: fallbackTranslated });
    } catch (fallbackErr) {
      // If both Google and MyMemory fail, return a 500 Internal Server Error
      res.status(500).json({ error: 'Translation failed on all providers.' });
    }
  }
});

// Start listening for incoming network requests on port 5000
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});