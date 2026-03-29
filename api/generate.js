export default async function handler(req, res) {

  // 🔥 ADD CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { topic, level } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a JEE question generator."
          },
          {
            role: "user",
            content: `Generate 5 ${level || ""} level JEE questions on ${topic} with answers.`
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
