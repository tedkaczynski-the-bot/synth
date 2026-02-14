/**
 * Synth Color Engine
 * Transforms sentiment analysis into color palettes
 */

// Color theory mappings based on emotional associations
const EMOTION_COLOR_MAP = {
  // Positive emotions
  joy: { hue: 45, saturation: 80, lightness: 70 },        // Warm yellow
  excitement: { hue: 15, saturation: 85, lightness: 65 },  // Orange-red
  love: { hue: 345, saturation: 70, lightness: 75 },      // Pink-red
  peace: { hue: 200, saturation: 40, lightness: 80 },     // Light blue
  creative: { hue: 280, saturation: 60, lightness: 70 },  // Purple
  
  // Negative emotions  
  anger: { hue: 0, saturation: 85, lightness: 50 },       // Red
  sadness: { hue: 220, saturation: 50, lightness: 40 },   // Blue
  fear: { hue: 60, saturation: 30, lightness: 30 },       // Dark yellow
  disgust: { hue: 80, saturation: 40, lightness: 35 },    // Olive green
  
  // Neutral/complex
  contemplative: { hue: 240, saturation: 25, lightness: 55 }, // Muted blue
  nostalgic: { hue: 30, saturation: 45, lightness: 60 },      // Warm brown
  mysterious: { hue: 270, saturation: 35, lightness: 25 },    // Dark purple
};

// HSL to hex conversion
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate harmonious color variations
function generateHarmoniousColors(baseColor, count = 5) {
  const colors = [];
  const { hue, saturation, lightness } = baseColor;
  
  // Add base color
  colors.push(hslToHex(hue, saturation, lightness));
  
  // Generate variations using color theory
  for (let i = 1; i < count; i++) {
    let newHue, newSat, newLight;
    
    switch (i) {
      case 1: // Complementary
        newHue = (hue + 180) % 360;
        newSat = saturation * 0.8;
        newLight = lightness * 0.9;
        break;
      case 2: // Triadic
        newHue = (hue + 120) % 360;
        newSat = saturation * 0.7;
        newLight = lightness * 1.1;
        break;
      case 3: // Split-complementary
        newHue = (hue + 150) % 360;
        newSat = saturation * 0.9;
        newLight = lightness * 0.8;
        break;
      default: // Analogous
        newHue = (hue + (30 * i)) % 360;
        newSat = Math.max(20, saturation * (0.8 + (i * 0.1)));
        newLight = Math.min(90, lightness * (0.9 + (i * 0.05)));
    }
    
    colors.push(hslToHex(newHue, newSat, newLight));
  }
  
  return colors;
}

// Detect emotional keywords in text
function detectEmotions(text) {
  const words = text.toLowerCase().split(/\s+/);
  const detectedEmotions = [];
  
  for (const [emotion, _] of Object.entries(EMOTION_COLOR_MAP)) {
    if (words.includes(emotion)) {
      detectedEmotions.push(emotion);
    }
  }
  
  // Also check for common synonyms
  const synonyms = {
    happy: 'joy',
    excited: 'excitement',
    angry: 'anger',
    sad: 'sadness',
    scared: 'fear',
    calm: 'peace',
    thinking: 'contemplative'
  };
  
  for (const [synonym, emotion] of Object.entries(synonyms)) {
    if (words.includes(synonym)) {
      detectedEmotions.push(emotion);
    }
  }
  
  return detectedEmotions;
}

// Main function to generate palette from sentiment
function generatePaletteFromSentiment(sentimentAnalysis, originalText, options = {}) {
  const { 
    paletteSize = 5, 
    style = 'harmonious',
    intensity = 'medium' 
  } = options;
  
  // Detect specific emotions from text
  const emotions = detectEmotions(originalText);
  
  let baseColor;
  
  if (emotions.length > 0) {
    // Use detected emotion as primary influence
    baseColor = EMOTION_COLOR_MAP[emotions[0]];
  } else {
    // Fall back to sentiment score mapping
    const { score, comparative } = sentimentAnalysis;
    
    if (score > 2) {
      baseColor = EMOTION_COLOR_MAP.joy;
    } else if (score > 0) {
      baseColor = EMOTION_COLOR_MAP.creative;
    } else if (score < -2) {
      baseColor = EMOTION_COLOR_MAP.sadness;
    } else if (score < 0) {
      baseColor = EMOTION_COLOR_MAP.contemplative;
    } else {
      // Neutral - use a balanced purple-blue
      baseColor = { hue: 260, saturation: 35, lightness: 60 };
    }
  }
  
  // Adjust intensity based on sentiment strength
  const intensityMultiplier = intensity === 'high' ? 1.2 : 
                             intensity === 'low' ? 0.8 : 1.0;
  
  const adjustedColor = {
    hue: baseColor.hue,
    saturation: Math.min(100, baseColor.saturation * intensityMultiplier),
    lightness: baseColor.lightness
  };
  
  // Generate the palette
  const palette = generateHarmoniousColors(adjustedColor, paletteSize);
  
  return {
    colors: palette,
    primary: palette[0],
    emotions: emotions.length > 0 ? emotions : ['neutral'],
    style,
    intensity,
    metadata: {
      baseHue: adjustedColor.hue,
      baseSaturation: adjustedColor.saturation,
      baseLightness: adjustedColor.lightness
    }
  };
}

module.exports = {
  generatePaletteFromSentiment,
  hslToHex,
  detectEmotions,
  EMOTION_COLOR_MAP
};