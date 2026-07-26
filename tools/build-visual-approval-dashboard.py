"""Build a local, non-promoting visual approval dashboard from the ledger."""

from __future__ import annotations

import html
import json
import os
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "assets/source-art/qa/visual-approval-ledger-2026-07-24.json"
SCENES = ROOT / "json/sceneAssets.json"
OUTPUT = ROOT / "assets/source-art/qa/visual-approval-dashboard-2026-07-24.html"


TEMPLATE = r'''<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OWM Visual Approval Dashboard</title>
<style>
:root{color-scheme:dark;--bg:#0c1821;--panel:#142936;--line:#315466;--ink:#e9f3f4;--muted:#9fc0c5;--gold:#f3c86b;--teal:#49d2c6;--red:#f28d87}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(135deg,#0c1821,#102f3b);color:var(--ink);font:14px/1.45 system-ui,"Noto Sans TC",sans-serif}main{max-width:1500px;margin:0 auto;padding:22px}h1{font-size:25px;margin:0 0 4px;color:var(--gold)}h2{font-size:16px;margin:0 0 8px}p{margin:4px 0;color:var(--muted)}.notice{border:1px solid #806c36;background:#2a291e;padding:12px 14px;border-radius:10px;margin:14px 0;color:#f6dda2}.toolbar,.summary,.card{background:rgba(20,41,54,.94);border:1px solid var(--line);border-radius:10px}.toolbar{display:flex;gap:8px;flex-wrap:wrap;padding:12px;margin-bottom:12px}.toolbar button,.toolbar select,.toolbar input,.card select,.card input{background:#0d202b;color:var(--ink);border:1px solid var(--line);border-radius:7px;padding:8px 10px}.toolbar button{cursor:pointer}.toolbar button.active{border-color:var(--teal);color:var(--teal)}.toolbar .export{margin-left:auto;border-color:var(--gold);color:var(--gold)}.summary{display:flex;gap:18px;flex-wrap:wrap;padding:10px 12px;margin-bottom:12px}.metric b{color:var(--gold);font-size:18px;margin-right:4px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:10px}.card{padding:12px}.card.approved{border-color:#3ebfac}.card.rejected{border-color:var(--red);opacity:.82}.id{font-size:16px;font-weight:700;color:var(--gold)}.meta{color:var(--muted);font-size:12px;margin:2px 0 7px}.links a{color:var(--teal);margin-right:10px;font-size:12px}.decision{display:flex;gap:6px;margin-top:9px}.decision select{flex:0 0 120px}.decision input{flex:1;min-width:0}.empty{padding:25px;color:var(--muted);text-align:center}.count{margin-left:auto;color:var(--muted)}
</style></head>
<body><main>
<h1>OWM Visual Approval Dashboard</h1><p>Scene candidates + P01 production candidates · read-only runtime gate</p>
<div class="notice"><b>重要：</b>本頁只記錄人工視覺判定。下載的 ledger 需人工確認後再放回 workspace；approved 不會自動 promotion，也不會覆蓋遊戲 runtime art。</div>
<div class="summary" id="summary"></div>
<div class="toolbar"><button class="active" data-kind="scene">Scene</button><button data-kind="p01">P01 production</button><input id="search" placeholder="搜尋 ID／Batch" aria-label="搜尋"><select id="batch"><option value="">全部 Batch</option></select><button class="export" id="export">下載目前 ledger JSON</button><span class="count" id="count"></span></div>
<section class="grid" id="cards"></section>
</main>
<script id="ledger" type="application/json">__LEDGER_JSON__</script>
<script>
const ledger=JSON.parse(document.getElementById('ledger').textContent);let kind='scene';
const cards=document.getElementById('cards'), search=document.getElementById('search'), batch=document.getElementById('batch'), count=document.getElementById('count');
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const items=()=>kind==='scene'?ledger.sceneCandidates:ledger.p01ProductionCandidates;
function fillBatches(){const values=[...new Set(items().map(x=>x.batchId).filter(Boolean))];batch.innerHTML='<option value="">全部 Batch</option>'+values.map(x=>`<option>${esc(x)}</option>`).join('')}
function renderSummary(){const s=ledger.summary;document.getElementById('summary').innerHTML=`<span class="metric"><b>${s.sceneCandidates}</b> Scene</span><span class="metric"><b>${s.scenePending}</b> Scene pending</span><span class="metric"><b>${s.p01ProductionCandidates}</b> P01 production</span><span class="metric"><b>${s.p01Pending}</b> P01 pending</span>`}
function render(){const q=search.value.trim().toLowerCase(),b=batch.value;const visible=items().filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!b||x.batchId===b));count.textContent=`${visible.length} / ${items().length}`;cards.innerHTML=visible.map((x,i)=>{const id=kind==='scene'?x.sceneId:x.characterId;const links=kind==='scene'?`<a href="${esc(x.filePath||x.file)}" target="_blank">runtime候選</a>`:`<a href="${esc(x.productionPath||x.productionFile)}" target="_blank">production</a><a href="${esc(x.activePath||x.activeFile)}" target="_blank">preview</a>`;return `<article class="card ${esc(x.decision)}" data-id="${esc(id)}"><div class="id">${esc(id)}</div><div class="meta">${esc(x.batchId||'Scene')} · ${esc(x.qaStatus||x.productionResolutionStatus||'')}</div><div class="links">${links}</div><div class="decision"><select aria-label="${esc(id)} decision"><option ${x.decision==='pending'?'selected':''}>pending</option><option ${x.decision==='approved'?'selected':''}>approved</option><option ${x.decision==='rejected'?'selected':''}>rejected</option></select><input aria-label="${esc(id)} note" placeholder="備註" value="${esc(x.note)}"></div></article>`}).join('')||'<div class="empty">沒有符合條件的候選。</div>';cards.querySelectorAll('.card').forEach(card=>{const id=card.dataset.id,x=items().find(v=>(kind==='scene'?v.sceneId:v.characterId)===id);card.querySelector('select').addEventListener('change',e=>{x.decision=e.target.value;card.className=`card ${x.decision}`;syncSummary()});card.querySelector('input').addEventListener('input',e=>x.note=e.target.value)})}
function syncSummary(){const s=ledger.summary;for(const [arr,prefix] of [[ledger.sceneCandidates,'scene'],[ledger.p01ProductionCandidates,'p01']])for(const d of ['pending','approved','rejected'])s[`${prefix}${prefix==='p01'?'': ''}${d[0].toUpperCase()+d.slice(1)}`]=arr.filter(x=>x.decision===d).length;/* download recalculates exact keys below */}
function recalc(){const sets=[[ledger.sceneCandidates,'scene'],[ledger.p01ProductionCandidates,'p01']];for(const [arr,prefix] of sets){ledger.summary[`${prefix}Pending`]=arr.filter(x=>x.decision==='pending').length;ledger.summary[`${prefix}Approved`]=arr.filter(x=>x.decision==='approved').length;ledger.summary[`${prefix}Rejected`]=arr.filter(x=>x.decision==='rejected').length}}
document.querySelectorAll('[data-kind]').forEach(btn=>btn.addEventListener('click',()=>{kind=btn.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===btn));fillBatches();render()}));search.addEventListener('input',render);batch.addEventListener('change',render);document.getElementById('export').addEventListener('click',()=>{recalc();ledger.updatedAt=new Date().toISOString();const blob=new Blob([JSON.stringify(ledger,null,2)+'\n'],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='visual-approval-ledger-reviewed.json';a.click();URL.revokeObjectURL(a.href)});renderSummary();fillBatches();render();
</script></body></html>'''


def relative_path(path_value: str, base: Path) -> str:
    if path_value.startswith("/assets/"):
        target = ROOT / "public" / path_value.lstrip("/")
    else:
        target = ROOT / path_value
    return Path(os.path.relpath(target, base)).as_posix()


def main() -> None:
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    scene_assets = json.loads(SCENES.read_text(encoding="utf-8"))
    by_scene = scene_assets.get("items", {})
    for item in ledger["sceneCandidates"]:
        item["filePath"] = relative_path(by_scene[item["sceneId"]]["file"], OUTPUT.parent)
    for item in ledger["p01ProductionCandidates"]:
        item["productionPath"] = relative_path("assets/source-art/" + item["productionFile"], OUTPUT.parent)
        item["activePath"] = relative_path("assets/source-art/" + item["activeFile"], OUTPUT.parent)
    payload = json.dumps(ledger, ensure_ascii=False).replace("<", "\\u003c")
    OUTPUT.write_text(TEMPLATE.replace("__LEDGER_JSON__", html.escape(payload, quote=False)), encoding="utf-8")
    print(f"Visual approval dashboard built: {OUTPUT}")


if __name__ == "__main__":
    main()
