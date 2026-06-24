import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const qaDir = path.join(root, ".qa");
const edgePath =
  process.env.PLAYWRIGHT_EDGE_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = Number(process.env.UI_QA_PORT ?? 3100);
const baseUrl = `http://127.0.0.1:${port}`;

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 }
];

const pages = [
  { name: "home-intro", path: "/" },
  { name: "home", path: "/", enterIntro: true },
  { name: "admin", path: "/admin" },
  { name: "login", path: "/admin/login" }
];

await fs.mkdir(qaDir, { recursive: true });

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const server = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  }
);

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

try {
  await waitForServer(baseUrl);
  const report = await runBrowserQa();
  await fs.writeFile(
    path.join(qaDir, "browser-qa.json"),
    `${JSON.stringify(report, null, 2)}\n`
  );

  const failures = collectFailures(report);
  if (failures.length > 0) {
    console.error("UI QA failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log("UI QA passed.");
  }

  console.log(JSON.stringify(report.summary, null, 2));
} finally {
  server.kill();
}

async function waitForServer(url) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60_000) {
    if (server.exitCode !== null) {
      throw new Error(`Next server exited early.\n${serverOutput}`);
    }

    try {
      const response = await fetch(url);
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // Keep polling until Next is ready.
    }

    await delay(1000);
  }

  throw new Error(`Next server did not become ready.\n${serverOutput}`);
}

async function runBrowserQa() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: edgePath
  });

  const checks = [];
  try {
    for (const pageSpec of pages) {
      for (const viewport of viewports) {
        checks.push(await checkPage(browser, pageSpec, viewport));
      }
    }
  } finally {
    await browser.close();
  }

  return {
    baseUrl,
    generatedAt: new Date().toISOString(),
    checks,
    summary: summarize(checks)
  };
}

async function checkPage(browser, pageSpec, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleMessages = [];
  const pageErrors = [];
  const badResponses = [];

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleMessages.push({
        type: message.type(),
        text: message.text()
      });
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      badResponses.push({
        status: response.status(),
        url: response.url()
      });
    }
  });

  await page.goto(`${baseUrl}${pageSpec.path}`, {
    waitUntil: "networkidle",
    timeout: 45_000
  });

  if (pageSpec.enterIntro) {
    await page.getByTestId("intro-start").click();
    await page.waitForSelector(".intro-screen", { state: "detached", timeout: 10_000 });
  }

  const layout = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const viewportWidth = doc.clientWidth;
    const viewportHeight = doc.clientHeight;
    const interactiveSelector =
      "a[href], button, input, textarea, select, [role='button'], [tabindex]:not([tabindex='-1'])";

    const horizontalScroll =
      Math.max(doc.scrollWidth, body.scrollWidth) > viewportWidth + 2;

    const overflowingElements = [...document.querySelectorAll("body *")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const className = String(element.className || "");
        const text = (element.textContent || "").replace(/\s+/g, " ").trim();
        const decorative =
          className.includes("nebula-art") ||
          className.includes("star-grid") ||
          className.includes("scanlines") ||
          className.includes("desktop-signal");
        const hiddenOverflow =
          style.overflowX === "hidden" || style.overflow === "hidden";
        const positioned =
          style.position === "absolute" || style.position === "fixed";

        return {
          tag: element.tagName,
          className,
          text: text.slice(0, 90),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          decorative,
          hiddenOverflow,
          positioned
        };
      })
      .filter((item) => {
        if (item.decorative || item.hiddenOverflow || item.positioned) return false;
        return (
          item.right > viewportWidth + 2 ||
          item.left < -2 ||
          item.scrollWidth > item.clientWidth + 4
        );
      })
      .slice(0, 20);

    const clippedControls = [...document.querySelectorAll(interactiveSelector)]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const text = (element.textContent || element.getAttribute("aria-label") || "")
          .replace(/\s+/g, " ")
          .trim();
        return {
          tag: element.tagName,
          className: String(element.className || ""),
          text: text.slice(0, 90),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      })
      .filter((item) => {
        if (item.width === 0 || item.height === 0) return false;
        return item.left < -2 || item.right > viewportWidth + 2 || item.top < -2;
      })
      .slice(0, 20);

    const overlaps = findOverlaps(interactiveSelector);

    return {
      viewportWidth,
      viewportHeight,
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      horizontalScroll,
      overflowingElements,
      clippedControls,
      overlaps
    };

    function findOverlaps(selector) {
      const controls = [...document.querySelectorAll(selector)]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            label: (
              element.textContent ||
              element.getAttribute("aria-label") ||
              element.getAttribute("name") ||
              element.tagName
            )
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 60),
            rect,
            pointerEvents: style.pointerEvents
          };
        })
        .filter(
          (item) =>
            item.pointerEvents !== "none" &&
            item.rect.width > 0 &&
            item.rect.height > 0
        );

      const found = [];
      for (let i = 0; i < controls.length; i += 1) {
        for (let j = i + 1; j < controls.length; j += 1) {
          const a = controls[i];
          const b = controls[j];
          const left = Math.max(a.rect.left, b.rect.left);
          const right = Math.min(a.rect.right, b.rect.right);
          const top = Math.max(a.rect.top, b.rect.top);
          const bottom = Math.min(a.rect.bottom, b.rect.bottom);
          const width = right - left;
          const height = bottom - top;
          if (width <= 2 || height <= 2) continue;

          const overlapArea = width * height;
          const minArea = Math.min(
            a.rect.width * a.rect.height,
            b.rect.width * b.rect.height
          );
          if (overlapArea / minArea > 0.2) {
            found.push({
              a: a.label,
              b: b.label,
              areaRatio: Number((overlapArea / minArea).toFixed(2))
            });
          }
        }
      }
      return found.slice(0, 12);
    }
  });

  const screenshotName = `${pageSpec.name}-${viewport.name}.png`;
  const screenshotPath = path.join(qaDir, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.close();

  return {
    page: pageSpec.name,
    path: pageSpec.path,
    viewport,
    screenshotPath,
    consoleMessages,
    pageErrors,
    badResponses,
    layout
  };
}

function summarize(checks) {
  return checks.map((check) => ({
    page: check.page,
    viewport: check.viewport.name,
    screenshot: path.relative(root, check.screenshotPath),
    console: check.consoleMessages.length,
    pageErrors: check.pageErrors.length,
    badResponses: check.badResponses.length,
    horizontalScroll: check.layout.horizontalScroll,
    overflowingElements: check.layout.overflowingElements.length,
    clippedControls: check.layout.clippedControls.length,
    overlaps: check.layout.overlaps.length
  }));
}

function collectFailures(report) {
  const failures = [];
  for (const check of report.checks) {
    const label = `${check.page}/${check.viewport.name}`;
    if (check.consoleMessages.length > 0) {
      failures.push(`${label}: console warnings/errors`);
    }
    if (check.pageErrors.length > 0) {
      failures.push(`${label}: page errors`);
    }
    if (check.badResponses.length > 0) {
      failures.push(`${label}: ${check.badResponses.length} 4xx/5xx responses`);
    }
    if (check.layout.horizontalScroll) {
      failures.push(`${label}: horizontal page scroll`);
    }
    if (check.layout.overflowingElements.length > 0) {
      failures.push(`${label}: visible element overflow`);
    }
    if (check.layout.clippedControls.length > 0) {
      failures.push(`${label}: clipped interactive controls`);
    }
    if (check.layout.overlaps.length > 0) {
      failures.push(`${label}: overlapping interactive controls`);
    }
  }
  return failures;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
