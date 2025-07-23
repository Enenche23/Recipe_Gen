import React, { useState } from "react";
import { marked } from "marked";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    ingredients: "",
    mealType: "",
    cuisine: "",
    cookingTime: "",
    complexity: ""
  });

  const [recipe, setRecipe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setRecipe(""); // clear before starting

    try {
      const params = new URLSearchParams(formData).toString();
      const response = await fetch(
        `https://recipe-backend-47av.onrender.com/recipeStream?${params}`
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // remove "## " only at the start of the first chunk if present
        if (fullText.startsWith("## ")) {
          fullText = "**" + fullText.slice(3).trimStart() + "**";
        }

        setRecipe(fullText);
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Failed to generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setFormData({
      ingredients: "",
      mealType: "",
      cuisine: "",
      cookingTime: "",
      complexity: ""
    });
    setRecipe("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recipe).then(() =>
      alert("Recipe copied to clipboard!")
    );
  };

  const handleSavePDF = () => {
    const element = document.createElement("a");
    const blob = new Blob([recipe], { type: "application/pdf" });
    element.href = URL.createObjectURL(blob);
    element.download = "recipe.pdf";
    element.click();
  };

  return (
    <div className="app-container">
      <h1>AI Recipe Generator</h1>

      <div className="form">
        <input
          type="text"
          name="ingredients"
          placeholder="Ingredients (comma-separated)"
          value={formData.ingredients}
          onChange={handleChange}
        />
        <input
          type="text"
          name="mealType"
          placeholder="Meal Type (e.g., lunch, dinner)"
          value={formData.mealType}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cuisine"
          placeholder="Cuisine (e.g., Nigerian, Italian)"
          value={formData.cuisine}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cookingTime"
          placeholder="Cooking Time (e.g., 30 mins)"
          value={formData.cookingTime}
          onChange={handleChange}
        />
        <input
          type="text"
          name="complexity"
          placeholder="Complexity (e.g., Easy, Intermediate)"
          value={formData.complexity}
          onChange={handleChange}
        />

        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Recipe"}
        </button>
      </div>

      <div className="buttons-row">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handleSavePDF}>Save as PDF</button>
      </div>

      <div
        className="recipe-output"
        dangerouslySetInnerHTML={{ __html: marked.parse(recipe) }}
      />
    </div>
  );
}

export default App;
