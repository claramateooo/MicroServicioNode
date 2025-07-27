import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import axeCore from "axe-core";

const app = express();
app.use(cors());
app.use(express.json());

let running = 0;
const MAX_RUNNING = 1; // Solo un análisis concurrente

app.post("/full-analysis", async (req, res) => {
  if (running >= MAX_RUNNING) {
    return res.status(429).json({ error: "Servidor ocupado, inténtalo en unos segundos." });
  }
  running++;

  let browser;
  try {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: "URL inválida. Debe empezar por http:// o https://" });
    }

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 }); // timeout aumentado a 60s

    const snapshot = await page.accessibility.snapshot();

    await page.addScriptTag({ content: axeCore.source });

    const axePromise = page.evaluate(() => window.axe.run());

    const axeResults = await Promise.race([
      axePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Axe timeout")), 60000)), // timeout de 1 minuto
    ]);

    res.json({ snapshot, axeResults });
  } catch (err) {
    res.status(500).json({
      error: "Error durante el análisis",
      details: err.message,
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("Error cerrando el navegador:", e.message);
      }
    }
    running--;
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Servidor unificado escuchando en http://localhost:${PORT}`);
});
