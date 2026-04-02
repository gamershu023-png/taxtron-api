export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sarvam-1",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // Handle API error
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Sarvam API error"
      });
    }

    // Send clean response
    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
