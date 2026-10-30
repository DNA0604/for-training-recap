# Changelog

## 2026-10-30 — persistent four-hour login and request-scoped read deduplication
- User selected an absolute four-hour session including closed web pages, with no 30-minute idle logout. Added browser persistent storage with tab/memory fallback, server metadata independent of cache eviction, durable logout markers, cross-tab logout/account-change handling and preserved live scope/revocation checks.
- Deduplicated values/formulas within allowlisted read requests only; new requests read afresh and lock-time rechecks discard the old snapshot. Operational write paths remain uncached. Local fixture data-range reads fall from 30 to 13 for Beranda and 26 to 14 for Monitoring; no claim of measured Google latency improvement.
- Replace Akses.gs, Code.gs and Jenjang.gs together. No new source/book/setup. Passed 351 backend tests, source/generated parsing/IDs/hashes and mocked Chromium persistence/expiry plus prior app/evaluation/leave/access flows. No real Google writes/deployment/main merge. Guide: docs/LOGIN_PERSISTEN_PEMUATAN.md.

## 2026-10-30 — Panitia evaluation accepted by user
- User confirmed “sip, sudah aman” and requested login/loading next, postponing other work. Accepted cumulative application baseline: e7cfaa7 on feat/evaluasi-peserta-panitia. Specific live checks were not enumerated; do not claim exhaustive unrelated fault/Google coverage.

## 2026-10-30 — Panitia evaluates participants after each session
- Added the user's three aspects (discipline, cooperation, initiative), integer 1–5 per participant/session, optional comments and no dependency on detailed behavior notes or attendance. Writes open after scheduled session end, including active programs; Pengajar is denied, Admin/Petugas follow live Jenjang access.
- A shared assessment retains verified actor and before/after history, source/row versions, batched idempotent retries and conflict protection. Added a scroll/sticky-header/X modal action in Ringkasan Sesi and Admin recap action. Existing teacher/instructor evaluation and JP/scoring remain separate.
- Lazily adds Evaluasi_Peserta_Panitia and manual Rekap_Evaluasi_Panitia on the connected evaluation file, preserving deleted-source history, blank grades and no aggregate/final weights. Replace Evaluasi.gs and Akses.gs together; no new source/setup/book.
- Passed 337 backend tests (17 new cases), generated/source parsing/IDs/hashes and mocked Chromium new and prior role/evaluation/leave/app/indicator flows. No real Google writes/deployment/main merge. Guide: docs/EVALUASI_PANITIA.md.
## 2026-10-30 — leave without attendance accepted by user
- User confirmed installing/updating and testing the latest package, with all normal. Accepted cumulative application baseline: e4a20e5 on feat/izin-peserta-tanpa-presensi. The specific exercised live/fault cases were not enumerated; do not claim exhaustive verification of unrelated indicator/JP/upload paths.
- Documentation only. No application/source-hash changes, replacement files or deployment needed. Pending institution work remains persistent login, measured loading optimization and CSV columns awaiting a sample.

## 2026-10-30 — leave notes for participants without attendance
- Removed the web picker/save/upload dependency on an existing attendance row. Admin/scoped Petugas may record partial or full-session leave for active participants; Pengajar remains denied. Added a fill-session-times button and clearer leave guidance.
- No synthetic attendance/scans or automatic JP. Notes use the existing session/membership relationship; later attendance calculations already match it. Existing attendance keeps version checks and JP invalidation. Pair-bound evidence, scope/revocation checks, same-interval duplicate prevention and pending audit checks cover unscanned targets.
- Replace Code.gs, Akses.gs and Index.html together; includes 69ceb08 indicator-status fix. No new schema/setup/files. Passed 320 backend tests (12 new regressions), source/generated parsing/IDs/hashes and mocked Chromium Admin/staff desktop/mobile plus prior app/access/indicator flows. No real Google writes or deployment. Guide: docs/IZIN_TANPA_PRESENSI.md.

