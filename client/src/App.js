import './App.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { marked } from 'marked';

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

    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onmessage = (event) => {
      console.log('Received:', event.data);
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

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      ingredients: data.ingredients.trim()
    };
    setRecipeData(formattedData);
  };

  return (
    <div className='app-container'>
      <RecipeCard onSubmit={onSubmit} />
      <div
        className='recipe-output'
        dangerouslySetInnerHTML={{ __html: marked(recipeText) }}
      />
    </div>
  );
}

export default App;
