export default async function handler(req, res) {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key missing" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: topic }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔥 RETURN FULL ERROR IF ANY
    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API error",
        details: data
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "No text returned",
        raw: data
      });
    }

    res.status(200).json({ result: text });

  } catch (err) {
    res.status(500).json({
      error: "Server crash",
      message: err.message
    });
  }
}
