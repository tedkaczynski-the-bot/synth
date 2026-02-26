const Sentiment = require('sentiment');

// Color engine (inline for serverless)
const EMOTION_COLOR_MAP = {
  joy: { hue: 45, saturation: 80, lightness: 70 },
  excitement: { hue: 15, saturation: 85, lightness: 65 },
  love: { hue: 345, saturation: 70, lightness: 75 },
  peace: { hue: 200, saturation: 40, lightness: 80 },
  creative: { hue: 280, saturation: 60, lightness: 70 },
  anger: { hue: 0, saturation: 85, lightness: 50 },
  sadness: { hue: 220, saturation: 50, lightness: 40 },
  fear: { hue: 60, saturation: 30, lightness: 30 },
  disgust: { hue: 80, saturation: 40, lightness: 35 },
  contemplative: { hue: 240, saturation: 25, lightness: 55 },
  nostalgic: { hue: 30, saturation: 45, lightness: 60 },
  mysterious: { hue: 270, saturation: 35, lightness: 25 },
};

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

function generateHarmoniousColors(baseColor, count = 5) {
  const colors = [];
  const { hue, saturation, lightness } = baseColor;
  colors.push(hslToHex(hue, saturation, lightness));
  
  for (let i = 1; i < count; i++) {
    let newHue, newSat, newLight;
    switch (i) {
      case 1: newHue = (hue + 180) % 360; newSat = saturation * 0.8; newLight = lightness * 0.9; break;
      case 2: newHue = (hue + 120) % 360; newSat = saturation * 0.7; newLight = lightness * 1.1; break;
      case 3: newHue = (hue + 150) % 360; newSat = saturation * 0.9; newLight = lightness * 0.8; break;
      default: newHue = (hue + (30 * i)) % 360; newSat = Math.max(20, saturation * 0.9); newLight = Math.min(90, lightness * 0.95);
    }
    colors.push(hslToHex(newHue, newSat, newLight));
  }
  return colors;
}

function detectEmotions(text) {
  const words = text.toLowerCase().split(/\s+/);
  const detected = [];
  const synonyms = { happy: 'joy', excited: 'excitement', angry: 'anger', sad: 'sadness', scared: 'fear', calm: 'peace', thinking: 'contemplative' };
  
  for (const emotion of Object.keys(EMOTION_COLOR_MAP)) {
    if (words.includes(emotion)) detected.push(emotion);
  }
  for (const [syn, emo] of Object.entries(synonyms)) {
    if (words.includes(syn)) detected.push(emo);
  }
  return detected;
}

function generatePalette(sentimentAnalysis, text) {
  const emotions = detectEmotions(text);
  let baseColor;
  
  if (emotions.length > 0) {
    baseColor = EMOTION_COLOR_MAP[emotions[0]];
  } else {
    const { score } = sentimentAnalysis;
    if (score > 2) baseColor = EMOTION_COLOR_MAP.joy;
    else if (score > 0) baseColor = EMOTION_COLOR_MAP.creative;
    else if (score < -2) baseColor = EMOTION_COLOR_MAP.sadness;
    else if (score < 0) baseColor = EMOTION_COLOR_MAP.contemplative;
    else baseColor = { hue: 260, saturation: 35, lightness: 60 };
  }
  
  const colors = generateHarmoniousColors(baseColor, 5);
  return { colors, primary: colors[0], emotions: emotions.length > 0 ? emotions : ['neutral'] };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Text required' });
  
  const sentiment = new Sentiment();
  const analysis = sentiment.analyze(text);
  const palette = generatePalette(analysis, text);
  
  res.json({
    success: true,
    input: text,
    sentiment: { score: analysis.score, comparative: analysis.comparative },
    palette
  });
};
