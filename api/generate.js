export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { topic } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
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

    const textRaw = await response.text();

    // 🔥 prevent JSON crash
    let data;
    try {
      data = JSON.parse(textRaw);
    } catch {
      return res.status(500).json({
        error: "Non-JSON response",
        raw: textRaw
      });
    }

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    let text = "No response";

    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content.parts;
      text = parts.map(p => p.text).join(" ");
    }

    res.status(200).json({ result: text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
