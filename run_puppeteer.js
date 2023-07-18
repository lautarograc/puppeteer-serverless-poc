const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")

exports.handler = async (t) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto("https://es.wikipedia.org/wiki/Club_Atl%C3%A9tico_V%C3%A9lez_Sarsfield");
  const pageTitle = await page.title(); {
    const selector = '#mw-content-text > div.mw-parser-output > p:nth-child(4)'
    const text = await page.evaluate((selector) => {
      return document.querySelector(selector).textContent
    }, selector)
    await browser.close();

    return { statusCode: 200, body: JSON.stringify({ pageTitle, text }) }
  }
}