## 2026-10-30 — indicator status edits no longer parse unrelated legacy rules
- User confirmed new-indicator deletion but reported Konfigurasi aturan penilaian tidak valid when disabling MAKAN_SAAT_SESI. Reproduced the failure with malformed/blank historical rule configuration: indicator edit parsed every rule even when definition/type were unchanged. The exact live rule row was not supplied.
- Check note/rule usage only when changing definition/type. Status and default-point edits preserve all stored rules/notes/grades, with IZIN_SESI, type/sign, duplicate-active-code, permissions, stale versions and audit/retry protections retained. Meaning changes and deletion still require their existing reference checks.
- Replace Code.gs only after the preceding two-file indicator package. Passed 308 backend tests (eight new regressions) plus all source script parsing/HTML IDs. No Google writes, schema/legacy data repair, UI change or deployment performed.

## 2026-10-30 — protected deletion of unused behavioral indicators
- Added Admin indicator selection/deletion inside the existing Add/Edit modal, with usage proof, reason/acknowledgement and separate final confirmation. Default indicators and references in any program/rule/history/connected file remain protected; Nonaktif remains available.
- Reused the audited backup/resume transaction, rechecked usage under lock and reserved retired IND IDs. No cascading note/rule/score/JP changes. Failed refresh keeps the result unconfirmed until a fresh catalog is available.
- Replace Hapus.gs and Index.html together. Passed 300 backend tests and mocked Chromium indicator/retry/recovery plus existing app/evaluation/deletion regression checks. No Google data/deployment/main changes. Guide: docs/HAPUS_INDIKATOR.md.

## 2026-10-30 — access dashboard accepted by user
- User confirmed all behavior normal and requested the next stage. Accepted application baseline: 8e9a01b on ui/manajemen-akses-dashboard. This records reported acceptance without claiming exhaustive live fault/Google cases.

## 2026-10-30 — dashboard shell for web Manajemen Akses
- Added ManajemenAkses.html with the accepted institutional header/sidebar, active access navigation and responsive cards, reusing existing owner directory forms/handlers from Akses.gs without a Beranda data loader. Native owner setup/recovery panel and server permissions remain.
- Scoped directory busy controls, retained sidebar interaction, preserved /dev+/exec and Program/Jenjang/session context on navigation, and made the auth overlay usable after logout from an open mobile drawer. No account/session policy changes.
- Add HTML ManajemenAkses and replace Akses.gs together. Passed 283 backend tests, 66 source/generated script parses/IDs and mocked Chromium web/native directory, sidebar/navigation/mobile/logout and prior role/evaluation/recap regressions. No Google data/deployment/main changes.

## 2026-10-30 — Admin-to-Pengajar evaluation accepted by user
- User confirmed implementation and normal behavior. Accepted application baseline: 7683452 on feat/evaluasi-pengajar-admin. Marked the requested feature completed while distinguishing reported acceptance from unenumerated live/fault cases.
- Documentation only; no application/hash changes, replacement files or deployment needed.

## 2026-10-30 — Admin evaluation of Pengajar per session
- Implemented the agreed five aspects on integer 1–5, with optional comments, verified Admin identity, before/after history, source/row versions and idempotent retry. Pengajar/Petugas cannot read/write instructor assessments. No weights/final grade.
- Added the Admin session-summary action/modal and a lazily initialized Evaluasi_Pengajar journal on the existing evaluation file; legacy/empty journals remain compatible. Existing manual recap adds Rekap_Evaluasi_Pengajar with current and retained historical/deleted-source values.
- Replace Evaluasi.gs and Akses.gs together. Passed 283 backend tests, mocked Chromium Admin/Teacher/Staff plus prior app/directory regressions and parsing/IDs. No Google data/deployment or main merge performed.

## 2026-10-30 — connected spreadsheet recap accepted by user
- User confirmed the recap matches expectations. Accepted application baseline is a8f9e16 on feat/rekap-penilaian-spreadsheet. Recorded user acceptance separately from local mocked checks and unexercised live cases.
- Updated pending institution-request statuses and the proposed next discussion. Documentation only; no source/hash changes, replacement files or deployment needed.

