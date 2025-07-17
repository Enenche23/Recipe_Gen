import './App.css';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const RecipeCard = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [complexity, setComplexity] = useState('');

  const handleSubmit = () => {
    const recipeData = {
      ingredients: ingredients.trim(),
      mealType,
      cuisine,
      cookingTime,
      complexity,
    };
    console.log('Submitting:', recipeData);
    onSubmit(recipeData);
  };

  return (
    <div className="recipe-card">
      <h2 className="recipe-title">🍽️ Recipe Generator</h2>
      <label>Ingredients</label>
      <input type="text" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="e.g. rice, chicken" className="input-field" />

      <label>Meal Type</label>
      <input type="text" value={mealType} onChange={(e) => setMealType(e.target.value)} placeholder="e.g. lunch" className="input-field" />

      <label>Cuisine</label>
      <input type="text" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Nigerian" className="input-field" />

      <label>Cooking Time</label>
      <input type="text" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} placeholder="e.g. 30 minutes" className="input-field" />

      <label>Complexity</label>
      <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="input-field">
        <option value="">Select Complexity</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <div className="generate-container">
        <button onClick={handleSubmit} className="generate-btn">Generate Recipe</button>
      </div>
    </div>
  );
};

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState('');
  const eventSourceRef = useRef(null);
  const recipeRef = useRef(null);

  const closeEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const initializeEventStream = useCallback(() => {
    if (!recipeData) return;
    const queryParams = new URLSearchParams(recipeData).toString();
    const url = `https://recipe-backend-47av.onrender.com/recipeStream?${queryParams}`;
    console.log('Connecting to:', url);

    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === 'close') {
        closeEventStream();
      } else if (data.action === 'chunk') {
        setRecipeText((prev) => prev + data.chunk);
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error('EventSource error:', err);
      closeEventStream();
    };
  }, [recipeData]);

  useEffect(() => {
    if (recipeData) {
      setRecipeText('');
      closeEventStream();
      initializeEventStream();
    }
  }, [recipeData, initializeEventStream]);

  const handleClear = () => setRecipeText('');

  const handleCopy = () => {
    navigator.clipboard.writeText(recipeText);
    alert('Recipe copied to clipboard!');
  };

  const handleSaveAsPDF = () => {
    if (recipeRef.current) {
      html2pdf().from(recipeRef.current).save('recipe.pdf');
    }
  };

  const onSubmit = (data) => setRecipeData(data);

  return (
    <div className="app-container">
      <RecipeCard onSubmit={onSubmit} />
      <div className="recipe-output" ref={recipeRef}>
        {recipeText
          ? recipeText.split(/(\*\*.+?\*\*)/g).map((part, i) =>
              part.startsWith('**') && part.endsWith('**')
                ? <span key={i} className="bold-text">{part.slice(2, -2)}</span>
                : <span key={i}>{part}</span>
            )
          : <span className="placeholder-text">Your recipe will appear here...</span>}
      </div>

      {recipeText && (
        <div className="recipe-actions">
          <button className="action-btn" onClick={handleClear}>Clear</button>
          <button className="action-btn" onClick={handleCopy}>Copy</button>
          <button className="action-btn" onClick={handleSaveAsPDF}>Save as PDF</button>
        </div>
      )}
    </div>
  );
}

export default App;
