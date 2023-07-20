const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")
const axios = require('axios');


exports.handler = async (t) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  try {
    await page.goto('https://www2.firstdata.com.ar/comercios/');
    await page.setViewport({ width: 1280, height: 800 });
    const email = 'SHELLCOSSAN@FISERV.MADE2.CO';
    const password = 'R3suma.FD';


    await page.waitForSelector('#username');
    await page.type('#username', email);

    await page.waitForSelector('#password');
    await page.type('#password', password);

    await page.waitForSelector('#sendLogin');
    await page.click('#sendLogin');

    const url = page.url();

    if (url === 'https://www.fiserv.com.ar/?error=session-exceeded&session-expired=10') {
      console.log('Session expired');
      await browser.close();
      return;
    }

    await page.waitForSelector('#passwordOtp');
    await sleep(10000); // Wait for 10 seconds before retrieving OTP
    otp = await retrieveOTP(email);

    if (!otp) {
      console.log('OTP is null or undefined');
      await browser.close();
      return;
    }

    console.log('OTP', otp);
    await page.type('#passwordOtp', otp);
    await page.waitForSelector('#sendLoginOtp');
    await page.click('#sendLoginOtp').then(() => page.waitForNavigation({ waitUntil: 'load' }));

    if (url === 'https://www.fiserv.com.ar/?error=session-exceeded&session-expired=10') {
      console.log('Session expired');
      await browser.close();
      return;
    }
    // Wait for 10 seconds to ensure the page is fully loaded
    await sleep(10000);
    const menuSelector = 'body > div.main-container > ng-include > header > md-toolbar > div > div.user-section-styles > div.user-menu-styles > md-menu > button';
    await page.waitForSelector(menuSelector);
    const menuElement = await page.$(menuSelector);
    await menuElement.click();

    const logOutSelector = '#menu_container_1 > md-menu-content > md-menu-item:nth-child(5) > a';
    await page.waitForSelector(logOutSelector);
    const logOutElement = await page.$(logOutSelector);
    await logOutElement.click();
  } catch (error) {
    console.error('Error during login:', error);
  } finally {
    await browser.close();
  }

  return {
    success: true,
    message: 'Journey successful',
    user: email,
    timestamp: new Date().toISOString()
  };
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retrieveOTP(email) {
  let otp;
  return new Promise((resolve, reject) => {
    const url = `http://app.resuma.co:3000/keys/${email}`;

    const retryRequest = () => {
      setTimeout(() => {
        sendRequest();
      }, 5000);
    };

    const handleResponse = (response) => {
      const { key, value } = response.data;

      if (value !== null && key === email) {
        otp = value; // Assign the OTP value to the otp variable
        resolve(otp); // Resolve the promise with the OTP value
      } else {
        retryRequest();
      }
    };

    const sendRequest = () => {
      axios
        .get(url)
        .then(handleResponse)
        .catch(retryRequest);
    };

    sendRequest();
  });
}
