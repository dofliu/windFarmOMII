#!/usr/bin/env python3
"""產生 OWM 介紹影片的 21 個 standalone 場景 HTML。
每景輸出後即可單獨編輯重渲（render_scenes.py --only sceneNN_xxx）。"""
from pathlib import Path

OUT = Path(__file__).resolve().parent

SHELL = r"""<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>@@TITLE@@</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#070d17}
body{font-family:"Noto Sans CJK TC","Noto Sans TC","PingFang TC",sans-serif;color:#e8eef7;position:relative}
.bg{position:absolute;inset:0;background:
 radial-gradient(1200px 800px at 24% 18%,rgba(45,212,191,.14),transparent 62%),
 radial-gradient(1100px 760px at 78% 82%,rgba(139,92,246,.15),transparent 60%),
 linear-gradient(160deg,#0d1b2e 0%,#070d17 58%,#05070d 100%)}
.aur{position:absolute;width:1500px;height:1500px;border-radius:50%;filter:blur(90px);opacity:.5;mix-blend-mode:screen}
.aur.a{background:radial-gradient(circle,rgba(45,212,191,.32),transparent 62%);left:-460px;top:-560px;animation:drift1 22s ease-in-out infinite alternate}
.aur.b{background:radial-gradient(circle,rgba(139,92,246,.30),transparent 62%);right:-520px;bottom:-620px;animation:drift2 26s ease-in-out infinite alternate}
@keyframes drift1{to{transform:translate(150px,90px) scale(1.12)}}
@keyframes drift2{to{transform:translate(-130px,-80px) scale(1.08)}}
.vig{position:absolute;inset:0;background:radial-gradient(1600px 1000px at 50% 46%,transparent 58%,rgba(0,0,0,.5) 100%);pointer-events:none}
.grid{position:absolute;inset:0;opacity:.05;background-image:linear-gradient(rgba(232,238,247,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(232,238,247,.5) 1px,transparent 1px);background-size:64px 64px}
.stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
 --dur:@@DUR@@s;animation:cam var(--dur) ease-in-out both}
@keyframes cam{from{transform:scale(1)}to{transform:scale(1.055)}}
.kicker{font-size:30px;font-weight:700;letter-spacing:.55em;text-indent:.55em;color:#2dd4bf;text-transform:uppercase}
.h1{font-size:112px;font-weight:900;line-height:1.14;text-align:center;letter-spacing:.01em;
 background:linear-gradient(100deg,#f4f8ff 20%,#9be8db 50%,#c4b5fd 80%);-webkit-background-clip:text;background-clip:text;color:transparent;
 filter:drop-shadow(0 8px 40px rgba(45,212,191,.18))}
.sub{font-size:40px;font-weight:400;color:rgba(232,238,247,.78);text-align:center;line-height:1.6}
.accent{color:#2dd4bf;font-weight:700}
.chip{display:inline-flex;align-items:center;gap:16px;padding:20px 38px;border-radius:999px;font-size:36px;font-weight:700;white-space:nowrap;
 background:rgba(20,32,52,.82);border:1.5px solid rgba(150,200,255,.22);box-shadow:0 14px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.07)}
.card{background:linear-gradient(165deg,rgba(24,38,62,.92),rgba(12,20,36,.94));border:1.5px solid rgba(150,200,255,.20);
 border-radius:26px;box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}
.badge{display:inline-block;padding:12px 26px;border-radius:12px;font-size:28px;font-weight:700;white-space:nowrap;
 background:rgba(45,212,191,.14);border:1.5px solid rgba(45,212,191,.45);color:#7ff0df}
.in{opacity:0;animation:rise 1s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--d,0s)}
@keyframes rise{from{opacity:0;transform:translateY(56px)}to{opacity:1;transform:none}}
.pop{opacity:0;animation:pop .8s cubic-bezier(.2,1.4,.35,1) both;animation-delay:var(--d,0s)}
@keyframes pop{from{opacity:0;transform:scale(.55)}to{opacity:1;transform:scale(1)}}
.glow{animation:glow 2.6s ease-in-out infinite}
@keyframes glow{0%,100%{filter:drop-shadow(0 0 18px rgba(45,212,191,.25))}50%{filter:drop-shadow(0 0 42px rgba(45,212,191,.55))}}
.in.glow{animation:rise 1s cubic-bezier(.16,1,.3,1) var(--d,0s) both,glow 2.6s ease-in-out infinite}
.pop.glow{animation:pop .8s cubic-bezier(.2,1.4,.35,1) var(--d,0s) both,glow 2.6s ease-in-out infinite}
/* ── 共用版面工具 ── */
.row{display:flex;align-items:center;justify-content:center;flex-wrap:nowrap}
.col{display:flex;flex-direction:column}
.mono{font-family:"Noto Sans Mono CJK TC",ui-monospace,"DejaVu Sans Mono",monospace}
.bar{height:12px;border-radius:99px;background:rgba(150,200,255,.16);overflow:hidden;width:100%}
.bar>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#2dd4bf,#7dd3fc);
 width:0;animation:grow 1.5s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--bd,1s)}
@keyframes grow{to{width:var(--w,60%)}}
.lite{opacity:.34}
.seq{animation:litup .55s ease-out both;animation-delay:var(--d,0s)}
@keyframes litup{from{opacity:.2;transform:scale(.94)}to{opacity:1;transform:none}}
@@CSS@@
</style></head>
<body>
<div class="bg"></div><div class="aur a"></div><div class="aur b"></div><div class="grid"></div>
@@PARTICLES@@
<div class="stage" style="z-index:2">
@@CONTENT@@
</div>
<div class="vig" style="z-index:3"></div>
@@SCRIPT@@
</body></html>
"""

PARTICLES = r"""<canvas id="fx" style="position:absolute;inset:0;z-index:1;pointer-events:none"></canvas>
<script>
const cv=document.getElementById('fx');cv.width=1920;cv.height=1080;const cx=cv.getContext('2d');
const P=[];for(let i=0;i<80;i++){P.push({x:Math.random()*1920,y:Math.random()*1080,
 r:.8+Math.random()*2.6,s:.12+Math.random()*.5,o:.12+Math.random()*.4,
 hue:Math.random()<.6?'45,212,191':'167,139,250',ph:Math.random()*6.28});}
function draw(){const t=performance.now()/1000;cx.clearRect(0,0,1920,1080);
 for(const p of P){const y=(p.y-t*38*p.s)%1080,yy=y<0?y+1080:y;
  const x=p.x+Math.sin(t*.5+p.ph)*26;const tw=.55+.45*Math.sin(t*1.7+p.ph*3);
  cx.beginPath();cx.arc(x,yy,p.r,0,6.283);
  cx.fillStyle=`rgba(${p.hue},${(p.o*tw).toFixed(3)})`;cx.fill();}
 requestAnimationFrame(draw);}
requestAnimationFrame(draw);
</script>"""

