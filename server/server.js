const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow frontend (adjust if deployed)
app.use(cors({
  origin: '*', // Or set to your frontend URL e.g., 'https://your-frontend.netlify.app'
  credentials: true
}));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Recipe generation route (simple fetch, no streaming)
app.get("/recipe", async (req, res) => {
  const { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

  const prompt = [
    "Generate a recipe with these details:",
    `Ingredients: ${ingredients}`,
    `Meal Type: ${mealType}`,
    `Cuisine Preference: ${cuisine}`,
    `Cooking Time: ${cookingTime}`,
    `Complexity: ${complexity}`,
    "Please provide a detailed recipe, including preparation and cooking steps. Only use the ingredients listed. Give the recipe a culturally relevant name."
  ].join(" ");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const recipe = result.response.text();

    res.json({ recipe });
  } catch (err) {
    console.error('Error generating recipe:', err);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
