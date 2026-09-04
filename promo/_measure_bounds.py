"""把每景的動畫快轉到結尾（鏡頭推近到最大），量測 .stage 內容是否仍在 1920×1080 安全框內。"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
sb = json.load(open(HERE / "storyboard.json"))

JS = """() => {
  // 快轉所有動畫到結尾：鏡頭 scale 會停在 1.055，進場動畫也全部完成
  for (const el of document.querySelectorAll('*')) {
    for (const a of el.getAnimations()) {
      try { a.currentTime = (a.effect.getTiming().delay||0) + (a.effect.getTiming().duration||0); } catch(e){}
    }
  }
  const stage = document.querySelector('.stage');
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  const walk = (n) => {
    for (const c of n.children) {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      if (r.width && r.height && cs.visibility!=='hidden' && +cs.opacity > 0.02) {
        minX=Math.min(minX,r.left); minY=Math.min(minY,r.top);
        maxX=Math.max(maxX,r.right); maxY=Math.max(maxY,r.bottom);
      }
      walk(c);
    }
  };
  walk(stage);
  return {minX,minY,maxX,maxY,
          docW:document.documentElement.scrollWidth, docH:document.documentElement.scrollHeight};
}"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ["CHROMIUM_PATH"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    bad = 0
    for sc in sb["scenes"]:
        f = HERE / sc["file"]
        pg.goto(f"file://{f}")
        pg.wait_for_timeout(220)
        m = pg.evaluate(JS)
        issues = []
        if m["minY"] < 8: issues.append(f"top={m['minY']:.0f}")
        if m["maxY"] > 1072: issues.append(f"bottom={m['maxY']:.0f}")
        if m["minX"] < 8: issues.append(f"left={m['minX']:.0f}")
        if m["maxX"] > 1912: issues.append(f"right={m['maxX']:.0f}")
        if m["docW"] > 1921 or m["docH"] > 1081: issues.append(f"doc={m['docW']}x{m['docH']}")
        status = "CLIP " + " ".join(issues) if issues else "ok"
        if issues: bad += 1
        print(f"{sc['file'][:24]:26} y[{m['minY']:7.1f},{m['maxY']:7.1f}] x[{m['minX']:7.1f},{m['maxX']:7.1f}]  {status}")
    print(f"\nscenes with clipping risk: {bad}/{len(sb['scenes'])}")
    b.close()
