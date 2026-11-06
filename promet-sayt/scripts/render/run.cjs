// Foydalanish: node scripts/render/run.cjs jobs.json outDir
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const out = process.argv[3];
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  for (const j of jobs) {
    const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
    page.on("console", (m) => m.type() === "error" && console.log("console:", m.text()));
    page.on("pageerror", (e) => console.log("pageerror:", e.message));
    await page.goto("file://" + path.resolve(__dirname, "index.html"));
    const t = Date.now();
    const data = await page.evaluate(async (j) => {
      const el = document.getElementById("s");
      el.style.width = j.w + "px"; el.style.height = j.h + "px";
      const api = await window.createHouse(el, { ...j.opts, still: true });
      api.render();
      return api.canvas.toDataURL("image/png");
    }, j);
    fs.writeFileSync(path.join(out, j.name + ".png"), Buffer.from(data.split(",")[1], "base64"));
    console.log(j.name, (Date.now() - t) / 1000 + "s");
    await page.close();
  }
  await browser.close();
})();
