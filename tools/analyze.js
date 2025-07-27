import puppeteer from "puppeteer";
import axeCore from "axe-core";

const urlToTest = process.argv[2];
if (!urlToTest) {
  console.error("⚠️ Por favor, pasa una URL: node analyze.js https://ejemplo.com");
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.goto(urlToTest, { waitUntil: "networkidle2", timeout: 60000 }); // timeout aumentado
await page.addScriptTag({ content: axeCore.source });

const results = await page.evaluate(() => window.axe.run());
console.log(JSON.stringify(results, null, 2));

await browser.close();
