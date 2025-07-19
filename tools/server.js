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

  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: "URL inválida. Debe empezar por http:// o https://" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    console.log("🌐 Analizando:", url);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 }); // 60 segundos
    } catch (navErr) {
      console.error("⚠️ Error al navegar a la URL:", navErr.message);
      return res.status(500).json({ error: "No se pudo cargar la página (timeout o error de navegación)." });
    }

    await page.addScriptTag({ content: axeCore.source });

    const results = await page.evaluate(async () => await window.axe.run());
    res.json(results);
  } catch (err) {
    console.error("❌ Error general:", err.message);
    res.status(500).json({ error: "Error interno analizando la página", details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Axe server running on port ${PORT}`);
});
