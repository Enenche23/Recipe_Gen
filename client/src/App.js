import './App.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const RecipeCard = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [complexity, setComplexity] = useState('');

  const handleSubmit = () => {
    const data = {
      ingredients: ingredients.trim(),
      mealType,
      cuisine,
      cookingTime,
      complexity,
    };
    console.log('Submitting:', data);
    onSubmit(data);
  };

  return (
    <div className='recipe-card'>
      <h2 className='recipe-title'>🍽️ Recipe Generator</h2>
      <label>Ingredients</label>
      <input className='input-field' value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder='e.g. rice, chicken, oil' />

      <label>Meal Type</label>
      <input className='input-field' value={mealType} onChange={(e) => setMealType(e.target.value)} placeholder='e.g. lunch' />

      <label>Cuisine Preference</label>
      <input className='input-field' value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder='e.g. Nigerian' />

      <label>Cooking Time</label>
      <input className='input-field' value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} placeholder='e.g. 1 hour' />

      <label>Complexity</label>
      <select className='input-field' value={complexity} onChange={(e) => setComplexity(e.target.value)}>
        <option value=''>Select Complexity</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>

      <div className="recipe-actions">
        <button className='generate-btn' onClick={handleSubmit}>Generate Recipe</button>
      </div>
    </div>
  );
};

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [chunks, setChunks] = useState([]);
  const eventSourceRef = useRef(null);

  const closeStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const initializeStream = useCallback(() => {
    if (!recipeData) return;
    const query = new URLSearchParams(recipeData).toString();
    const url = `https://recipe-backend-47av.onrender.com/recipeStream?${query}`;
    console.log('Connecting to:', url);

    eventSourceRef.current = new EventSource(url);

    let firstChunk = true;

    eventSourceRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.action === 'chunk') {
        let text = data.chunk.trim();

        // If first chunk starts with ## Title, treat as title
        if (firstChunk && text.startsWith('##')) {
          text = text.replace(/^##\s*/, '');
          setChunks((prev) => [...prev, { type: 'title', text }]);
        } else {
          // Make words after "**" bold
          const processed = text.replace(/\*\*(.+?)\*\*/g, '<span class="bold-text">$1</span>');
          setChunks((prev) => [...prev, { type: 'chunk', text: processed }]);
        }
        firstChunk = false;
      }
      if (data.action === 'close') {
        closeStream();
      }
    };

    eventSourceRef.current.onerror = (e) => {
      console.error('EventSource error:', e);
      closeStream();
    };
  }, [recipeData]);

  useEffect(() => {
    if (recipeData) {
      setChunks([]);
      closeStream();
      initializeStream();
    }
  }, [recipeData, initializeStream]);

  const onSubmit = (data) => {
    setRecipeData(data);
  };

  const saveAsPDF = () => {
    const printContent = document.querySelector('.recipe-output').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<html><head><title>Recipe</title></head><body>${printContent}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const copyToClipboard = () => {
    const text = chunks.map(chunk => chunk.text.replace(/<[^>]+>/g, '')).join('\n');
    navigator.clipboard.writeText(text);
  };

  const clearRecipe = () => {
    setChunks([]);
  };

  return (
    <div className='app-container'>
      <RecipeCard onSubmit={onSubmit} />
      <div className='recipe-output'>
        {chunks.length === 0 ? (
          <span className='placeholder-text'>Your recipe will appear here...</span>
        ) : (
          <>
            {chunks.map((chunk, idx) => (
              chunk.type === 'title' ? (
                <h3 key={idx}>{chunk.text}</h3>
              ) : (
                <p key={idx} dangerouslySetInnerHTML={{ __html: chunk.text }} />
              )
            ))}
          </>
        )}
      </div>
      {chunks.length > 0 && (
        <div className='action-buttons'>
          <button className='action-btn pdf-btn' onClick={saveAsPDF}>Save as PDF</button>
          <button className='action-btn' onClick={copyToClipboard}>Copy</button>
          <button className='action-btn' onClick={clearRecipe}>Clear</button>
        </div>
      )}
    </div>
  );
}

export default App;
