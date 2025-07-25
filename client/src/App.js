import React, { useState } from 'react';
import './App.css';
import { marked } from 'marked';
// eslint-disable-next-line
import html2pdf from 'html2pdf.js';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [complexity, setComplexity] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setRecipe('');
    setLoading(true);
    const query = new URLSearchParams({ ingredients, mealType, cuisine, cookingTime, complexity }).toString();
    const url = `https://recipe-backend-47av.onrender.com/recipeStream?${query}`;
    console.log('Connecting to:', url);

    const eventSource = new EventSource(url);
    let accumulated = '';

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.action === 'chunk') {
        accumulated += data.chunk;
        setRecipe(accumulated);
      } else if (data.action === 'close') {
        eventSource.close();
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
      setLoading(false);
    };
  };

  const handleClear = () => setRecipe('');

  const handleCopy = () => {
    navigator.clipboard.writeText(recipe);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const element = document.createElement('div');
    element.innerHTML = formatRecipe(recipe);
    element.style.padding = '20px';
    element.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    element.style.fontSize = '12pt';
    element.style.textAlign = 'justify'; // make text justified

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: 'recipe.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const formatRecipe = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    if (lines[0].startsWith('##')) {
      lines[0] = `# ${lines[0].replace(/^##\s*/, '')}`;
    }
    return marked.parse(lines.join('\n'));
  };

  return (
    <div className="app-container">
      <h1 className="app-title">AI Recipe Generator</h1>
      <div className="form-card">
        <form className="recipe-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />
          <input type="text" placeholder="Meal Type" value={mealType} onChange={(e) => setMealType(e.target.value)} required />
          <input type="text" placeholder="Cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} required />
          <input type="text" placeholder="Cooking Time" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} required />
          <input type="text" placeholder="Complexity" value={complexity} onChange={(e) => setComplexity(e.target.value)} required />
          <button className="generate-btn" type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>
        </form>
      </div>

      {recipe && (
        <div className="recipe-container">
          <div className="recipe-text" dangerouslySetInnerHTML={{ __html: formatRecipe(recipe) }}></div>
          <div className="recipe-actions">
            <button className="action-btn" onClick={handleClear}>Clear</button>
            <button className="action-btn" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
            <button className="action-btn" onClick={handleSave}>Save as PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
