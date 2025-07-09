const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = 3001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/recipeStream", async (req, res) => {
  const { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const prompt = [
    "Generate a recipe that incorporates the following details:",
    `Ingredients: ${ingredients}`,
    `Meal Type: ${mealType}`,
    `Cuisine Preference: ${cuisine}`,
    `Cooking Time: ${cookingTime}`,
    `Complexity: ${complexity}`,
    "Please provide a detailed recipe, including preparation and cooking steps.",
    "Only use the ingredients listed. Give the recipe a culturally relevant name.",
  ].join(" ");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({
          action: "chunk",
          chunk: chunkText
        })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "Error generating recipe" })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});