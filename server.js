// Dog Scanner Backend
// Ye server aapki Gemini API key ko surakshit (server-side) rakhta hai.
// Aapka app (web ya mobile) is server ko call karega, seedhe Gemini ko nahi.

const express = require("express");
const cors = require("cors");

const app = express();

// Bade images (base64) accept karne ke liye limit badhayi
app.use(express.json({ limit: "10mb" }));
app.use(cors()); // production mein isko apni app ke domain tak restrict kar sakte hain

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

if (!GEMINI_API_KEY) {
  console.warn(
    "⚠️  GEMINI_API_KEY environment variable set nahi hai. Hosting platform (Render/Railway) ke 'Environment Variables' section mein isse add karein."
  );
}

const PROMPT_TEXT = `You are a field-guide style dog identification assistant. Look at the photo and respond with ONLY a raw JSON object, no markdown fences, no preamble, matching exactly this shape:
{"isDog": true, "breedGuesses": [{"name": "string", "confidence": "high|medium|low"}], "characteristics": ["string", "string", "string"], "healthObservations": ["string", "string"], "disclaimer": "string"}
Rules: breedGuesses should list 1-3 plausible breeds or mixes, most likely first. characteristics should be 3-5 short observed physical traits (coat, build, ears, tail, size impression) written like field-guide notes. healthObservations should be 2-4 short, purely observational notes about visible coat condition, body condition, posture, eyes, or skin - phrased cautiously and never a diagnosis. disclaimer should be one sentence stating this is not veterinary advice and a vet should be consulted for any health concerns. If the photo does not contain a dog, set isDog to false, leave breedGuesses and healthObservations as empty arrays, and put a brief note in characteristics explaining what you see instead.`;

// Health check - deploy sahi se hua ya nahi, ye check karne ke liye
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Dog Scanner backend chal raha hai." });
});

// Main endpoint - app yahi call karega
app.post("/api/scan", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server par GEMINI_API_KEY set nahi hai." });
    }

    const { imageBase64, mediaType } = req.body;
    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: "imageBase64 aur mediaType dono zaroori hain." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mediaType, data: imageBase64 } },
                { text: PROMPT_TEXT },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      return res.status(502).json({ error: data.error.message || "Gemini API se error aaya." });
    }

    const textOut = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOut) {
      return res.status(502).json({ error: "Gemini se koi response text nahi mila." });
    }

    const cleaned = textOut.replace(/```json|```/g, "").trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: "Gemini ka response valid JSON nahi tha." });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Kuch galat ho gaya." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dog Scanner backend port ${PORT} par chal raha hai`);
});
