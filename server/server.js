const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CORS - allow all origins for testing
app.use(cors({
  origin: '*',
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/recipe", async (req, res) => {
  try {
    const { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

    const prompt = [
      "Generate a recipe that includes the following:",
      `Ingredients: ${ingredients}`,
      `Meal Type: ${mealType}`,
      `Cuisine Preference: ${cuisine}`,
      `Cooking Time: ${cookingTime}`,
      `Complexity: ${complexity}`,
      "Provide detailed preparation and cooking steps. Use only the given ingredients. Give it a culturally relevant name."
    ].join(" ");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ recipe: text });
  } catch (error) {
    console.error('Error generating recipe:', error); // 💡 SEE THE REAL ERROR IN Render LOGS
    res.status(500).json({ error: "Error generating recipe" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