# ── 章節色調（換章訊號）──────────────────────────────────────────────
TONE = {
    "default": "",
    "cyan": """.bg{background:
 radial-gradient(1200px 800px at 22% 16%,rgba(56,189,248,.16),transparent 62%),
 radial-gradient(1100px 760px at 80% 84%,rgba(45,212,191,.14),transparent 60%),
 linear-gradient(160deg,#0b1c30 0%,#060e1a 58%,#04070e 100%)}
.aur.a{background:radial-gradient(circle,rgba(56,189,248,.30),transparent 62%)}
.aur.b{background:radial-gradient(circle,rgba(45,212,191,.26),transparent 62%)}""",
    "green": """.bg{background:
 radial-gradient(1200px 800px at 24% 18%,rgba(52,211,153,.15),transparent 62%),
 radial-gradient(1100px 760px at 78% 82%,rgba(20,148,132,.16),transparent 60%),
 linear-gradient(160deg,#0a1f1b 0%,#061310 58%,#040b09 100%)}
.aur.a{background:radial-gradient(circle,rgba(52,211,153,.28),transparent 62%)}
.aur.b{background:radial-gradient(circle,rgba(16,185,129,.24),transparent 62%)}
.kicker{color:#5eead4}""",
    "amber": """.bg{background:
 radial-gradient(1200px 800px at 24% 18%,rgba(251,191,36,.13),transparent 62%),
 radial-gradient(1100px 760px at 78% 82%,rgba(249,115,22,.12),transparent 60%),
 linear-gradient(160deg,#241a0d 0%,#140e07 58%,#0b0704 100%)}
.aur.a{background:radial-gradient(circle,rgba(251,191,36,.26),transparent 62%)}
.aur.b{background:radial-gradient(circle,rgba(249,115,22,.22),transparent 62%)}
.kicker{color:#fbbf24}
.h1{background:linear-gradient(100deg,#fff7e6 20%,#fcd34d 52%,#fdba74 82%);-webkit-background-clip:text;background-clip:text;
 filter:drop-shadow(0 8px 40px rgba(251,191,36,.20))}
.badge{background:rgba(251,191,36,.13);border-color:rgba(251,191,36,.45);color:#fcd34d}
.bar>i{background:linear-gradient(90deg,#fbbf24,#fb923c)}""",
    "dark": """.bg{background:
 radial-gradient(1400px 900px at 50% 50%,rgba(45,212,191,.10),transparent 64%),
 linear-gradient(160deg,#05090f 0%,#03060a 60%,#010305 100%)}
.aur.a{opacity:.32}.aur.b{opacity:.28}
.grid{opacity:.03}""",
    "violet": """.bg{background:
 radial-gradient(1200px 800px at 22% 16%,rgba(167,139,250,.16),transparent 62%),
 radial-gradient(1100px 760px at 80% 84%,rgba(99,102,241,.15),transparent 60%),
 linear-gradient(160deg,#141130 0%,#0a0918 58%,#060510 100%)}
.aur.a{background:radial-gradient(circle,rgba(167,139,250,.30),transparent 62%)}
.aur.b{background:radial-gradient(circle,rgba(99,102,241,.26),transparent 62%)}
.kicker{color:#c4b5fd}
.badge{background:rgba(167,139,250,.14);border-color:rgba(167,139,250,.45);color:#ddd6fe}
.bar>i{background:linear-gradient(90deg,#a78bfa,#818cf8)}""",
}


def scene(name, title, dur, content, css="", tone="default", particles=False, script=""):
    html = (SHELL
            .replace("@@TITLE@@", title)
            .replace("@@DUR@@", str(dur))
            .replace("@@CSS@@", TONE[tone] + "\n" + css)
            .replace("@@PARTICLES@@", PARTICLES if particles else "")
            .replace("@@CONTENT@@", content)
            .replace("@@SCRIPT@@", script))
    (OUT / f"{name}.html").write_text(html, encoding="utf-8")
    return name

# ══════════ 開場章 ══════════
scene("scene01_open", "S01 開場", 9, particles=True, tone="default", content="""
 <div class="kicker in" style="--d:.2s">NCUT &middot; OFFSHORE WIND O&amp;M</div>
 <div class="h1 pop" style="--d:.6s;margin-top:34px;font-size:146px;line-height:1.06">Offshore Wind<br>Masters</div>
 <div class="sub in" style="--d:1.6s;margin-top:44px">把離岸風電運維，變成<span class="accent">可以練習的決策</span></div>
 <div class="row" style="margin-top:58px;gap:24px">
  <div class="badge pop" style="--d:2.3s;font-size:30px;padding:14px 30px">教學部署</div>
  <div class="badge pop" style="--d:2.5s;font-size:30px;padding:14px 30px">工程實作</div>
  <div class="badge pop" style="--d:2.7s;font-size:30px;padding:14px 30px">開源專案</div>
 </div>
""")

scene("scene02_problem", "S02 問題", 9, tone="amber", content="""
 <div class="kicker in" style="--d:.2s">THE PROBLEM</div>
 <div class="h1 in" style="--d:.5s;margin-top:28px;font-size:102px">真實風場<br>不能拿來試錯</div>
 <div class="sub in" style="--d:1.4s;margin-top:38px;max-width:1360px">停機、上鎖、派工、判斷 —— 每一個決策背後<br>都是真實的成本、天候窗與人身安全</div>
 <div class="row" style="margin-top:56px;gap:30px">
  <div class="chip pop" style="--d:2.1s">停機損失</div>
  <div class="chip pop" style="--d:2.35s">人身風險</div>
  <div class="chip pop" style="--d:2.6s">不可重來</div>
 </div>
""")

scene("scene03_position", "S03 定位", 9, particles=True, tone="default", css="""
.tw{width:1500px;display:flex;gap:44px;justify-content:center}
.tw>div{flex:1;padding:44px 40px;text-align:left}
.tw h3{font-size:46px;font-weight:900;margin-bottom:8px}
.tw .en{font-size:24px;letter-spacing:.28em;color:rgba(232,238,247,.5);margin-bottom:26px}
.tw li{font-size:31px;line-height:1.85;color:rgba(232,238,247,.82);list-style:none}
.tw li::before{content:"— ";color:#2dd4bf}
""", content="""
 <div class="kicker in" style="--d:.2s">WHAT IT IS</div>
 <div class="h1 in" style="--d:.5s;margin-top:26px;font-size:98px">一套可重現的<br>教學運維系統</div>
 <div class="tw" style="margin-top:52px">
  <div class="card in" style="--d:1.5s"><h3 style="color:#7dd3fc">戰役模式</h3><div class="en">CAMPAIGN</div>
   <ul><li>五章十五關主線</li><li>六機風場可用率</li><li>人員疲勞與資源調度</li></ul></div>
  <div class="card in" style="--d:1.8s"><h3 style="color:#7ff0df">課程模式</h3><div class="en">COURSE MODE</div>
   <ul><li>十五週固定任務</li><li>匿名學習紀錄</li><li>教師手動發布週次</li></ul></div>
 </div>
 <div class="sub in" style="--d:2.5s;margin-top:44px;font-size:34px">同一套工程模型，兩種使用情境</div>
""")

