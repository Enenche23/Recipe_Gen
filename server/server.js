import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors({
  origin: '*', // allow all origins (or replace with your frontend URL for security)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Simple health check
app.get('/', (req, res) => {
  res.send('✅ Recipe backend is running!');
});

// 🧩 New streaming route
app.get('/recipeStream', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    const prompt = `
      Generate a step-by-step ${req.query.mealType} recipe.
      Cuisine: ${req.query.cuisine}.
      Cooking time: ${req.query.cookingTime}.
      Complexity: ${req.query.complexity}.
      Use these ingredients: ${req.query.ingredients}.
      Make steps clear and structured.
    `;

    const result = await model.generateContentStream([prompt]);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      res.write(`data: ${JSON.stringify({ action: 'chunk', chunk: text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ action: 'close' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ action: 'close' })}\n\n`);
    res.end();
  }
});


// old /recipe endpoint (optional)
app.get('/recipe', async (req, res) => {
  try {
    const prompt = `
      Generate a step-by-step ${req.query.mealType} recipe.
      Cuisine: ${req.query.cuisine}.
      Cooking time: ${req.query.cookingTime}.
      Complexity: ${req.query.complexity}.
      Use these ingredients: ${req.query.ingredients}.
    `;
    const result = await model.generateContent(prompt);
    res.json({ recipe: result.response.text() });
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
