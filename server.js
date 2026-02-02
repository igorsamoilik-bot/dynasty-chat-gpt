import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors()); // <<< ВАЖЛИВО
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// тест – перевірка що сервер живий
app.get("/", (req, res) => {
  res.send("Dynasty ChatGPT server is running");
});

// основний endpoint
app.post("/reply", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ти власник весільного салону Dynasty. Відповідай тепло, щиро, по-людськи, без канцеляризму. Наприкінці попроси фото або відео з події."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.6
      })
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Не вдалося згенерувати відповідь";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
