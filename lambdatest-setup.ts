import * as base from "@playwright/test";
import path from "path";
import { chromium } from "playwright";
import * as dotenv from "dotenv";

dotenv.config();

const capabilities = {
  browserName: "Chrome",
  browserVersion: "latest",
  "LT:Options": {
    platform: "Windows 10",
    build: "Playwright TS Build",
    name: "Playwright Test",
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
    tunnel: false,
    tunnelName: "",
    geoLocation: "",
  },
};

const modifyCapabilities = (configName: string, testName: string) => {
  const config = configName.split("@lambdatest")[0];
  let [browserName, browserVersion, platform] = config.split(":");
  capabilities.browserName = browserName
    ? browserName
    : capabilities.browserName;
  capabilities.browserVersion = browserVersion
    ? browserVersion
    : capabilities.browserVersion;
  capabilities["LT:Options"].platform = platform
    ? platform
    : capabilities["LT:Options"].platform;
  capabilities["LT:Options"].name = testName;
};

const test = base.test.extend({
  page: async ({ page }, use, testInfo) => {
    const fileName = testInfo.file.split(path.sep).pop();
    if (testInfo.project.name.match(/lambdatest/)) {
      modifyCapabilities(
        testInfo.project.name,
        `${testInfo.title} - ${fileName}`
      );

      const browser = await chromium.connect({
        wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
          JSON.stringify(capabilities)
        )}`,
      });

      const ltPage = await browser.newPage(testInfo.project.use);
      await use(ltPage);

      const testStatus = {
        action: "setTestStatus",
        arguments: {
          status: testInfo.status,
          remark: testInfo.error?.stack || testInfo.error?.message,
        },
      };
      await ltPage.evaluate(() => {},
      `lambdatest_action: ${JSON.stringify(testStatus)}`);
      await ltPage.close();
      await browser.close();
      return;
    }

    await use(page);
  },
});

export default test;