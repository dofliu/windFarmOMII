# Course Mode automated evidence

本目錄目前兩個 2026-08-03 檔案是 automated student-agent flow 的 legacy v1 診斷證據，不是 3–5 位真人學生 pilot，也不代表學習成效。

| 檔案 | SHA-256 | 證據界線 |
| --- | --- | --- |
| `OWM_COURSE_RECORD_STUDENT_FULL_RUN.json` | `E22355A3BDBE4DE4EE574C34851960243D336BA305199E1B3C08DC595DBDA485` | schema v1；可重建 16 attempts 的 settlement outcome，但 event provenance 未驗證 |
| `OWM_Course_Mode_學生全流程測試報告_2026-08-03.docx` | `F75EA434D777BD213768C2336A6EEC6611B0ECCCEB445AC8005B215BD085D0AF` | Automated Course Flow report；原標題與時區待重產時修正 |

摘要指令：

```powershell
pnpm course:summary -- reports/OWM_COURSE_RECORD_STUDENT_FULL_RUN.json
```

工具會從 `MISSION_SETTLED` 重建 `success`／`round`，並將 legacy provenance 標成 warning，不再讀取不存在的 `attempt.outcome`。

摘要欄位 `integrityPassed=true` 只表示檔案結構與 evidence-integrity checks 沒有 `ERROR`；不代表任務成功、學生及格、理解或學習成效。各任務結果仍須查看 attempts 內的 `success`、score 與 grade。

同理，未來 native v2 export 的 `integrityOrigin=native_v2` 與 `integrityPolicy.schemaEvidenceEligible=true` 只表示 client-local schema、provenance 與 export gate 一致，並會明列 `authenticity=CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT`。它不提供 tamper evidence、學生身分綁定或可信任的 submission receipt，不可單獨證明正式成績真實性；正式評量資料必須經 instructor-controlled receipt，或由 signed/server-side collection 接收並保留可驗證收據。