## 2026-10-29 — readable evaluation and integrated behavior recap in connected spreadsheet
- Added owner/Admin manual full-file recap to the existing evaluation file: readable latest/history score rows, behavior/leave detail, active participant-session integrated view and snapshot status metadata. Blank grades, note validation states, Program/Jenjang scope and previous teacher history remain distinct; no new combined scoring formula.
- Added owner spreadsheet menu and Admin evaluator-dialog refresh/file link. Shared-lock checks, bounds, sheet-ID ownership, literal text/NIP, verified writes, source fingerprints and failure/retry status protect derived publication; operational/access/journal sources remain unchanged.
- Replace Evaluasi.gs, Akses.gs and Code.gs together. Passed 266 backend tests and mocked Chromium evaluation/owner/app regressions; source parsing/IDs/hashes checked. No Google deployment, trigger or real data write performed.

## 2026-10-29 — UI refinement accepted by user
- User reported installing UI 0d376d2, running several tests with good results, and considering the requested refinement sufficient. Recorded their exercised checks separately from local mocked verification; no new deployment/file change was needed for acceptance.

## 2026-10-29 — refine evaluation dialogs and session actions
- Moved Pengajar/Admin evaluation actions into Ringkasan Sesi, removed the bottom evaluation card, and added the assigned teacher name for Admin/Pengajar/Petugas on the existing scoped attendance response.
- Bounded evaluation table scrolling with sticky headings/participant names, persistent footer actions and an upper-right X; unsaved drafts and write/retry guards remain.
- Replaced the bottom teacher assignment card with a program-filtered modal beside Add Session. Removed manual reason entry; automatic before/after audit remains.
- Moved Program/Sesi trash icons into Edit, preserving dependency preview, delete reason/acknowledgement/final confirmation and recovery; draft edits require confirmation before switching.
- Replace Evaluasi.gs, Code.gs, Index.html and Pengelolaan.html together. Passed 249 backend tests and mocked Chromium evaluation/deletion/app/Jenjang suites; no Google setup, data writes or deployment performed.

## 2026-10-29 — scoped Pengajar role and six-aspect participant evaluation per session
- Added Pengajar registration and one-teacher-per-session assignment. Live session/Jenjang scope and a fixed teacher allowlist cover reads and evaluation writes; other sessions in the same Jenjang stay excluded. Admin/Petugas flows remain.
- Added Evaluasi.gs (backend, owner setup and injected UI) using an owner-owned evaluation spreadsheet separate from operational/access files. Append-only before/after events, source/row versions and idempotent requests preserve history and avoid repeated grade writes.
- Teacher evaluates participants per session on six agreed aspects using integer 1–5, up to 20 participants per save. Admin views results/history. No weighting/final grade, legacy data migration or Admin-to-instructor assessment is added.
- Add Evaluasi.gs and replace Akses.gs, Code.gs, Jenjang.gs, Pengelolaan.html together. 246 Node tests and actual-renderer Chromium Teacher/Admin plus existing regression suites pass with mocked Google. Agent did not deploy or modify Google data; user setup/live checks remain.

## 2026-10-29 — restore indicator edit controls and move Add to the heading
- Fixed Edit / Ubah Status staying disabled after asynchronous score loading; controls now synchronize indicator row buttons after load/save/program changes.
- Moved Tambah Indikator Baru to the upper-right Nilai Sikap & Perilaku header beside Muat Ulang Nilai. Only Index.html application source changes; no grading/rule/schema/delete/access/session changes.
- Recorded institution feature requests and open decisions for role/teacher assignment, separate evaluation storage, CSV, persistent login and performance. These larger requests are pending, not implemented by this UI fix.

## 2026-10-28 — import into dedicated for-training-recap repository
- Copied all 75 tracked application-folder files from DNA0604/anti-slop commit 4d64d49 byte-for-byte, including 14 application sources, manifest reference, tests, guides and historical previews.
- Preserved the destination README notice, added project context/instructions, npm test entry point and source-hash provenance. Paths and application behavior remain unchanged; original repository, Google database and deployment remain intact.
- Destination validation: 75 import hashes, 14 source hashes, 220 backend tests, local Markdown links and Chromium app/directory/proof suites passed with mocked Google.
- Import is on import/monitoring-pelatihan; destination main is preserved for review. Historical source commit references remain associated with anti-slop.

