import puppeteer from "puppeteer";

const urlToTest = process.argv[2];
if (!urlToTest) {
  console.error("⚠️ Por favor, pasa una URL: node accesibilidad.js https://ejemplo.com");
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.goto(urlToTest, { waitUntil: "networkidle2", timeout: 60000 }); // timeout aumentado

const snapshot = await page.accessibility.snapshot();
console.log(JSON.stringify(snapshot, null, 2));

await browser.close();
