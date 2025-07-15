/** App.js **/

import './App.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';

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
    <div className='recipe-card'>
      <h2 className='recipe-title'>🍽️ Recipe Generator</h2>
      <label htmlFor='ingredients'>Ingredients</label>
      <input
        type='text'
        id='ingredients'
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        className='input-field'
        placeholder='e.g. rice, chicken, oil'
      />

      <label htmlFor='mealType'>Meal Type</label>
      <input
        type='text'
        id='mealType'
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        className='input-field'
        placeholder='e.g. breakfast, lunch, dinner'
      />

      <label htmlFor='cuisine'>Cuisine Preference</label>
      <input
        type='text'
        id='cuisine'
        value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}
        className='input-field'
        placeholder='e.g. Italian, Nigerian'
      />

      <label htmlFor='cookingTime'>Cooking Time</label>
      <input
        type='text'
        id='cookingTime'
        value={cookingTime}
        onChange={(e) => setCookingTime(e.target.value)}
        className='input-field'
        placeholder='e.g. 30 minutes'
      />

      <label htmlFor='complexity'>Complexity</label>
      <select
        id='complexity'
        value={complexity}
        onChange={(e) => setComplexity(e.target.value)}
        className='input-field'
      >
        <option value=''>Select Complexity</option>
        <option value='Beginner'>Beginner</option>
        <option value='Intermediate'>Intermediate</option>
        <option value='Advanced'>Advanced</option>
      </select>

      <button onClick={handleSubmit} className='generate-btn'>
        Generate Recipe
      </button>
    </div>
  );
};

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef(null);

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
    setIsLoading(true);

    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === 'close') {
        closeEventStream();
        setIsLoading(false);
      } else if (data.action === 'chunk') {
        setRecipeText((prev) => prev + data.chunk);
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error('EventSource error:', err);
      closeEventStream();
      setIsLoading(false);
    };
  }, [recipeData]);

  useEffect(() => {
    if (recipeData) {
      setRecipeText('');
      closeEventStream();
      initializeEventStream();
    }
  }, [recipeData, initializeEventStream]);

  const onSubmit = (data) => {
    setRecipeData({
      ...data,
      ingredients: data.ingredients.trim()
    });
  };

  const downloadPDF = (text) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = 'recipe.pdf';
    document.body.appendChild(element);
    element.click();
  };

  const formatRecipeText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const clean = part.slice(2, -2);
          return <strong key={i} className="bold-text">{clean}</strong>;
        }
        return part;
      });
      return <div key={idx}>{parts}</div>;
    });
  };

  return (
    <div className='app-container'>
      <RecipeCard onSubmit={onSubmit} />

      <div className='recipe-actions'>
        <button onClick={() => setRecipeText('')} className='action-btn' disabled={!recipeText}>
          🧹 Clear
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(recipeText || '');
            alert('✅ Recipe copied to clipboard!');
          }}
          className='action-btn'
          disabled={!recipeText}
        >
          📋 Copy
        </button>
        <button
          onClick={() => downloadPDF(recipeText)}
          className='action-btn'
          disabled={!recipeText}
        >
          📄 Save as PDF
        </button>
      </div>

      <div className='recipe-output'>
        {isLoading ? (
          <span className='placeholder-text'>🍳 Generating your recipe...</span>
        ) : recipeText ? (
          formatRecipeText(recipeText)
        ) : (
          <span className='placeholder-text'>Your recipe will appear here...</span>
        )}
      </div>
    </div>
  );
}

export default App;