## 2026-10-28 — move Monitoring verification below the data
- Moved Verifikasi Sesi from the top of Monitoring to the bottom, immediately before Pengajuan Koreksi Lama, so filters and monitoring data appear first. Only Akses.gs application source changes; existing login, actions, permissions and sidebar are preserved.
- Checked desktop/mobile DOM order and the existing Chromium app regression suite with mocked Google. Replace Akses.gs and update the same deployment; no schema/data changes or agent Google deployment.

## 2026-10-28 — one app URL and one Google login action
- Ordinary login automatically prepares a user-clicked Google link; the authenticated callback opens protected Beranda in-place after the existing server verification/session check. Removes normal prepare/continue/open-app stages without automatic top-frame navigation. Existing sessions bypass the login card.
- Added a copyable app-entry URL in access management and separated optional owner identity diagnostics from staff login. Account/assignment forms and storage, auth/session/permission checks, accepted verification and sidebar stay unchanged.
- Replace Akses.gs only and update the same deployment. Passed 220 backend tests, 61 source/generated script parses/IDs, source hashes and expanded actual-renderer Chromium app/directory/proof checks with mocked Google. Live OAuth/HTMLService behavior still needs user validation; no agent Google changes or guaranteed processing-time reduction.

## 2026-10-28 — session verification update accepted by user
- User confirmed the installed update, rejection/resubmission, stale-data approval prevention, and the proposed QR → correction → leave/behavior → session verification → JP → recap/profile regression with the expected outcomes.
- Record the session verification/direct-correction update as completed and user-accepted at application source 3064b70. This is user-reported verification of the exercised flows, not independent logs or a claim of live fault-injection/load/report tests.
- Documentation-only acceptance record; all application sources/snapshots remain unchanged. No replacement files, migration, activation or deployment needed; agent made no Google changes.

## 2026-10-28 — session verification packets and direct staff corrections
- User confirmed the agreed role/Jenjang login/isolation/shared-data/revocation tests, then requested direct staff corrections and collective Admin verification covering attendance, leave and behavior per session/Jenjang.
- Staff corrections now use the existing scoped/audited write immediately, marked pending validation. Added Monitoring packet preview/submission/review/approve/reject with reasons, stale-data detection and unchanged scan/JP rules. Legacy correction requests remain reviewable.
- Verified chunked approval plans in the separate access journal support safe resume and lost-receipt checks; partial approval blocks coordinated operational writes. Incomplete attendance and previously rejected notes retain their appropriate status; no new tabs/columns/files or automatic points/JP calculation.
- Replace Akses.gs, Code.gs, Hapus.gs and Index.html together. Passed 215 backend tests, generated-app desktop/mobile and prior Jenjang/directory browser checks, source/generated syntax/IDs and snapshots. Agent did not change/deploy Google data; live packet workflow needs user testing.

## 2026-10-28 — fix selected-Jenjang page-not-found navigation
- Reproduced a 404 after selecting a Jenjang: four sidebar builders appended `&jenjang=...` to `/exec` before `?page`, corrupting the deployment path. Keep the base path separate and append the Jenjang once in the query. Profile navigation also stops mixing Jenjang into the program ID and preserves it on content back links.
- Replace Index.html, Pengelolaan.html, Peserta.html and Profil.html together on the existing deployment. No backend/auth/data/schema/sidebar animation changes; retain the prior Akses.gs transition update.
- Tightened Chromium mock routing to return 404 for malformed deployment paths (previous mocks accepted any path). New test failed before the fix with Page not found, passed after; added staff desktop/mobile profile round trips, Admin management round trips and /dev preservation. Existing 196 backend tests and Jenjang browser suite pass. Actual Google deployment remains for user validation.

## 2026-10-27 — neutral loading transition with sidebar animation preserved
- User Admin video shows existing-session navigation and logout display. Startup checks had shown a login button while pending; replaced that display with a page-specific spinner/skeleton and short fade, with reduced-motion support. Login appears for missing/expired sessions, retry for temporary failures/held access, and a Beranda link for a denied page.
- Only Akses.gs application source changes. Sidebar/navigation HTML and all server session/permission functions remain identical to ed7d655; no SPA or cached-identity shortcut. Retry preserves page context without copying token/code parameters, and expiry cancels an in-progress fade so protected data stays covered.
- Passed existing 196 backend tests and expanded Chromium desktop/mobile/slow/error/reduced-motion/expiry checks plus prior application navigation/sidebar/logout flows. Replace Akses.gs and update the same deployment version; no new files, migration, configuration or agent Google deployment.

