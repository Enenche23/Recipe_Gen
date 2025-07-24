import React, { useState } from 'react';
import './App.css';
import { marked } from 'marked';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [complexity, setComplexity] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false); // new state to show copy success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecipe('');
    setLoading(true);

    try {
      const query = new URLSearchParams({
        ingredients,
        mealType,
        cuisine,
        cookingTime,
        complexity
      }).toString();

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
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleClear = () => setRecipe('');

  const handleCopy = () => {
    navigator.clipboard.writeText(recipe).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // hide after 2s
    });
  };

  const handleSave = () => {
    const blob = new Blob([recipe], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recipe.pdf'; // shows as Save as PDF
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format markdown to HTML
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
      <form className="recipe-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ingredients (e.g., rice, chicken, spices)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Meal Type (e.g., lunch, dinner)"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cuisine (e.g., Nigerian, Italian)"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cooking Time (e.g., 30 minutes)"
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Complexity (e.g., Easy, Intermediate)"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
          required
        />
        <button className="generate-btn" type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </form>

      {recipe && (
        <div className="recipe-container">
          <div className="recipe-text" dangerouslySetInnerHTML={{ __html: formatRecipe(recipe) }}></div>
          <div className="recipe-actions">
            <button className="action-btn" onClick={handleClear}>Clear</button>
            <button className="action-btn" onClick={handleCopy}>Copy</button>
            <button className="action-btn" onClick={handleSave}>Save as PDF</button>
          </div>
          {copied && <div className="copy-alert">Copied!</div>}
        </div>
      )}
    </div>
  );
}

export default App;
