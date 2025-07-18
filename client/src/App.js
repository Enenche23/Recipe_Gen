import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    ingredients: '',
    mealType: '',
    cuisine: '',
    cookingTime: '',
    complexity: ''
  });
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const recipeRef = useRef(null);

  const onSubmit = async () => {
    setLoading(true);
    setRecipe('');
    console.log('Submitting:', formData);

    const params = new URLSearchParams(formData).toString();
    const url = `https://recipe-backend-47av.onrender.com/recipeStream?${params}`;
    console.log('Connecting to:', url);

    const eventSource = new EventSource(url);

    let finalRecipe = '';

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.action === 'chunk') {
        finalRecipe += data.chunk;
        setRecipe((prev) => prev + data.chunk);
      } else if (data.action === 'close') {
        eventSource.close();
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      eventSource.close();
      setLoading(false);
    };
  };

  const clearRecipe = () => {
    setRecipe('');
  };

  const copyRecipe = () => {
    navigator.clipboard.writeText(recipe);
    alert('Recipe copied to clipboard!');
  };

  const saveAsPDF = () => {
    const element = document.createElement('a');
    const file = new Blob([recipe], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = 'recipe.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 🪄 Extract title (first ## ...) and the rest
  const titleMatch = recipe.match(/^##\s*(.*)/);
  const recipeTitle = titleMatch ? titleMatch[1] : '';
  const recipeBody = titleMatch ? recipe.replace(titleMatch[0], '').trim() : recipe;

  return (
    <div className="app-container">
      <div className="recipe-card">
        <h2 className="recipe-title">AI Recipe Generator</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Ingredients (comma separated)"
          value={formData.ingredients}
          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Meal Type (e.g., lunch, dinner)"
          value={formData.mealType}
          onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Cuisine (e.g., Nigerian)"
          value={formData.cuisine}
          onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Cooking Time (e.g., 30 minutes)"
          value={formData.cookingTime}
          onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
        />
        <input
          className="input-field"
          type="text"
          placeholder="Complexity (e.g., Easy, Intermediate)"
          value={formData.complexity}
          onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
        />

        <button className="generate-btn" onClick={onSubmit} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </div>

      <div className="recipe-output" ref={recipeRef}>
        {recipe ? (
          <>
            {recipeTitle && <h3 className="generated-title">{recipeTitle}</h3>}
            <pre className="recipe-text">{recipeBody}</pre>
          </>
        ) : (
          <div className="placeholder-text">Your recipe will appear here...</div>
        )}
      </div>

      {recipe && (
        <div className="recipe-actions">
          <button className="action-btn" onClick={clearRecipe}>Clear</button>
          <button className="action-btn" onClick={copyRecipe}>Copy</button>
          <button className="action-btn" onClick={saveAsPDF}>Save as PDF</button>
        </div>
      )}
    </div>
  );
}

export default App;