# ══════════ 功能章 A：課程雙軌 ══════════
scene("scene04_twotrack", "S04 雙軌分流", 9, tone="cyan", css="""
.tw{width:1560px;display:flex;gap:44px;justify-content:center}
.tw>div{flex:1;padding:40px 38px;text-align:left}
.tw h3{font-size:44px;font-weight:900}
.tw .en{font-size:22px;letter-spacing:.26em;color:rgba(232,238,247,.5);margin:6px 0 24px}
.tw li{font-size:30px;line-height:1.9;list-style:none;color:rgba(232,238,247,.84)}
.yes::before{content:"✓ ";color:#34d399;font-weight:900}
.no::before{content:"✕ ";color:#f87171;font-weight:900}
""", content="""
 <div class="kicker in" style="--d:.2s">COURSE MODE</div>
 <div class="h1 in" style="--d:.5s;margin-top:26px;font-size:100px">練習與評量<br>完全分流</div>
 <div class="tw" style="margin-top:50px">
  <div class="card in" style="--d:1.5s"><h3 style="color:#7dd3fc">練習導覽</h3><div class="en">GUIDED PRACTICE</div>
   <ul><li class="yes">有提示、有導覽</li><li class="yes">可無限重複練習</li><li class="no">不寫入評量紀錄</li></ul></div>
  <div class="card in" style="--d:1.8s"><h3 style="color:#7ff0df">正式評量</h3><div class="en">ASSESSMENT</div>
   <ul><li class="no">停用 REC／GUIDE</li><li class="yes">固定條件、可重現</li><li class="yes">寫入匿名紀錄</li></ul></div>
 </div>
 <div class="row" style="margin-top:46px;gap:20px">
  <div class="badge pop" style="--d:2.5s">NO REC</div>
  <div class="badge pop" style="--d:2.65s">NO GUIDE</div>
  <div class="badge pop" style="--d:2.8s">ANONYMOUS</div>
  <div class="badge pop" style="--d:2.95s">FIXED SEED</div>
 </div>
""")

scene("scene05_weeks", "S05 週次解鎖", 9, tone="cyan", css="""
.wg{display:grid;grid-template-columns:repeat(5,236px);gap:20px;margin-top:48px}
.wk{padding:22px 18px;border-radius:18px;text-align:center;background:rgba(16,28,46,.8);
 border:1.5px solid rgba(150,200,255,.16)}
.wk b{display:block;font-size:36px;font-weight:900;color:rgba(232,238,247,.55)}
.wk small{display:block;font-size:19px;margin-top:6px;color:rgba(232,238,247,.38);letter-spacing:.06em}
.wk.on{background:rgba(45,212,191,.16);border-color:rgba(45,212,191,.6);box-shadow:0 0 44px rgba(45,212,191,.28)}
.wk.on b{color:#7ff0df}.wk.on small{color:#5eead4}
""", content="""
 <div class="kicker in" style="--d:.2s">TEACHER-CONTROLLED RELEASE</div>
 <div class="h1 in" style="--d:.5s;margin-top:24px;font-size:94px">十五週任務<br>由教師手動解鎖</div>
 <div class="wg">
""" + "".join(
    f'  <div class="wk{" on" if i == 1 else ""} seq" style="--d:{1.3 + i * 0.075:.2f}s">'
    f'<b>W{i:02d}</b><small>{"已開放" if i == 1 else "尚未開放"}</small></div>\n'
    for i in range(1, 16)
) + """ </div>
 <div class="sub in" style="--d:3.1s;margin-top:44px;font-size:34px">不依日期、不依學生進度自動解鎖</div>
""")

scene("scene06_fixed", "S06 固定條件", 9, tone="cyan", css="""
.mf{width:1200px;padding:44px 54px}
.mf .hd{display:flex;justify-content:space-between;align-items:baseline;
 border-bottom:1.5px solid rgba(150,200,255,.18);padding-bottom:22px;margin-bottom:12px}
.mf .hd span{font-size:24px;letter-spacing:.3em;color:#7dd3fc;font-weight:700}
.mf .hd em{font-size:26px;font-style:normal;color:rgba(232,238,247,.5)}
.mr{display:flex;justify-content:space-between;align-items:center;padding:17px 0;font-size:33px;
 border-bottom:1px solid rgba(150,200,255,.08)}
.mr i{font-style:normal;color:rgba(232,238,247,.66)}
.mr b{font-weight:800;color:#e8eef7}
""", content="""
 <div class="kicker in" style="--d:.2s">REPRODUCIBLE ASSESSMENT</div>
 <div class="h1 in" style="--d:.5s;margin-top:24px;font-size:98px">每個學生<br>拿到同一題</div>
 <div class="mf card in" style="--d:1.5s;margin-top:46px">
  <div class="hd"><span>ASSESSMENT MANIFEST</span><em>W01</em></div>
  <div class="mr seq" style="--d:1.9s"><i>固定任務</i><b class="mono">MSN-TUT-001</b></div>
  <div class="mr seq" style="--d:2.05s"><i>固定隊伍</i><b class="mono">3 名職業角色</b></div>
  <div class="mr seq" style="--d:2.2s"><i>主裝備／備品</i><b class="mono">EQ0051 / EQ0126</b></div>
  <div class="mr seq" style="--d:2.35s"><i>作業船舶</i><b class="mono">VES002 &middot; SOV</b></div>
  <div class="mr seq" style="--d:2.5s;border-bottom:none"><i>隨機種子</i><b class="mono" style="color:#7ff0df">SEED 357101</b></div>
 </div>
 <div class="sub in" style="--d:3s;margin-top:40px;font-size:34px">固定條件 = 可以互相比較的成績</div>
""")

