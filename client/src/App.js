import React, { useState, useRef } from "react";
import { marked } from "marked";
import "./App.css";

export default function App() {
  const [recipe, setRecipe] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [complexity, setComplexity] = useState("");
  const recipeRef = useRef(null);

  const onSubmit = async () => {
    setRecipe(""); // clear previous
    const params = {
      ingredients,
      mealType,
      cuisine,
      cookingTime,
      complexity,
    };
    console.log("Submitting:", params);

    const query = new URLSearchParams(params).toString();
    const url = `https://recipe-backend-47av.onrender.com/recipeStream?${query}`;
    console.log("Connecting to:", url);

    const eventSource = new EventSource(url);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.action === "chunk") {
        setRecipe((prev) => prev + data.chunk);
      } else if (data.action === "close") {
        eventSource.close();
      }
    };
    eventSource.onerror = (e) => {
      console.error("EventSource error:", e);
      eventSource.close();
    };
  };

  const copyToClipboard = () => {
    if (recipeRef.current) {
      navigator.clipboard.writeText(recipe);
    }
  };

  const saveAsPDF = () => {
    const element = document.createElement("a");
    const file = new Blob([recipe], { type: "application/pdf" });
    element.href = URL.createObjectURL(file);
    element.download = "recipe.pdf";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearRecipe = () => setRecipe("");

  return (
    <div className="app-container">
      <h1 className="recipe-title">AI Nigerian Recipe Generator</h1>
      <div className="recipe-card">
        <input
          className="input-field"
          type="text"
          placeholder="Ingredients (comma separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Meal Type (breakfast, lunch, etc)"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Cuisine (Nigerian, etc)"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Cooking Time (e.g., 1 hour)"
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Complexity (Easy, Intermediate, etc)"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
        />
        <button className="generate-btn" onClick={onSubmit}>
          Generate Recipe
        </button>
      </div>

      {recipe && (
        <>
          <div
            className="recipe-output"
            ref={recipeRef}
            dangerouslySetInnerHTML={{ __html: marked.parse(recipe) }}
          ></div>
          <div className="recipe-actions">
            <button className="action-btn" onClick={clearRecipe}>
              Clear
            </button>
            <button className="action-btn" onClick={copyToClipboard}>
              Copy
            </button>
            <button className="action-btn" onClick={saveAsPDF}>
              Save as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
