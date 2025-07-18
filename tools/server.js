// tools/server.js
import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import axeCore from "axe-core";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => await window.axe.run());

    await browser.close();
    res.json(results);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Error analyzing URL", details: err.message });
  }
});

app.listen(3000, () => {
  console.log("🔎 Axe server running at http://localhost:3000");
});
