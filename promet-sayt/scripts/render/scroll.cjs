// Sahifani skroll qilib, har ekranni alohida suratga oladi
const { chromium } = require("playwright");
(async () => {
  const [,, url, outPrefix, w, h, start, count] = process.argv;
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, reducedMotion: "reduce" });
  p.on("pageerror", (e) => console.log("pageerror:", e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log("height", H);
  let i = 0;
  for (let y = +start * +h; y < H && i < +count; y += +h, i++) {
    await p.evaluate((y) => { const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }, y);
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${outPrefix}-${String(i).padStart(2, "0")}.png` });
  }
  await b.close();
})();