# ══════════ 功能章 B：工程實作（黑板綠）══════════
scene("scene07_scada", "S07 SCADA 資料包", 9, tone="green", css="""
.tbl{width:1620px;padding:30px 34px 22px}
.tbl table{width:100%;border-collapse:collapse;font-size:27px}
.tbl th{text-align:left;font-size:21px;letter-spacing:.16em;color:#5eead4;font-weight:700;
 padding:0 14px 16px;border-bottom:1.5px solid rgba(94,234,212,.24)}
.tbl td{padding:13px 14px;border-bottom:1px solid rgba(150,200,255,.07);color:rgba(232,238,247,.86)}
.tbl tr.bad td{background:rgba(248,113,113,.10);color:#fca5a5}
.tbl tr.warn td{color:#fcd34d}
.tbl .mv{color:#f87171;font-weight:800}
""", content="""
 <div class="kicker in" style="--d:.2s">SCADA / CMS DATA PACK</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:92px">從訊號裡讀出<br>故障的樣子</div>
 <div class="tbl card in" style="--d:1.5s;margin-top:40px">
  <table><thead><tr><th>TIMESTAMP</th><th>LOAD kW</th><th>TEMP °C</th><th>VIB mm/s</th><th>ALARM</th><th>EVENT</th></tr></thead>
  <tbody class="mono">
   <tr class="seq" style="--d:1.9s"><td>2026-01-05 00:00</td><td>5020</td><td>69.8</td><td>3.09</td><td>—</td><td>—</td></tr>
   <tr class="seq" style="--d:2.05s"><td>2026-01-05 00:20</td><td>4817</td><td>69.4</td><td>2.94</td><td>—</td><td>—</td></tr>
   <tr class="bad seq" style="--d:2.2s"><td>2026-01-05 00:30</td><td>4617</td><td>68.9</td><td class="mv">缺值</td><td>—</td><td>QUALITY_BAD</td></tr>
   <tr class="seq" style="--d:2.35s"><td>2026-01-05 00:40</td><td>4414</td><td>68.4</td><td>2.86</td><td>—</td><td>—</td></tr>
   <tr class="warn seq" style="--d:2.5s"><td>2026-01-05 00:50</td><td>4221</td><td>71.6</td><td>3.41</td><td>—</td><td>CONDITION_DEVIATION</td></tr>
   <tr class="warn seq" style="--d:2.65s"><td>2026-01-05 01:20</td><td>3968</td><td>74.2</td><td>3.88</td><td>DRIVETRAIN_WARNING</td><td>—</td></tr>
  </tbody></table>
 </div>
 <div class="sub in" style="--d:3.1s;margin-top:36px;font-size:33px">每週一份可重現資料包 &middot; 含刻意標示的缺值</div>
""")

scene("scene08_kpi", "S08 可靠度 KPI", 9, tone="green", css="""
.kg{display:flex;gap:26px;margin-top:46px}
.kp{width:290px;padding:32px 26px;text-align:center}
.kp span{display:block;font-size:23px;letter-spacing:.2em;color:#5eead4;font-weight:700}
.kp b{display:block;font-size:52px;font-weight:900;margin:14px 0 10px;color:#f4f8ff}
.kp small{display:block;font-size:20px;color:rgba(232,238,247,.52);line-height:1.5}
.drv{margin-top:40px;padding:26px 44px;font-size:27px;color:rgba(232,238,247,.8);letter-spacing:.02em}
.drv u{text-decoration:none;color:#7ff0df;font-weight:700}
""", content="""
 <div class="kicker in" style="--d:.2s">RELIABILITY KPI</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:94px">五個指標<br>都看得到推導</div>
 <div class="kg">
  <div class="kp card pop" style="--d:1.5s"><span>AVAILABILITY</span><b>98.87%</b><small>Uptime ÷ 可觀測時數</small></div>
  <div class="kp card pop" style="--d:1.68s"><span>MTBF</span><b>700.0 h</b><small>Uptime ÷ 故障次數</small></div>
  <div class="kp card pop" style="--d:1.86s"><span>MTTR</span><b>5.76 h</b><small>維修時數 ÷ 故障次數</small></div>
  <div class="kp card pop" style="--d:2.04s"><span>DOWNTIME</span><b>8.00 h</b><small>非計畫停機時數</small></div>
  <div class="kp card pop" style="--d:2.22s"><span>OPEX</span><b>$80.5k</b><small>人工＋備品＋船舶＋損失</small></div>
 </div>
 <div class="drv card mono in" style="--d:2.8s">Observable = 720 − 12 = <u>708 h</u> &nbsp;·&nbsp; Uptime = 708 − 8 = <u>700 h</u> &nbsp;·&nbsp; Availability = 700 ÷ 708 × 100 = <u>98.87%</u></div>
""")

scene("scene09_loto", "S09 程序安全", 9, tone="green", css="""
.chain{display:flex;align-items:center;gap:14px;margin-top:44px}
.st{padding:26px 24px;border-radius:18px;text-align:center;width:222px;
 background:rgba(16,38,32,.86);border:1.5px solid rgba(94,234,212,.28)}
.st i{display:block;font-style:normal;font-size:21px;color:#5eead4;font-weight:800;letter-spacing:.14em}
.st b{display:block;font-size:31px;font-weight:800;margin-top:9px;color:#f4f8ff}
.arw{font-size:30px;color:rgba(94,234,212,.5)}
.wo{display:flex;gap:13px;margin-top:38px}
.wc{padding:15px 22px;border-radius:12px;font-size:25px;font-weight:700;white-space:nowrap;
 background:rgba(20,32,52,.8);border:1.5px solid rgba(150,200,255,.2);color:rgba(232,238,247,.86)}
""", content="""
 <div class="kicker in" style="--d:.2s">PROCEDURAL SAFETY</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:96px">順序錯了<br>就不算完成</div>
 <div class="chain">
  <div class="st seq" style="--d:1.5s"><i>STEP 1</i><b>停機</b></div><div class="arw seq" style="--d:1.62s">→</div>
  <div class="st seq" style="--d:1.74s"><i>STEP 2</i><b>隔離</b></div><div class="arw seq" style="--d:1.86s">→</div>
  <div class="st seq" style="--d:1.98s"><i>STEP 3</i><b>上鎖掛牌</b></div><div class="arw seq" style="--d:2.1s">→</div>
  <div class="st seq" style="--d:2.22s"><i>STEP 4</i><b>殘餘能量</b></div><div class="arw seq" style="--d:2.34s">→</div>
  <div class="st seq" style="--d:2.46s;background:rgba(45,212,191,.18);border-color:rgba(45,212,191,.62)"><i>STEP 5</i><b>零能量驗證</b></div>
 </div>
 <div class="wo">
  <div class="wc seq" style="--d:2.9s">Trigger</div><div class="wc seq" style="--d:3.0s">Acknowledge</div>
  <div class="wc seq" style="--d:3.1s">Dispatch</div><div class="wc seq" style="--d:3.2s">Execute</div>
  <div class="wc seq" style="--d:3.3s">Verify</div><div class="wc seq" style="--d:3.4s">Close-out</div>
 </div>
 <div class="sub in" style="--d:3.8s;margin-top:36px;font-size:32px">五步 LOTO 與六階段派工 &middot; 違序操作會被拒絕並計次</div>
""")

