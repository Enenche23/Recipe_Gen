import React, { useState, useRef } from "react";
import { marked } from "marked";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [complexity, setComplexity] = useState("");
  const [recipe, setRecipe] = useState("");
  const [title, setTitle] = useState("");  // new title state

  const [isLoading, setIsLoading] = useState(false);
  //const recipeRef = useRef(null);

  const handleGenerate = async () => {
    setRecipe("");
    setTitle("");
    setIsLoading(true);
    const url = `https://recipe-backend-47av.onrender.com/recipeStream?ingredients=${encodeURIComponent(
      ingredients
    )}&mealType=${encodeURIComponent(mealType)}&cuisine=${encodeURIComponent(
      cuisine
    )}&cookingTime=${encodeURIComponent(
      cookingTime
    )}&complexity=${encodeURIComponent(complexity)}`;

    console.log("Connecting to:", url);

    const eventSource = new EventSource(url);
    let firstChunk = true;

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.action === "chunk") {
        if (firstChunk) {
          // Try to extract first heading as title
          const match = data.chunk.match(/##\s*(.*)/);
          if (match) {
            setTitle(match[1].trim());
          }
          firstChunk = false;
        } else {
          setRecipe((prev) => prev + data.chunk + "\n");
        }
      } else if (data.action === "close") {
        setIsLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err);
      eventSource.close();
      setIsLoading(false);
    };
  };

  return (
    <div className="app-container">
      <h1 className="recipe-title">AI Recipe Generator</h1>

      <div className="recipe-card">
        <input
          className="input-field"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Ingredients (e.g., rice, beans, oil)"
        />
        <input
          className="input-field"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          placeholder="Meal Type (e.g., lunch, dinner)"
        />
        <input
          className="input-field"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="Cuisine Preference"
        />
        <input
          className="input-field"
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
          placeholder="Cooking Time (e.g., 1 hour)"
        />
        <input
          className="input-field"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
          placeholder="Complexity (e.g., easy, pro)"
        />
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Recipe"}
        </button>
      </div>

      {title && <h2 className="generated-title">{title}</h2>}

      <div
        className="recipe-output recipe-text"
        dangerouslySetInnerHTML={{ __html: marked.parse(recipe) }}
      />

      {/* Action buttons */}
      <div className="recipe-actions">
        <button
          className="action-btn"
          onClick={() => setRecipe("")}
          disabled={!recipe}
        >
          Clear
        </button>
        <button
          className="action-btn"
          onClick={() => navigator.clipboard.writeText(title + "\n\n" + recipe)}
          disabled={!recipe}
        >
          Copy
        </button>
        <button
          className="action-btn"
          onClick={() => window.print()}
          disabled={!recipe}
        >
          Save as PDF
        </button>
      </div>
    </div>
  );
}

export default App;
