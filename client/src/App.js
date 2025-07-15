/** App.js (using /recipe endpoint, no stream) **/

import './App.css';
import React, { useState } from 'react';

const RecipeCard = ({ onSubmit, loading }) => {
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

      <button onClick={handleSubmit} className='generate-btn' disabled={loading}>
        {loading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </div>
  );
};

function App() {
  const [recipeText, setRecipeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setRecipeText('');

    const queryParams = new URLSearchParams(data).toString();
    const url = `https://recipe-backend-47av.onrender.com/recipe?${queryParams}`;

    console.log('Fetching from:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error generating recipe');
      const result = await response.json();
      setRecipeText(result.recipe || '');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error generating recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='app-container'>
      <RecipeCard onSubmit={onSubmit} loading={loading} />
      <div className='recipe-output'>
        {loading && <span className='placeholder-text'>Loading...</span>}
        {error && <span className='error-text'>{error}</span>}
        {!loading && !error && recipeText && <pre>{recipeText}</pre>}
        {!loading && !error && !recipeText && (
          <span className='placeholder-text'>Your recipe will appear here...</span>
        )}
      </div>
    </div>
  );
}

export default App;