scene("scene10_interlock", "S10 Alarm/Interlock", 9, tone="green", css="""
.pr{display:flex;gap:18px;margin-top:40px}
.pv{padding:20px 26px;border-radius:14px;text-align:center;min-width:186px;
 background:rgba(16,38,32,.84);border:1.5px solid rgba(94,234,212,.26)}
.pv span{display:block;font-size:19px;letter-spacing:.16em;color:#5eead4;font-weight:700}
.pv b{display:block;font-size:38px;font-weight:900;margin-top:7px;color:#f4f8ff}
.code{width:1240px;margin-top:34px;padding:32px 40px;text-align:left;font-size:26px;line-height:1.78;
 color:#cdeee6;background:linear-gradient(165deg,rgba(8,24,20,.96),rgba(4,14,12,.97));
 border:1.5px solid rgba(94,234,212,.24);border-radius:22px}
.code .k{color:#7dd3fc;font-weight:700}.code .n{color:#fcd34d}.code .c{color:rgba(232,238,247,.42)}
""", content="""
 <div class="kicker in" style="--d:.2s">ALARM / INTERLOCK TESTER</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:92px">調參數<br>直接產出 ST 邏輯</div>
 <div class="pr">
  <div class="pv pop" style="--d:1.4s"><span>THRESHOLD</span><b>72.0</b></div>
  <div class="pv pop" style="--d:1.55s"><span>HYSTERESIS</span><b>3</b></div>
  <div class="pv pop" style="--d:1.7s"><span>DELAY</span><b>10 s</b></div>
  <div class="pv pop" style="--d:1.85s"><span>PERSISTENCE</span><b>3</b></div>
  <div class="pv pop" style="--d:2.0s;background:rgba(45,212,191,.18);border-color:rgba(45,212,191,.6)"><span>INTERLOCK</span><b>ON</b></div>
 </div>
 <div class="code mono in" style="--d:2.5s">
  <div class="c">(* IEC 61131-3 ST reference logic *)</div>
  <div>HighCondition <span class="k">:=</span> ProcessValue &gt;= <span class="n">72.0</span>;</div>
  <div>PersistCounter(IN <span class="k">:=</span> HighCondition, PV <span class="k">:=</span> <span class="n">3</span>);</div>
  <div>AlarmDelay(IN <span class="k">:=</span> PersistCounter.Q, PT <span class="k">:=</span> <span class="n">T#10s</span>);</div>
  <div><span class="k">ELSIF</span> AlarmDelay.Q <span class="k">THEN</span> AlarmActive <span class="k">:=</span> TRUE; <span class="k">END_IF</span>;</div>
  <div>InterlockTrip <span class="k">:=</span> AlarmActive <span class="k">AND</span> TRUE;</div>
 </div>
""")

# ══════════ 功能章 C：運維決策（警示金）══════════
scene("scene11_campaign", "S11 戰役與風場", 9, tone="amber", css="""
.tg{display:grid;grid-template-columns:repeat(3,412px);gap:22px;margin-top:44px}
.tc{padding:26px 28px;text-align:left}
.tc .hd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px}
.tc .hd b{font-size:31px;font-weight:900;color:#f4f8ff}
.tc .hd em{font-style:normal;font-size:21px;font-weight:800;letter-spacing:.1em}
.tc .mt{display:flex;justify-content:space-between;font-size:22px;color:rgba(232,238,247,.62);margin-top:13px}
.ok{color:#34d399}.el{color:#fbbf24}.dg{color:#f87171}
""", content="""
 <div class="kicker in" style="--d:.2s">CAMPAIGN</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:96px">五章十五關<br>一座六機風場</div>
 <div class="tg">
  <div class="tc card pop" style="--d:1.4s"><div class="hd"><b>WTG-001</b><em class="el">ELEVATED</em></div>
   <div class="bar"><i style="--w:88%;--bd:1.9s"></i></div><div class="mt"><span>可用率 88%</span><span>R 24 · B 1</span></div></div>
  <div class="tc card pop" style="--d:1.55s"><div class="hd"><b>WTG-002</b><em class="ok">NOMINAL</em></div>
   <div class="bar"><i style="--w:96%;--bd:2.0s"></i></div><div class="mt"><span>可用率 96%</span><span>R 31 · B 0</span></div></div>
  <div class="tc card pop" style="--d:1.7s"><div class="hd"><b>WTG-003</b><em class="ok">NOMINAL</em></div>
   <div class="bar"><i style="--w:93%;--bd:2.1s"></i></div><div class="mt"><span>可用率 93%</span><span>R 28 · B 0</span></div></div>
  <div class="tc card pop" style="--d:1.85s"><div class="hd"><b>WTG-004</b><em class="dg">DEGRADED</em></div>
   <div class="bar"><i style="--w:71%;--bd:2.2s"></i></div><div class="mt"><span>可用率 71%</span><span>R 18 · B 3</span></div></div>
  <div class="tc card pop" style="--d:2.0s"><div class="hd"><b>WTG-005</b><em class="ok">NOMINAL</em></div>
   <div class="bar"><i style="--w:91%;--bd:2.3s"></i></div><div class="mt"><span>可用率 91%</span><span>R 26 · B 1</span></div></div>
  <div class="tc card pop" style="--d:2.15s"><div class="hd"><b>WTG-006</b><em class="el">ELEVATED</em></div>
   <div class="bar"><i style="--w:84%;--bd:2.4s"></i></div><div class="mt"><span>可用率 84%</span><span>R 22 · B 2</span></div></div>
 </div>
 <div class="sub in" style="--d:2.9s;margin-top:40px;font-size:33px">任務成敗回饋到可用率、可靠度與故障積壓</div>
""")

