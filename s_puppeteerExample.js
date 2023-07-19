
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'lautarogra',
  applicationName: 'puppeteer',
  appUid: 'mqlwLzZr9qPlRktZPY',
  orgUid: '0dc75ac4-804a-4971-8aac-0a24a67cc443',
  deploymentUid: 'd153b882-22df-4397-b2b5-011aa87e5627',
  serviceName: 'aws-lambda-puppeteer-serverless',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'dev',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '6.2.3',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'aws-lambda-puppeteer-serverless-dev-puppeteerExample', timeout: 40 };

try {
  const userHandler = require('./run_puppeteer.js');
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}