## 2026-10-27 — application login and role/Jenjang enforcement (opt-in)
- Added Google-backed application sessions, logout/expiry, live account/assignment checks, a fixed RPC gateway and direct operational endpoint guards. Shared server-injected bridge preserves page contracts; sidebar shows verified identity, role-specific menus and Admin access management. Native owner controls activation/OAuth and retains recovery access.
- Scoped staff dashboards, statistics, session/participant/profile/JP/behavior reads and QR/evidence/leave/behavior writes. Admin retains full operational features. Staff corrections are audited requests reviewed by Admin with stale/relationship checks, original scans preserved and receipt confirmation without duplicate writes; uncertain transactions remain blocked for review.
- Unified server database fallback across GS modules. Active login uses selected deployment for new QR/navigation links while public attendance remains token-based. Fixed Monitoring correction buttons remaining disabled after data loading. Seven complete existing application files require replacement; no new sheets/files or migrations. Activation checks package features before switching on.
- Passed 196 Node tests (47 new), 57 script syntax/ID checks and Chromium checks of actual injected HTML plus prior directory/Jenjang suites, plus installation/role/recovery documentation and synthetic previews. Previous identity-only login is user-verified; new application sessions and permission enforcement still require Google-copy checks. Agent did not deploy, activate or modify live Google data.

## 2026-10-27 — user verifies Admin and Petugas Google identity results
- User screenshots after the URL correction show a verified Admin Pelatihan and a separate verified Petugas Kelas Pelatihan assigned to Pelatihan Sosial Kultural 1 · Jenjang 1. Record successful user-observed login/role/scope display for these two paths; no personal account identifiers copied into the repository.
- Main-app sessions and server-side role/Jenjang enforcement remain the next stage. Rejection/revocation and broader live regression checks are not established by these screenshots. Documentation-only update; no code replacement, deployment or Google data changes performed by the agent.

## 2026-10-27 — select the deployed URL for Google login proof
- User reported Google Drive opening failure and supplied a Manage deployments URL different from the panel target. Added owner-editable canonical /exec URL in Akses.gs; saved callback overrides automatic service discovery and drives the test link, authorization and code exchange consistently. No user URL hardcoded.
- Preserve existing directory/credentials, reject invalid host/path/query URLs, hide the old link during unsaved edits, and reject pending login states after callback changes. Only Akses.gs must be replaced for an installed stage 3. Update OAuth redirect URI and the selected deployment version on a copy.
- Passed 149 backend tests (4 new regressions) and generated-panel Chromium desktop/mobile checks including callback save/link consistency. Google live deployment/permissions/consent/storage remain unverified; no Google data or deployment changed.

## 2026-10-27 — separate organizer access directory and Google identity proof
- Added one Script Akses.gs with embedded owner panel: separate-spreadsheet setup/bootstrap, account roles/status, multi-Jenjang assignments, audit/versioned idempotent writes and pending recovery. No operational data copied or application permissions broadened.
- Added optional Google identity proof using server code exchange with PKCE/state/nonce/browser binding and userinfo checks, active-directory/sub matching and valid scope filtering; client secret stays in server properties. The proof issues no main-app session and does not activate staff RBAC/login placeholders.
- Owner setup also saves a server-only main-database pointer for callbacks without active spreadsheet context. Code.gs adds a guarded spreadsheet menu and dedicated proof/callback routing, preserving public QR priority and existing page routes. Other 12 application sources remain byte-identical to the consolidated Jenjang baseline.
- Added 32 backend cases (145 total), generated-panel Chromium checks, configuration/recovery guide and simulated previews. Snapshot now contains 14 files. Owner must configure/test a Google OAuth Client on a copy; no live Google files, deployments or data were changed from this environment.