scene("scene12_crew", "S12 人員與資源", 9, tone="amber", css="""
.cg{display:flex;gap:26px;margin-top:44px}
.cc{width:376px;padding:28px 30px;text-align:left}
.cc b{display:block;font-size:32px;font-weight:900;color:#f4f8ff}
.cc small{display:block;font-size:22px;color:rgba(232,238,247,.55);margin:6px 0 20px}
.cc .fv{display:flex;justify-content:space-between;font-size:24px;margin-top:12px;color:rgba(232,238,247,.7)}
.hot i{background:linear-gradient(90deg,#fb923c,#f87171)!important}
.rc{display:flex;gap:24px;margin-top:38px}
.rr{padding:22px 44px;border-radius:16px;text-align:center;
 background:rgba(36,26,13,.86);border:1.5px solid rgba(251,191,36,.34)}
.rr span{display:block;font-size:21px;letter-spacing:.2em;color:#fbbf24;font-weight:700}
.rr b{display:block;font-size:44px;font-weight:900;margin-top:6px;color:#fff7e6}
""", content="""
 <div class="kicker in" style="--d:.2s">CREW &amp; RESOURCES</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:98px">人會累<br>資源會用完</div>
 <div class="cg">
  <div class="cc card pop" style="--d:1.4s"><b>主軸承分析師</b><small>OMI · L5 資深防護</small>
   <div class="bar"><i style="--w:42%;--bd:1.9s"></i></div><div class="fv"><span>疲勞 42%</span><span>可派遣</span></div></div>
  <div class="cc card pop" style="--d:1.6s"><b>CMS 工程師</b><small>DIG · L4 專家整備</small>
   <div class="bar"><i style="--w:68%;--bd:2.05s"></i></div><div class="fv"><span>疲勞 68%</span><span>建議輪調</span></div></div>
  <div class="cc card pop hot" style="--d:1.8s;border-color:rgba(248,113,113,.44)"><b>振動診斷研究員</b><small>ACA · L5 資深防護</small>
   <div class="bar"><i style="--w:76%;--bd:2.2s"></i></div><div class="fv"><span style="color:#fca5a5">疲勞 76%</span><span style="color:#fca5a5">須換班</span></div></div>
 </div>
 <div class="rc">
  <div class="rr pop" style="--d:2.6s"><span>RST 復原代幣</span><b>6</b></div>
  <div class="rr pop" style="--d:2.78s"><span>MNT 維修額度</span><b>55</b></div>
  <div class="rr pop" style="--d:2.96s"><span>天候窗</span><b>72%</b></div>
 </div>
 <div class="sub in" style="--d:3.4s;margin-top:34px;font-size:32px">疲勞會跨任務累積 &middot; 換班、復原與維修都要付代價</div>
""")

scene("scene13_loadout", "S13 裝備配置", 9, tone="amber", css="""
.sl{display:flex;gap:28px;margin-top:44px}
.sc{width:440px;padding:30px 32px;text-align:left}
.sc span{display:block;font-size:21px;letter-spacing:.2em;color:#fbbf24;font-weight:700}
.sc b{display:block;font-size:34px;font-weight:900;margin:12px 0 8px;color:#f4f8ff}
.sc small{display:block;font-size:23px;color:rgba(232,238,247,.6)}
.sc .mk{margin-top:18px;font-size:25px;font-weight:800}
.mok{color:#34d399}.mno{color:#f87171}
""", content="""
 <div class="kicker in" style="--d:.2s">LOADOUT</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:98px">帶錯裝備<br>就少了證據</div>
 <div class="sl">
  <div class="sc card in" style="--d:1.5s"><span>主裝備</span><b>振動頻譜分析儀</b><small>EQ0051 · 診斷類 · T3</small>
   <div class="mk mok seq" style="--d:2.2s">✓ 與故障族群相符 &nbsp;證據 +3</div></div>
  <div class="sc card in" style="--d:1.7s"><span>備品</span><b>主軸承備品組</b><small>EQ0126 · 備品類 · T3</small>
   <div class="mk mok seq" style="--d:2.4s">✓ 可現場更換 &nbsp;可靠度 +2</div></div>
  <div class="sc card in" style="--d:1.9s"><span>作業船舶</span><b>SOV 運維母船</b><small>VES002 · 可留置 · 直升機甲板</small>
   <div class="mk mok seq" style="--d:2.6s">✓ 天候窗 +12% &nbsp;疲勞 −2</div></div>
 </div>
 <div class="row" style="margin-top:40px;gap:20px">
  <div class="badge pop" style="--d:3.1s">200 項裝備</div>
  <div class="badge pop" style="--d:3.25s">8 大分類</div>
  <div class="badge pop" style="--d:3.4s">CTV · SOV · USV</div>
 </div>
""")

scene("scene14_incident", "S14 重大事故演練", 9, tone="amber", css="""
.ig{display:grid;grid-template-columns:repeat(10,150px);gap:12px;margin-top:44px}
.it{height:70px;border-radius:12px;display:flex;align-items:center;justify-content:center;
 font-size:20px;font-weight:800;letter-spacing:.06em;
 background:rgba(36,26,13,.8);border:1.5px solid rgba(251,191,36,.22);color:rgba(252,211,77,.72)}
.it.hi{background:rgba(248,113,113,.16);border-color:rgba(248,113,113,.5);color:#fca5a5}
""", content="""
 <div class="kicker in" style="--d:.2s">CRITICAL INCIDENT EXERCISE</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:100px">一百種<br>出事的方式</div>
 <div class="ig">
""" + "".join(
    f'  <div class="it{" hi" if i in (7, 13, 24, 28) else ""} seq" style="--d:{1.35 + i * 0.045:.2f}s">B{i + 1:02d}</div>\n'
    for i in range(30)
) + """ </div>
 <div class="row" style="margin-top:40px;gap:22px">
  <div class="badge pop" style="--d:3.0s">100 / 100 可完成</div>
  <div class="badge pop" style="--d:3.15s">克制加成 ×1.35</div>
  <div class="badge pop" style="--d:3.3s">14 種事故型態</div>
 </div>
 <div class="sub in" style="--d:3.7s;margin-top:32px;font-size:31px">課程脈絡下改稱「重大事故演練」</div>
""")

# ══════════ 戲劇景（全片唯一）══════════
scene("scene15_climax", "S15 核心主張", 10, tone="dark", css="""
.rule{width:520px;height:2px;background:linear-gradient(90deg,transparent,rgba(45,212,191,.85),transparent);
 animation:sweep 1.4s cubic-bezier(.16,1,.3,1) both}
@keyframes sweep{from{opacity:0;transform:scaleX(.1)}to{opacity:1;transform:none}}
.hero{font-size:132px;font-weight:900;line-height:1.16;text-align:center;
 background:linear-gradient(100deg,#ffffff 18%,#9be8db 52%,#c4b5fd 84%);-webkit-background-clip:text;background-clip:text;color:transparent;
 animation:impact 1.1s cubic-bezier(.2,1.5,.3,1) both,gl 3.4s ease-in-out 1.1s infinite}
@keyframes impact{0%{opacity:0;transform:scale(.86)}60%{opacity:1;transform:scale(1.015)}100%{opacity:1;transform:none}}
@keyframes gl{0%,100%{filter:drop-shadow(0 0 26px rgba(45,212,191,.22))}50%{filter:drop-shadow(0 0 62px rgba(45,212,191,.5))}}
""", content="""
 <div class="rule" style="animation-delay:.3s"></div>
 <div class="kicker in" style="--d:.7s;margin-top:40px">THE WHOLE POINT</div>
 <div class="hero" style="animation-delay:1.3s,2.4s;margin-top:36px">在這裡犯的錯<br>不會有人受傷</div>
 <div class="sub in" style="--d:3.2s;margin-top:44px;font-size:46px;color:rgba(232,238,247,.9)">但每一個決策，都會留在紀錄裡</div>
 <div class="rule" style="animation-delay:3.8s;margin-top:52px"></div>
""")

