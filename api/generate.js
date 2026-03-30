export default async function handler(req, res) {

  // 🔥 CORS (important for Blogger)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key missing" });
    }

    // 🔥 Gemini API call
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
              role: "user",
              parts: [{ text: topic }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔥 If Gemini gives error
    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API error",
        details: data
      });
    }

    // 🔥 SAFE PARSING
    let text = "No response";

    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content.parts;
      text = parts.map(p => p.text).join(" ");
    }

    // 🔥 fallback debug
    if (!text || text === "No response") {
      text = JSON.stringify(data);
    }

    // ✅ final response
    res.status(200).json({ result: text });

  } catch (err) {
    res.status(500).json({
      error: "Server crash",
      message: err.message
    });
  }
}
