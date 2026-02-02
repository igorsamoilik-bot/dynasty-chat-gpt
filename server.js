import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ГОЛОВНА СТОРІНКА (для iframe)
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8" />
<title>Відповідь на відгук — Dynasty</title>
<style>
body { font-family: Arial, sans-serif; padding: 20px; }
textarea { width:100%; height:120px; margin-bottom:10px; }
button { padding:10px 20px; font-size:16px; }
</style>
</head>
<body>

<h2>Встав відгук клієнта</h2>
<textarea id="input"></textarea>
<button onclick="send()">Згенерувати відповідь</button>

<h2>Готова відповідь від Dynasty</h2>
<textarea id="output"></textarea>

<script>
async function send() {
  const text = document.getElementById("input").value;
  const res = await fetch("/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  document.getElementById("output").value = data.answer || "Помилка";
}
</script>

</body>
</html>
`);
});

// API
app.post("/reply", async (req, res) => {
  try {
    const { text } = req.body;

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
            content: "Ти власник весільного салону Dynasty. Відповідай тепло, щиро, українською, без AI-стилю."
          },
          { role: "user", content: text }
        ]
      })
    });

    const json = await response.json();
    res.json({ answer: json.choices[0].message.content });

  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log("Server running"));
