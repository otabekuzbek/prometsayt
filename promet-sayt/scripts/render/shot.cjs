const { chromium } = require("playwright");
(async () => {
  const [,, url, out, w, h, full] = process.argv;
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  if (process.env.FORCE3D) await p.addInitScript(() => { Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 }); Object.defineProperty(navigator, "deviceMemory", { get: () => 8 }); });
  p.on("pageerror", (e) => console.log("pageerror:", e.message));
  p.on("console", (m) => m.type() === "error" && console.log("console:", m.text().slice(0, 200)));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(7000);
  if (full === "1") {
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(120); }
    await p.waitForTimeout(1800);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(800);
  }
  await p.screenshot({ path: out, fullPage: full === "1" });
  await b.close();
})();
