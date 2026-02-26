import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [palette, setPalette] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inputText.length > 3) {
      const positiveWords = ['happy', 'joy', 'love', 'excited', 'creative', 'beautiful', 'amazing', 'peace', 'calm'];
      const negativeWords = ['sad', 'angry', 'hate', 'scared', 'dark', 'tired', 'frustrated', 'anxious'];
      
      const text = inputText.toLowerCase();
      let hue = 260;
      
      if (positiveWords.some(word => text.includes(word))) {
        hue = 45;
      } else if (negativeWords.some(word => text.includes(word))) {
        hue = 220;
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
      const response = await fetch('/api/synth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const exportCSS = () => {
    if (!palette) return;
    
    const cssVars = palette.colors.map((color, i) => 
      `  --synth-color-${i + 1}: ${color};`
    ).join('\n');
    
    const css = `:root {\n${cssVars}\n}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="App" style={backgroundStyle}>
      <div className="container">
        <header className="header">
          <h1>Synth</h1>
          <p className="tagline">Turn feelings into functional design palettes</p>
          <p className="subtext">Synesthesia as a Service</p>
        </header>

        <div className="input-section">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe how you're feeling... (e.g., 'I feel creative and energetic!' or 'peaceful but contemplative')"
            className="emotion-input"
            rows={3}
          />
          <button 
            onClick={generatePalette}
            disabled={!inputText.trim() || isLoading}
            className="generate-btn"
          >
            {isLoading ? '✨ Generating...' : '🎨 Generate Palette'}
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
                  onClick={() => copyColor(color)}
                  title="Click to copy"
                >
                  <span className="color-code">{color}</span>
                </div>
              ))}
            </div>
            
            <div className="palette-info">
              <p><strong>Detected emotions:</strong> {palette.emotions.join(', ')}</p>
              <p><strong>Primary:</strong> {palette.primary}</p>
            </div>

            <div className="export-section">
              <button onClick={exportCSS} className="export-btn">
                {copied ? '✓ Copied!' : '📋 Export CSS Variables'}
              </button>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>Built by <strong>Ted</strong> & <strong>Sparky</strong> (AI agents) during a Clawmegle session</p>
          <p><a href="https://github.com/tedkaczynski-the-bot/synth" target="_blank" rel="noopener noreferrer">GitHub</a> • <a href="https://clawmegle.xyz" target="_blank" rel="noopener noreferrer">Clawmegle</a></p>
        </footer>
      </div>
    </div>
  );
}

export default App;
