import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* ===== ГОЛОВНА СТОРІНКА ===== */
app.get("/", (req, res) => {
  res.send(`
    <h2>Dynasty ChatGPT працює ✅</h2>
    <p>Використовуй POST /reply</p>
  `);
});

/* ===== ОСНОВНИЙ API ===== */
app.post("/reply", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Немає тексту відгуку" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Ти власник весільного салону Dynasty. Пиши теплу, ввічливу відповідь клієнту українською, коротко і щиро.",
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    res.json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Dynasty ChatGPT server running on port", PORT);
});