## 2026-10-27 — one-file Jenjang installation
- Combined Jenjang runtime, migration backend and embedded migration HTML into one Script Jenjang.gs. Removed MigrasiJenjang.gs/MigrasiJenjang.html from the active bundle, resolving the separate same-name file installation issue and reducing three new files to one.
- Preserved menu/RPC names, panel HTML byte-for-byte, schema, backups/guards and behavior. All other retained application sources remain identical to structural baseline 8f15cba; no Google operations/deployment performed.
- Added owner/embedded-opener checks (113 backend tests) and changed the modern browser suite to render the actual HTML returned from GS. Updated installation/cleanup guidance and snapshot to 13 files.

## 2026-10-27 — Jenjang structure and reviewed migration on a copy
- User confirmed the preview opens and shared dummy inventory (3 programs, 4 sessions, 41 memberships, no detected relationship issues). Recorded Dasar / Umum / Jenjang 1 as the working mapping.
- Added Jenjang.gs and a spreadsheet-menu migration panel with reviewed mapping, source fingerprints, verified chunked audit backups, schema-state guards and resumable writes that preserve old IDs/values/formulas/history. Initial migration supports one Jenjang per old program on a separate copy; no Google migration/deployment performed here.
- Added audited Jenjang creation/renaming and initial Jenjang for new programs, destination fields for sessions/import, participant filtering, program/Jenjang/session Monitoring, Jenjang navigation context and per-membership Profile/JP/report obligations. QR/notes/evidence and mutation guards reject inconsistent relationships. CSV includes Jenjang ID; grading formulas and program rule versions remain.
- Extended program deletion to include its Jenjang, preserve other groups and reserve deleted JEN numbers. Retained accepted deletion confirmation/recovery, sidebar animations and public attendance design.
- Added 29 backend integration tests (112 total) and modern Chromium workflow checks; existing deletion/preview browser regressions pass. Added full installation/recovery/Google-copy validation guide and simulated previews. Gmail login, organizer roles and separate access spreadsheet are not implemented.

## 2026-10-27 — open Jenjang preview from spreadsheet menu
- User reported Cannot call SpreadsheetApp.getUi() from this context when opening from the editor. Added a guarded Pratinjau Pemetaan Jenjang item to the existing Manajemen Pelatihan menu in Code.gs/onOpen; use the menu after reloading the bound spreadsheet, without entering a spreadsheet ID.
- Preview opener gives actionable context guidance when getUi is unavailable. Owner checks and read-only loader are unchanged; no trigger, scope, deployment or data changes. Existing menu choices still work if the optional preview file is absent.
- Added two reproductions/menu tests (83 backend tests total). Replaced earlier editor-run installation guidance throughout the docs. Local tests cannot establish the exact reason UI context was unavailable in the user's project; live menu/dialog verification remains pending.

## 2026-10-27 — read-only Jenjang mapping preview
- Added optional PemetaanJenjang.gs and PratinjauJenjang.html: owner-only spreadsheet dialog with legacy Jenjang proposals, session/membership details, review states, physical-row diagnostics, search/filter/pagination and source fingerprint.
- Reads under ScriptLock; validates key relationships/duplicates, partial Jenjang references and latest explicit transaction status. Missing/oversized sources fail instead of producing partial counts. Unknown program references are global blockers; blank-status audit rows do not reopen/close transactions.
- No migration/apply/write/export endpoint, new sheets/columns, auth implementation or Google deployment. The ten accepted application files, formulas, deletion, sidebar/navigation and manifest are unchanged. Two added files are included in the source snapshot.
- Added 26 meaningful backend tests (81 total), mocked Chromium checks at desktop/320/390/768 px, installation/validation guide and simulated-data preview images. Live Google dialog/authorization/data checks remain for the separate project copy.

## 2026-10-27 — stage 1 Jenjang and organizer access design
- Reviewed the current program/session/membership, QR, recap/report and deletion relationships; recorded the approved Program → Jenjang → Sesi and two-role direction, personal Gmail constraint and separate access spreadsheet.
- Added Indonesian stage-1 design with a minimal target schema, legacy-data mapping cases, ambiguity/transaction safeguards, staged migration/recovery, affected flows, access matrix and acceptance checks.
- Source review/design only: no application/schema changes, live-data mapping, migration, authentication implementation or deployment. Next unit is a read-only mapping preview for a separate test copy; ten accepted application files and source hashes remain unchanged.

