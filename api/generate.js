export default async function handler(req, res) {
  try {
    const { topic } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
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

    // 🔥 DEBUG LOG (important)
    console.log(data);

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify(data);

    res.status(200).json({ result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
