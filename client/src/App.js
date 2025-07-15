import './App.css';
import React, { useState } from 'react';

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
  const [recipeText, setRecipeText] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setRecipeText(''); // clear previous recipe

    try {
      const queryParams = new URLSearchParams(data).toString();
      const url = `https://recipe-backend-47av.onrender.com/recipe?${queryParams}`;
      console.log('Fetching from:', url);

      const response = await fetch(url);
      const result = await response.json();

      if (result.recipe) {
        setRecipeText(result.recipe);
      } else {
        setRecipeText('Failed to generate recipe.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setRecipeText('Error generating recipe.');
    }

    setLoading(false);
  };

  return (
    <div className='app-container'>
      <RecipeCard onSubmit={onSubmit} />
      <div className='recipe-output'>
        {loading
          ? <span className='placeholder-text'>Generating recipe...</span>
          : (recipeText || <span className='placeholder-text'>Your recipe will appear here...</span>)
        }
      </div>
    </div>
  );
}

export default App;