# ══════════ 成果章（紫）══════════
scene("scene16_pipeline", "S16 任務軌跡", 9, tone="violet", css="""
.pl{position:relative;width:1680px;margin-top:52px}
.track{position:absolute;left:70px;right:70px;top:52px;height:6px;border-radius:99px;background:rgba(167,139,250,.18)}
.track>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#a78bfa,#7dd3fc);
 width:0;animation:grow 3.6s cubic-bezier(.3,.7,.4,1) 1.5s both}
.nodes{position:relative;display:flex;justify-content:space-between;align-items:flex-start}
.nd{width:210px;text-align:center}
.nd .dot{width:34px;height:34px;border-radius:50%;margin:36px auto 0;
 background:rgba(20,18,44,.9);border:3px solid rgba(167,139,250,.4)}
.nd.on .dot{background:#a78bfa;border-color:#ddd6fe;box-shadow:0 0 30px rgba(167,139,250,.7)}
.nd b{display:block;font-size:29px;font-weight:800;margin-top:20px;color:#f4f8ff}
.nd small{display:block;font-size:20px;color:rgba(232,238,247,.5);margin-top:6px;letter-spacing:.08em}
""", content="""
 <div class="kicker in" style="--d:.2s">ONE MISSION, END TO END</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:96px">一次任務<br>的完整軌跡</div>
 <div class="pl">
  <div class="track"><i></i></div>
  <div class="nodes">
   <div class="nd on seq" style="--d:1.6s"><div class="dot"></div><b>部署</b><small>JSA</small></div>
   <div class="nd on seq" style="--d:2.1s"><div class="dot"></div><b>診斷</b><small>DIAGNOSIS</small></div>
   <div class="nd on seq" style="--d:2.6s"><div class="dot"></div><b>上鎖</b><small>LOTO</small></div>
   <div class="nd on seq" style="--d:3.1s"><div class="dot"></div><b>派工</b><small>WORK ORDER</small></div>
   <div class="nd on seq" style="--d:3.6s"><div class="dot"></div><b>結算</b><small>SETTLEMENT</small></div>
   <div class="nd on seq" style="--d:4.1s"><div class="dot"></div><b>檢討</b><small>DEBRIEF</small></div>
   <div class="nd on seq" style="--d:4.6s"><div class="dot"></div><b>匯出</b><small>RECORD</small></div>
  </div>
 </div>
 <div class="sub in" style="--d:5.2s;margin-top:56px;font-size:33px">每一步都寫進匿名學習紀錄</div>
""")

scene("scene17_record", "S17 匿名紀錄", 9, tone="violet", css="""
.rw{display:flex;gap:36px;margin-top:44px;align-items:stretch}
.ev{width:860px;padding:28px 34px;text-align:left}
.ev .eh{font-size:21px;letter-spacing:.26em;color:#c4b5fd;font-weight:700;
 border-bottom:1.5px solid rgba(167,139,250,.2);padding-bottom:16px;margin-bottom:6px}
.er{display:flex;align-items:center;gap:20px;padding:11px 0;font-size:26px;
 border-bottom:1px solid rgba(167,139,250,.07)}
.er i{font-style:normal;color:#a78bfa;font-weight:800;width:46px}
.er b{font-weight:700;color:#f4f8ff;flex:1}
.er em{font-style:normal;font-size:21px;color:rgba(232,238,247,.44)}
.pri{width:520px;padding:32px 34px;display:flex;flex-direction:column;justify-content:center;gap:20px}
.pri .lc{font-size:19px;letter-spacing:.24em;color:#c4b5fd;font-weight:700}
.pri .cd{font-size:46px;font-weight:900;color:#ddd6fe;letter-spacing:.04em}
.nn{font-size:26px;color:rgba(232,238,247,.72);line-height:1.9}
.nn s{text-decoration:none;color:#f87171;font-weight:800;margin-right:10px}
""", content="""
 <div class="kicker in" style="--d:.2s">ANONYMOUS LEARNING RECORD</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:96px">只記決策<br>不記身分</div>
 <div class="rw">
  <div class="ev card in" style="--d:1.5s">
   <div class="eh">OWM_COURSE_RECORD &middot; EVENT STREAM</div>
   <div class="er mono seq" style="--d:1.9s"><i>#1</i><b>MODE_SELECTED</b><em>assessment</em></div>
   <div class="er mono seq" style="--d:2.05s"><i>#2</i><b>JSA_COMPLETED</b><em>preflight</em></div>
   <div class="er mono seq" style="--d:2.2s"><i>#3</i><b>MISSION_DEPLOYED</b><em>MSN-TUT-001</em></div>
   <div class="er mono seq" style="--d:2.35s"><i>#4</i><b>EVIDENCE_VIEWED</b><em>objectives</em></div>
   <div class="er mono seq" style="--d:2.5s"><i>#5</i><b>DIAGNOSIS_SELECTED</b><em>D1-B</em></div>
   <div class="er mono seq" style="--d:2.65s"><i>#6</i><b>LOTO_VERIFIED</b><em>zero-energy</em></div>
   <div class="er mono seq" style="--d:2.8s;border-bottom:none"><i>#7</i><b>MISSION_SETTLED</b><em>B &middot; 78</em></div>
  </div>
  <div class="pri card in" style="--d:1.8s">
   <div class="lc">LEARNER CODE</div>
   <div class="cd mono">OWM-7A2C-91F0</div>
   <div class="nn">
    <div class="seq" style="--d:2.5s"><s>✕</s>不收姓名</div>
    <div class="seq" style="--d:2.65s"><s>✕</s>不收 Email</div>
    <div class="seq" style="--d:2.8s"><s>✕</s>不收學號</div>
   </div>
  </div>
 </div>
""")

scene("scene18_debrief", "S18 四欄檢討", 9, tone="violet", css="""
.dg{display:grid;grid-template-columns:repeat(2,760px);gap:24px;margin-top:44px}
.dc{padding:28px 32px;text-align:left}
.dc span{display:block;font-size:20px;letter-spacing:.24em;color:#c4b5fd;font-weight:700}
.dc b{display:block;font-size:32px;font-weight:900;margin:10px 0 14px;color:#f4f8ff}
.dc p{font-size:26px;line-height:1.7;color:rgba(232,238,247,.78)}
.dc .cur{display:inline-block;width:3px;height:26px;background:#a78bfa;vertical-align:-4px;margin-left:6px;
 animation:blink 1.1s steps(1) infinite}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
""", content="""
 <div class="kicker in" style="--d:.2s">DEBRIEF</div>
 <div class="h1 in" style="--d:.5s;margin-top:22px;font-size:96px">四個欄位<br>才是真正的考題</div>
 <div class="dg">
  <div class="dc card in" style="--d:1.5s"><span>01 CONCLUSION</span><b>結論</b>
   <p>主軸承早期磨損徵兆，建議下一個天候窗停機檢查。</p></div>
  <div class="dc card in" style="--d:1.7s"><span>02 EVIDENCE</span><b>證據</b>
   <p>溫升與振動同時偏離基線，且 00:50 出現偏差事件。</p></div>
  <div class="dc card in" style="--d:1.9s"><span>03 UNCERTAINTY</span><b>不確定性</b>
   <p>00:30 一筆振動樣本缺失，無法確認趨勢連續性。</p></div>
  <div class="dc card in" style="--d:2.1s"><span>04 RESIDUAL RISK</span><b>殘餘風險</b>
   <p>需油液屑粒分析複驗，否則仍有誤判齒輪箱之可能<span class="cur"></span></p></div>
 </div>
 <div class="sub in" style="--d:2.8s;margin-top:40px;font-size:33px">四欄完整，才能匯出 Course Record</div>
""")

