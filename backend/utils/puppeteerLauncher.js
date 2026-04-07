const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_VERSION) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);

const launchBrowser = async () => {
  if (isServerless) {
    // Serverless-friendly Chromium
    // eslint-disable-next-line global-require
    const chromium = require("@sparticuz/chromium");
    // eslint-disable-next-line global-require
    const puppeteer = require("puppeteer-core");

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  // Local/dev: prefer full puppeteer if available, otherwise puppeteer-core with an explicit path.
  try {
    // eslint-disable-next-line global-require
    const puppeteer = require("puppeteer");
    return puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });
  } catch {
    // eslint-disable-next-line global-require
    const puppeteer = require("puppeteer-core");
    const executablePath = process.env.CHROME_EXECUTABLE_PATH;
    if (!executablePath) {
      throw new Error(
        "Missing CHROME_EXECUTABLE_PATH for local PDF generation (puppeteer not installed)."
      );
    }
    return puppeteer.launch({
      headless: "new",
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
};

module.exports = {
  launchBrowser,
};

