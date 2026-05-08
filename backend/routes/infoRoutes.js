const express = require("express");
const router = express.Router();
const axios = require("axios");

const WEATHER_KEY = process.env.WEATHER_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

/* ------------------- WEATHER ------------------- */

router.get("/weather", async (req, res) => {
  try {

    const { latitude, longitude } = req.query;

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: WEATHER_KEY,
          units: "metric"
        }
      }
    );

    res.json(response.data);

  } catch (err) {

    console.error("Weather Error:", err.message);
    res.status(500).json({ error: "Weather fetch failed" });

  }
});


/* ------------------- REVERSE GEOCODE ------------------- */

router.get("/reverse", async (req, res) => {
  try {

    const { latitude, longitude } = req.query;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
          zoom: 14
        },
        headers: {
          "User-Agent": "SafeTour-App"
        }
      }
    );

    const addr = response.data.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.county ||
      addr.state_district ||
      addr.suburb ||
      addr.village ||
      addr.state ||
      "Unknown";

    res.json({ city });

  } catch (err) {

    console.error("Reverse Geocode Error:", err.message);
    res.status(500).json({ error: "City fetch failed" });

  }
});


/* ------------------- GEMINI AI KNOW ABOUT ------------------- */

const cache = {};

router.get("/ai-guidelines", async (req, res) => {

  try {

    const { city } = req.query;

    if (!city) {
      return res.json({
        guidelines: "No location information available."
      });
    }

    const cityKey = city.toLowerCase();

    /* ---------- CACHE CHECK ---------- */

    if (cache[cityKey]) {
      return res.json({ guidelines: cache[cityKey] });
    }

    /* ---------- GEMINI REQUEST ---------- */

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Provide a short tourist guide for ${city}.

Include these sections:

Tourist Attractions
- famous places tourists visit

Famous For
- food, culture, festivals

Local Tips
- useful things tourists should know

Safety Tips
- things tourists should avoid

Use bullet points and keep it short.`
              }
            ]
          }
        ]
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tourist information not available.";

    /* ---------- SAVE CACHE ---------- */

    cache[cityKey] = text;

    res.json({ guidelines: text });

  } catch (err) {

    console.error("Gemini Error:", err.response?.data || err.message);

    /* ---------- FALLBACK WHEN GEMINI FAILS ---------- */

    res.json({
      guidelines: `Tourist Attractions
• Popular temples, beaches and cultural sites

Famous For
• Local food, traditions and festivals

Local Tips
• Visit during morning or evening hours
• Use local transport for short distances

Safety Tips
• Avoid isolated places at night
• Keep valuables secure`
    });

  }

});

module.exports = router;