scene("scene19_scale", "S19 內容規模", 9.5, tone="violet", css="""
.sg{display:grid;grid-template-columns:repeat(3,470px);gap:26px;margin-top:50px}
.sn{padding:34px 30px;text-align:center}
.sn b{display:block;font-size:76px;font-weight:900;line-height:1;
 background:linear-gradient(100deg,#f4f8ff 20%,#ddd6fe 55%,#a5b4fc 85%);-webkit-background-clip:text;background-clip:text;color:transparent}
.sn > span{display:block;font-size:28px;font-weight:700;margin-top:14px;color:rgba(232,238,247,.8)}
.sn small{display:block;font-size:20px;color:rgba(232,238,247,.46);margin-top:6px;letter-spacing:.1em}
""", content="""
 <div class="kicker in" style="--d:.2s">BY THE NUMBERS</div>
 <div class="h1 in" style="--d:.5s;margin-top:20px;font-size:82px">內容規模</div>
 <div class="sg">
  <div class="sn card pop" style="--d:1.3s"><b><span class="cu" data-to="300">0</span></b><span>職業角色</span><small>60 條職涯路線</small></div>
  <div class="sn card pop" style="--d:1.45s"><b><span class="cu" data-to="500">0</span></b><span>技能</span><small>五階 Mastery</small></div>
  <div class="sn card pop" style="--d:1.6s"><b><span class="cu" data-to="200">0</span></b><span>裝備與備品</span><small>8 大分類</small></div>
  <div class="sn card pop" style="--d:1.75s"><b><span class="cu" data-to="150">0</span></b><span>作業場景</span><small>148 已整合</small></div>
  <div class="sn card pop" style="--d:1.9s"><b><span class="cu" data-to="100">0</span></b><span>事故案例</span><small>100/100 可完成</small></div>
  <div class="sn card pop" style="--d:2.05s"><b><span class="cu" data-to="15">0</span></b><span>週次任務</span><small>＋12 延伸案例</small></div>
 </div>
""", script="""<script>
const CUS=[...document.querySelectorAll('.cu')];
const START=1500,DUR=2200;
function tick(){const t=performance.now();
 for(const el of CUS){const to=+el.dataset.to;
  const p=Math.min(1,Math.max(0,(t-START)/DUR));
  const e=1-Math.pow(1-p,3);
  el.textContent=Math.round(to*e);}
 requestAnimationFrame(tick);}
requestAnimationFrame(tick);
</script>""")

scene("scene20_quality", "S20 工程品質", 9.5, tone="violet", css="""
.cl{width:1180px;margin-top:46px;padding:34px 44px;text-align:left}
.ci{display:flex;align-items:center;gap:24px;padding:15px 0;font-size:33px;
 border-bottom:1px solid rgba(167,139,250,.08)}
.ci i{font-style:normal;font-size:30px;color:#34d399;font-weight:900;width:40px}
.ci b{font-weight:700;color:#f4f8ff;flex:1}
.ci em{font-style:normal;font-size:24px;color:rgba(232,238,247,.5)}
""", content="""
 <div class="kicker in" style="--d:.2s">ENGINEERING QUALITY</div>
 <div class="h1 in" style="--d:.5s;margin-top:20px;font-size:94px">每次推送<br>都跑完整驗證</div>
 <div class="cl card in" style="--d:1.4s">
  <div class="ci seq" style="--d:1.8s"><i>✓</i><b>自動化測試</b><em>25 檔 · 160 項</em></div>
  <div class="ci seq" style="--d:1.95s"><i>✓</i><b>資料 · 場景 · 美術 gate</b><em>schema 與尺寸契約</em></div>
  <div class="ci seq" style="--d:2.1s"><i>✓</i><b>戰役與事故平衡模擬</b><em>15/15 · 100/100</em></div>
  <div class="ci seq" style="--d:2.25s"><i>✓</i><b>桌機與手機瀏覽器 smoke</b><em>1440×900 · 390×844</em></div>
  <div class="ci seq" style="--d:2.4s"><i>✓</i><b>GitHub Pages 自動部署</b><em>驗證通過才上線</em></div>
  <div class="ci seq" style="--d:2.55s;border-bottom:none"><i>✓</i><b>離線 ZIP 備援</b><em>2.6 MiB · 一鍵啟動</em></div>
 </div>
 <div class="sub in" style="--d:3.1s;margin-top:40px;font-size:32px">React 19 &middot; Phaser 4 &middot; TypeScript &middot; Vite</div>
""")

# ══════════ CTA ══════════
scene("scene21_cta", "S21 CTA", 10, particles=True, tone="default", css="""
.lnk{font-size:34px;color:rgba(232,238,247,.82);letter-spacing:.03em}
.lnk b{color:#7ff0df;font-weight:800}
.sig{font-size:26px;color:rgba(232,238,247,.5);letter-spacing:.16em;margin-top:14px}
""", content="""
 <div class="kicker in" style="--d:.2s">OPEN SOURCE PROJECT</div>
 <div class="h1 pop" style="--d:.6s;margin-top:30px;font-size:122px;line-height:1.08">Offshore Wind<br>Masters</div>
 <div class="row" style="margin-top:48px;gap:24px">
  <div class="chip pop" style="--d:1.7s">課程評量</div>
  <div class="chip pop" style="--d:1.9s">工程實作</div>
  <div class="chip pop" style="--d:2.1s">遊戲化決策</div>
 </div>
 <div class="lnk mono in" style="--d:2.7s;margin-top:54px">github.com/<b>dofliu/windFarmOMII</b></div>
 <div class="lnk mono in" style="--d:2.95s;margin-top:12px">dofliu.github.io/<b>windFarmOMII</b></div>
 <div class="sig in" style="--d:3.4s">國立勤益科技大學 &middot; NCUT-OWM-2026</div>
""")

print("scenes written:", len(sorted(OUT.glob("scene*.html"))))