## 2026-10-27 — deletion feature accepted and completed
- User confirmed implementing/deploying the latest update, running tests with the expected results, and declaring the deletion feature complete.
- Accepted application source: ae1622a on fix/transaksi-penghapusan, including trash icons, final confirmation without typed IDs and the transaction-blocker fix.
- Recorded user verification separately from prior local/mock checks. This acceptance does not claim exhaustive testing of unrelated features or native Google Docs export. Documentation only; no application changes or new deployment needed.

## 2026-10-27 — fix false/global transaction locks before deletion
- Corrected latest-explicit audit status handling: legacy blank-status rows do not become new locks or overwrite a real status; terminal statuses normalize whitespace/case. Diagnostic reads preserve the audit unchanged.
- Scoped non-delete blockers to relevant programs/IDs and audit-plan references; unrelated transactions no longer freeze all deletion. Unknown/corrupt/incomplete scope and active deletion transactions remain blocked. Apply repeats the check after preview.
- Added specific blocker IDs/statuses/physical audit rows and existing recovery advice to errors; Pengelolaan/Peserta show a combined read-only transaction diagnostic card and navigation. Existing trash icons and final confirmation remain.
- Added 11 backend reproductions/regressions (55 total passing) and browser diagnostic/error checks. Live spreadsheet rows were not available; no specific production transaction was changed and no deployment was performed.

## 2026-10-27 — simpler deletion confirmation and trash icons
- Removed the typed target-ID field from initial and pending-delete dialogs in Pengelolaan/Peserta; selected IDs are supplied internally through the unchanged RPC payload.
- Replaced table deletion text buttons with accessible inline trash icons and 44 px click areas.
- Added a final native confirmation popup with target/scope, Batal as initial focus, and explicit Ya, Hapus Data / Ya, Lanjutkan. Cancel/Escape preserve the form without a delete request; repeated submissions are guarded and retry payloads remain stable.
- Preserved backend access, stale-data, pending-transaction and audit protections; only two HTML files need replacement after the previous deletion feature. Mocked browser checks cover keyboard, cancellation, confirmation, errors/retry and mobile layout.

## 2026-10-27 — program/session/participant deletion
- Added owner-only Hapus.gs: dependency preview, confirmation/reason, child-first physical cascade, verified chunked backups in existing audit sheet, request idempotency and resumable pending deletion.
- Pengelolaan exposes Hapus program/Hapus sesi; Peserta exposes Hapus dari program and a separate whole-database identity search including participants without memberships. Identity deletion requires zero memberships; shared people/other programs are protected.
- Retained audit backups, scoring rules, indicator catalog and Drive evidence. No new sheet/columns and no automatic restore UI. Unknown-sheet references, duplicates, conflicting links, stale preview and unfinished transactions block deletion.
- Added pending guards under existing mutation locks, owner checks to five legacy mutations, retired numeric-ID maxima in ScriptProperties, and a coordinated/guarded report snapshot read. Existing sidebar/navigation and JP/behavior formulas remain unchanged.
- Added 18 meaningful deletion tests (44 total passing), browser checks at desktop/mobile, installation/recovery instructions and previews. Validation uses service mocks; live Google deletion/auth/quotas still require testing on a separate project/spreadsheet copy. No production data changes or deployment performed.

## 2026-10-25 — completed-program evaluation PDF
- Added owner-protected Laporan.gs with preview and PDF endpoints, strict completed-program checks before/after generation, read-only aggregation, existing JP/behavior snapshots and native Google Docs/Charts rendering.
- Formal PDF contains program identity, executive summary, schedule/breaks, per-session/participant attendance, validation/indicator charts, activity/leave history, JP/behavior status, limitations and follow-up. Pending/rejected notes and unavailable values remain explicit; no new grading formula or Sheets writes.
- Added a status-gated report card/modal to Pengelolaan with explicit PDF download, busy guards, retry/error feedback and Blob cleanup. Export uses temporary owner documents with Trash cleanup; no public sharing link is created.
- Added 9 report tests (26 total passing) and local desktop/mobile browser checks with mocked services. Native Google Docs export, authorization, quotas, pagination and live-data validation still require installation checks. PDF is the initial format; DOCX is not implemented.

