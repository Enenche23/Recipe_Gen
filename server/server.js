// server/server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Enable JSON and URL encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS: allow both localhost (for dev) and Netlify (for prod)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ejeh-recipe-gen-app.netlify.app'
  ],
  credentials: true
}));

// Simple test route
app.get("/", (req, res) => {
  res.json({ message: "✅ Recipe Generator backend is working!" });
});

// ✅ New /recipe endpoint: single-response (not streaming)
app.get("/recipe", async (req, res) => {
  const { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

  const prompt = [
    "Generate a recipe that incorporates the following details:",
    `Ingredients: ${ingredients}`,
    `Meal Type: ${mealType}`,
    `Cuisine Preference: ${cuisine}`,
    `Cooking Time: ${cookingTime}`,
    `Complexity: ${complexity}`,
    "Please provide a detailed recipe, including preparation and cooking steps.",
    "Only use the ingredients listed. Give the recipe a culturally relevant name."
  ].join(" ");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ recipe: text });
  } catch (err) {
    console.error('❌ Error generating recipe:', err);
    res.status(500).json({ error: "Error generating recipe" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
