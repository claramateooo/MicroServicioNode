// analyze.js
import puppeteer from "puppeteer";
import axeCore from "axe-core";

const urlToTest = process.argv[2]; // lo pasas como argumento

if (!urlToTest) {
  console.error("⚠️ Por favor, pasa una URL: node analyze.js https://ejemplo.com");
  process.exit(1);
}

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.goto(urlToTest, { waitUntil: "networkidle2" });

await page.addScriptTag({ content: axeCore.source });
const results = await page.evaluate(async () => {
  return await window.axe.run();
});

console.log(JSON.stringify(results, null, 2));
await browser.close();