## 2026-10-24 — Komdigi public attendance page
- Restyled Absensi.html to the user's blue reference: embedded institutional logo/name, pale blue background, centered white card, responsive fields, blue confirmation button and accessible participant selection.
- Added muatTampilanAbsensiQR to resolve the validated token's session name. The page displays the name and Datang/Pulang instead of the session ID; blank names use a descriptive fallback.
- Kept the original validator, participant lookup and save backend unchanged. Preserved request-ID reuse, response-order guards, disabled states and terminal/retry behavior.
- Five backend display tests and the 12 existing Beranda tests passed. Chromium checks covered desktop/320/390/768 px, validation failures, blank/long/HTML session names, stale search responses, keyboard selection, retry with identical payload and final rejection/success states. No production writes or Google deployment performed.

## 2026-10-24 — Beranda as the default landing page
- Added Beranda.html with whole-database program, unique-participant and session counts; upcoming/today agenda; category/status distribution; follow-up counters; program search, filters and pagination.
- Added an owner-protected, read-only muatBerandaIndex endpoint. Counts distinguish unique participants from registrations, honor spreadsheet timezone, exclude future attendance from follow-up and surface invalid relationships/schedules.
- Changed the default Web App route to Beranda, retained Index for page=monitoring, and preserved participant/profile routes and QR token priority. Added Buka Beranda to the spreadsheet menu.
- Added Beranda to the four existing admin sidebars while retaining the accepted sidebar/navigation implementation and creation modals.
- Added 12 backend tests for aggregation, empty/error cases, owner access, duplicate/foreign relationships, effective corrected times, agenda limits, timezone and routing. Local Chromium checks covered desktop/mobile UI, search/filter/pagination, escaping, sidebar click/hover/keyboard, missing navigation base and navigation round trips with program/dev context.
- Updated installation notes, context and source hashes. No Google deployment, production data writes, new database schema or changes to scoring/JP formulas performed.

## 2026-10-24 — creation forms in separate modals
- Replaced the program/session creation disclosures in Pengelolaan with native dialogs and buttons in the card headers.
- Moved manual participant entry and existing-participant lookup into a dialog opened from the participant registration card; file import remains on the page.
- Preserved drafts on close, focused the relevant form on open, blocked dismissal while saving, and kept errors inside the modal.
- Successful participant preview moves focus to the confirmation card without automatically importing. Program creation still leads to session creation.
- Kept backend contracts, request IDs, sidebar interactions and navigation unchanged. No deployment or production data changes performed.
- Local Chromium checks passed at 1440 px and 390 px with a mocked Google bridge: form focus, draft retention, required-field validation, blocked dismissal during requests, same-ID retry, program-to-session flow, break payloads, participant lookup, error messages and preview confirmation flow. Inline script/GS syntax, unique IDs and all 13 repository guardrails passed; deployed behavior is awaiting user verification.

## 2026-10-24 — accepted Codex continuation baseline
- Synced the four latest admin HTMLs after user confirmation that sidebar and navigation are normal.
- Kept backend, participant attendance page and AdminQR from the latest user-supplied source.
- Navy rounded UI and sticky institution header with embedded Komdigi logo.
- Sidebar with internal hamburger, icon rail, hover expansion/content shift, stable menu positions, Nama/Posisi and settings/logout placeholders.
- Strengthened navigation base selection, sidebar initialization and explicit-collapse behavior.
- Added AGENTS.md and PROJECT_CONTEXT.md for continuation without replaying chat history.

## Prior work included in this baseline
- Separated QR/leave dialogs, optional evidence uploads and in-page previews.
- Dynamic per-program behavioral indicators/rules and positive/negative notes.
- Dedicated participant page and profile with attendance, behavior, leave and correction histories.
- Session-specific leave monitoring.

## Validation
- Inline JavaScript syntax checks.
- DOM simulation of all four pages with Google bridge mocks: desktop/mobile sidebar interactions and dev/exec URL selection.
- User confirmed latest deployed sidebar/navigation behavior is normal.
- Not a claim of complete live-data, upload, security or scoring verification.
