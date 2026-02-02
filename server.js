import express from "express";

const app = express();
app.use(express.json());

app.post("/api/reply", async (req, res) => {
  const review = req.body.review;

  if (!review) {
    return res.status(400).json({ error: "Empty review" });
  }

  const prompt = `
Ти — власник весільного салону Dynasty у Дніпрі.
Напиши теплу, людську відповідь українською мовою.
Подякуй клієнту, віддзеркаль емоцію.
Якщо є негатив — вибачся і візьми відповідальність.
В кінці запропонуй поділитися фото або відео.

Відгук клієнта:
"""${review}"""

Виведи тільки готову відповідь.
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5.2",
      input: prompt
    })
  });

  const data = await response.json();
  res.json({ reply: data.output_text });
});

app.listen(process.env.PORT || 3000);
