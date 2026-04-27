export default async function handler(req, res) {
    // מוודאים שרק האפליקציה שלנו פונה לכאן
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
    try {
      const { prompt } = req.body;
      // המפתח הסודי שלך שנשמור בשרת של Vercel
      const apiKey = process.env.GEMINI_API_KEY; 
  
      // הפנייה לשרתים של גוגל
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
  
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
  
      // החזרת התשובה לאפליקציה שלנו
      res.status(200).json({ text });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }