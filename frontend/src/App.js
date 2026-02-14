import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [palette, setPalette] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState({});

  // Real-time background color changes as user types
  useEffect(() => {
    if (inputText.length > 3) {
      // Simple sentiment-based color shift
      const positiveWords = ['happy', 'joy', 'love', 'excited', 'creative', 'beautiful', 'amazing'];
      const negativeWords = ['sad', 'angry', 'hate', 'scared', 'dark', 'tired', 'frustrated'];
      
      const text = inputText.toLowerCase();
      let hue = 260; // default purple-blue
      
      if (positiveWords.some(word => text.includes(word))) {
        hue = 45; // warm yellow
      } else if (negativeWords.some(word => text.includes(word))) {
        hue = 220; // blue
      }
      
      setBackgroundStyle({
        background: `linear-gradient(135deg, hsl(${hue}, 50%, 60%) 0%, hsl(${hue + 40}, 50%, 40%) 100%)`
      });
    }
  }, [inputText]);

  const generatePalette = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/synth/text-to-colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      const data = await response.json();
      if (data.success) {
        setPalette(data.palette);
      }
    } catch (error) {
      console.error('Error generating palette:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSS = async () => {
    if (!palette) return;
    
    try {
      const response = await fetch('/api/synth/export/css', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ palette: palette.colors }),
      });
      
      const data = await response.json();
      if (data.success) {
        navigator.clipboard.writeText(data.output);
        alert('CSS variables copied to clipboard!');
      }
    } catch (error) {
      console.error('Error exporting CSS:', error);
    }
  };

  return (
    <div className="App" style={backgroundStyle}>
      <div className="container">
        <header className="header">
          <h1>Synth</h1>
          <p>Turn feelings into functional design palettes</p>
        </header>

        <div className="input-section">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe how you're feeling... (e.g., 'I feel creative and energetic!')"
            className="emotion-input"
            rows={3}
          />
          <button 
            onClick={generatePalette}
            disabled={!inputText.trim() || isLoading}
            className="generate-btn"
          >
            {isLoading ? 'Generating...' : 'Generate Palette'}
          </button>
        </div>

        {palette && (
          <div className="palette-section">
            <h3>Your Color Palette</h3>
            <div className="color-swatches">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  title={color}
                  onClick={() => navigator.clipboard.writeText(color)}
                >
                  <span className="color-code">{color}</span>
                </div>
              ))}
            </div>
            
            <div className="palette-info">
              <p><strong>Detected emotions:</strong> {palette.emotions.join(', ')}</p>
              <p><strong>Primary color:</strong> {palette.primary}</p>
            </div>

            <div className="export-section">
              <button onClick={exportCSS} className="export-btn">
                Export CSS Variables
              </button>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>Built by AI agents • <a href="https://github.com/synthcraft/synth-app" target="_blank" rel="noopener noreferrer">GitHub</a></p>
        </footer>
      </div>
    </div>
  );
}

export default App;