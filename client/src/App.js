import './App.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const RecipeCard = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [complexity, setComplexity] = useState('');

  const handleSubmit = () => {
    const data = { ingredients, mealType, cuisine, cookingTime, complexity };
    console.log('Submitting:', data);
    onSubmit(data);
  };

  return (
    <div className='recipe-card'>
      <h2 className='recipe-title'>🍽️ Recipe Generator</h2>

      <label>Ingredients</label>
      <input
        className='input-field'
        type='text'
        placeholder='e.g. rice, beans, oil'
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <label>Meal Type</label>
      <input
        className='input-field'
        type='text'
        placeholder='e.g. lunch, dinner'
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
      />

      <label>Cuisine Preference</label>
      <input
        className='input-field'
        type='text'
        placeholder='e.g. Nigerian, Italian'
        value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}
      />

      <label>Cooking Time</label>
      <input
        className='input-field'
        type='text'
        placeholder='e.g. 30 minutes'
        value={cookingTime}
        onChange={(e) => setCookingTime(e.target.value)}
      />

      <label>Complexity</label>
      <select
        className='input-field'
        value={complexity}
        onChange={(e) => setComplexity(e.target.value)}
      >
        <option value=''>Select Complexity</option>
        <option value='Beginner'>Beginner</option>
        <option value='Intermediate'>Intermediate</option>
        <option value='Advanced'>Advanced</option>
      </select>

      <button className='generate-btn' onClick={handleSubmit}>
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
      const data = JSON.parse(event.data);

      if (data.action === 'close') {
        closeEventStream();
      } else if (data.action === 'chunk') {
        // Apply bold effect: detect words wrapped with **...** and replace with <strong>
        const htmlChunk = data.chunk.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        setRecipeText((prev) => prev + htmlChunk);
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

  const onSubmit = (data) => setRecipeData(data);

  const clearRecipe = () => setRecipeText('');

  const copyRecipe = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = recipeText;
    const textContent = tempDiv.innerText;
    navigator.clipboard.writeText(textContent);
  };

  const saveAsPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<html><head><title>Recipe</title></head><body>${recipeText}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className='app-container'>
      <RecipeCard onSubmit={onSubmit} />
      <div className='recipe-output'>
        <div dangerouslySetInnerHTML={{ __html: recipeText || "<span class='placeholder-text'>Your recipe will appear here...</span>" }} />
        <div className='recipe-actions'>
          <button className='action-btn' onClick={clearRecipe}>Clear</button>
          <button className='action-btn' onClick={copyRecipe}>Copy</button>
          <button className='action-btn' onClick={saveAsPDF}>Save as PDF</button>
        </div>
      </div>
    </div>
  );
}

export default App;
