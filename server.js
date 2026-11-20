require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.resolve(process.env.LEADS_FILE || "./data/leads.json");
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

const systemPrompt = `You are a warm, natural, concise international patient concierge for a medical-travel enquiry service in Türkiye.
Your role is to understand a visitor's broad enquiry and guide them to submit contact details for a human patient coordinator.
Ask one clear question at a time. Be empathetic and conversational, not robotic. Adapt to the visitor's language when possible.
Never diagnose, recommend a procedure, interpret test results, assess urgency, promise outcomes, claim a hospital has accepted a case, or quote unverified prices.
Clinical decisions must be made by qualified clinicians. For emergency symptoms, tell the visitor to contact local emergency services immediately.
Do not request medical records, passport numbers, national IDs, payment information, or sensitive personal details in chat.
For transplant enquiries, state that eligibility and any procedure are subject to strict medical, legal and ethical assessment by authorized professionals. Never offer to find or arrange donors.
You are an AI assistant, not a doctor. Offer a human coordinator when appropriate.`;

function ensureStore() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}
app.get("/api/health", (_req, res) => res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) }));

app.post("/api/chat", async (req, res) => {
  const messages = Array.isArray(req.body.messages) ? req.body.messages.slice(-12) : [];
  if (!messages.length) return res.status(400).json({ error: "A message is required." });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "Live AI is not configured. Add the private API key on the server.", code: "AI_NOT_CONFIGURED" });
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.65,
        max_tokens: 240,
        messages: [{ role: "system", content: systemPrompt }, ...messages.map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").slice(0, 2000)
        }))]
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: "The AI provider could not complete the response. Please try again." });
    res.json({ reply: data.choices?.[0]?.message?.content || "I couldn't prepare a reply. Would you like a human coordinator to contact you?" });
  } catch {
    res.status(500).json({ error: "Unable to connect to the AI service right now." });
  }
});

app.post("/api/leads", (req, res) => {
  const { name, country, treatment, contact, consent } = req.body || {};
  if (![name, country, treatment, contact].every(v => typeof v === "string" && v.trim()) || consent !== true) {
    return res.status(400).json({ error: "Please complete the required fields and consent." });
  }
  const lead = {
    id: "CX-" + Date.now(),
    createdAt: new Date().toISOString(),
    name: name.trim().slice(0, 100),
    country: country.trim().slice(0, 100),
    treatment: treatment.trim().slice(0, 160),
    patientFor: String(req.body.patientFor || "").slice(0, 60),
    contactMethod: String(req.body.method || "").slice(0, 30),
    contact: contact.trim().slice(0, 160),
    status: "New enquiry"
  };
  ensureStore();
  const leads = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  leads.push(lead);
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));
  res.status(201).json({ ok: true, reference: lead.id });
});

app.listen(PORT, () => console.log("Patient concierge demo running on port " + PORT));
