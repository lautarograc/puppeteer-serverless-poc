const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")


function retrieveOTP(email) {
  const url = `http://app.resuma.co:3000/keys/${email}`;

  const retryRequest = () => {
    setTimeout(() => {
      sendRequest();
    }, 5000);
  };

  const handleResponse = (response) => {
    const { key, value } = response.data;

    if (value !== null && key === email) {
      const otp = value;
      console.log('OTP:', otp);
      // Store the OTP or perform any other required action here
    } else {
      retryRequest();
    }
  };

  const sendRequest = () => {
    axios.get(url)
      .then(handleResponse)
      .catch(retryRequest);
  };

  sendRequest();
}

exports.handler = async (t) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  await page.goto("https://www2.firstdata.com.ar/comercios/");
  await page.setViewport({ width: 1280, height: 800 });
  let emailInputSelector = "#username"
  let passwordInputSelector = "#password"
  console.log("emailInputSelector", emailInputSelector, "passwordInputSelector", passwordInputSelector)
  await page.waitForSelector(emailInputSelector);
  let email = "SHELLCOSSAN@FISERV.MADE2.CO"
  await page.type(emailInputSelector, email);

  await page.waitForSelector(passwordInputSelector);
  // password is a env variable
  await page.type(passwordInputSelector, process.env.PASSWORD);

  let clickSelector = "#sendLogin"

  await console.log("before clickSelector")
  await page.waitForSelector(clickSelector);
  // await page.screenshot({ path: 'step1.png' });
  await page.click(clickSelector);
  await console.log("after clickSelector")
  // await page.screenshot({ path: 'step1-5.png' });
  await page.waitForNavigation();
  // await page.screenshot({ path: 'step2.png' });
  const otpInputSelector = "#passwordOtp"
  await page.waitForSelector(otpInputSelector);

  let otp = await retrieveOTP(email);

  console.log("otp", otp)

  await page.type(otpInputSelector, otp);

  // await page.screenshot({ path: 'step3.png' });
  const acceptSelector = "#sendLoginOtp"

  await page.waitForSelector(acceptSelector);
  await page.click(acceptSelector);

  await page.waitForNavigation();

  // await page.screenshot({ path: 'step4.png' });

  const title = await page.title();

  await browser.close();
  return title;

};
