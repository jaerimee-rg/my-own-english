export const meta = {
  name: 'myown-build-phase',
  description: 'Build one project phase of My Own English end-to-end: implement, write+run tests, code review, Playwright UI test, bug-fix loop, then deploy to GitHub/Vercel/Supabase',
  whenToUse: 'Run once per phase (args: { phase: "Phase 1", deploy: true }) to advance the build with full quality gates.',
  phases: [
    { title: 'Implement' },
    { title: 'Test' },
    { title: 'Review' },
    { title: 'UI Test' },
    { title: 'Fix' },
    { title: 'Deploy' },
  ],
}

// ---- inputs ----
const phaseName = (args && args.phase) || 'Phase 0'
const doDeploy = args ? args.deploy !== false : true

// ---- structured output schemas ----
const IMPL = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    tasksDone: { type: 'array', items: { type: 'string' } },
    buildPassed: { type: 'boolean' },
  },
  required: ['summary', 'files', 'buildPassed'],
}
const TEST = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    total: { type: 'number' },
    failed: { type: 'number' },
    details: { type: 'string' },
  },
  required: ['passed', 'details'],
}
const REVIEW = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          file: { type: 'string' },
          issue: { type: 'string' },
        },
        required: ['severity', 'issue'],
      },
    },
  },
  required: ['findings'],
}
const UITEST = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
    details: { type: 'string' },
  },
  required: ['passed', 'details'],
}
const FIX = {
  type: 'object',
  properties: {
    resolved: { type: 'boolean' },
    summary: { type: 'string' },
    remaining: { type: 'array', items: { type: 'string' } },
  },
  required: ['resolved', 'summary'],
}
const DEPLOY = {
  type: 'object',
  properties: {
    deployed: { type: 'boolean' },
    commit: { type: 'string' },
    url: { type: 'string' },
    details: { type: 'string' },
  },
  required: ['deployed', 'details'],
}

// ---- 1. IMPLEMENT (single sequential agent to avoid file conflicts) ----
phase('Implement')
const impl = await agent(
  `You are building the "My Own English" web app — a mobile-first Next.js (App Router) + TypeScript + Tailwind + Supabase app for a rhythmic-gymnastics teacher to store English phrases, study them, and practice AI conversation.

Read docs/requirements.md, docs/tasks.md, and CLAUDE.md first.

TASK: Implement EVERY task listed under "${phaseName}" in docs/tasks.md.
- Follow the CLAUDE.md task rule: set each item to [~] when you start it and [x] when it is done (edit docs/tasks.md).
- Write clean, production-quality, typed code that matches existing conventions.
- Ensure the project compiles: run \`npm run build\` (or \`npx tsc --noEmit\`) and fix type/build errors before finishing.
- Do NOT write the test suite or run Playwright here — later stages handle that. Just implement and make it build.
- Append a dated one-line entry to the "진행 로그" section of docs/tasks.md.

Return a summary, the files you created/changed, the task titles you completed, and whether the build passed.`,
  { phase: 'Implement', schema: IMPL }
)

// ---- 2. TEST (write + run automated tests) ----
phase('Test')
const test = await agent(
  `Write and run automated tests for the "${phaseName}" features of the My Own English app.

- Use Vitest + React Testing Library (and supertest-style route tests where relevant). If no test runner is configured yet, set one up (install deps, add config + \`npm test\` script).
- Cover the new components, hooks, utilities, and API/route handlers with unit and integration tests, including edge cases and error paths.
- Mock Supabase and the Claude API at the network boundary — tests must not hit real services.
- Run \`npm test\` and report the real results (total/failed). Do not claim success unless the run actually passed.

Files implemented this phase: ${JSON.stringify(impl?.files || [])}.`,
  { phase: 'Test', schema: TEST }
)

// ---- 3. REVIEW (parallel read-only lenses) ----
phase('Review')
const reviewLenses = [
  'correctness & bugs (logic errors, missing states, race conditions)',
  'security & data access (Supabase RLS, exposed secrets, auth checks, input validation)',
  'readability, accessibility & best practices (mobile-first UX, naming, dead code)',
]
const reviews = await parallel(
  reviewLenses.map((lens) => () =>
    agent(
      `Code-review the changes for "${phaseName}" of the My Own English app through this lens: ${lens}.
Inspect the working tree (\`git diff\` / \`git status\`) and the relevant files. Report concrete, actionable findings — each with a severity (critical/high/medium/low), the file, and the issue. If nothing is wrong, return an empty findings array.`,
      { label: `review:${lens.split(' ')[0]}`, phase: 'Review', schema: REVIEW }
    )
  )
)
const findings = reviews.filter(Boolean).flatMap((r) => r.findings || [])
const blockingFindings = findings.filter((f) => /critical|high/i.test(f.severity))

// ---- 4. UI TEST (Playwright MCP) ----
phase('UI Test')
const ui = await agent(
  `UI-test the "${phaseName}" features of the My Own English app using the Playwright MCP browser tools.

- Load the Playwright tools first via ToolSearch (query "select:mcp__playwright__browser_navigate,mcp__playwright__browser_snapshot,mcp__playwright__browser_click,mcp__playwright__browser_type,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_wait_for,mcp__playwright__browser_resize,mcp__playwright__browser_console_messages").
- Start the dev server in the background (\`npm run dev\`) if it is not already running, wait until it is reachable (default http://localhost:3000).
- Resize to a mobile viewport (e.g. 390x844) and exercise the real user flows for this phase. Take screenshots and check console for errors.
- Report pass/fail and a list of concrete UI issues found.`,
  { phase: 'UI Test', schema: UITEST }
)

// ---- 5. FIX LOOP (sequential, up to 3 rounds) ----
phase('Fix')
let fixRound = 0
let fix = {
  resolved: !!(test?.passed && ui?.passed && blockingFindings.length === 0),
  summary: 'No fixes needed — tests, UI, and review all clean.',
  remaining: [],
}
while (!fix.resolved && fixRound < 3) {
  fixRound++
  fix = await agent(
    `Fix ALL outstanding issues for "${phaseName}" of the My Own English app, then re-run the test suite AND the Playwright UI checks to confirm.

Outstanding:
- Failing tests: ${test?.passed ? 'none' : (test?.details || 'see test stage')}
- Code-review findings (fix critical/high first): ${JSON.stringify(findings)}
- UI issues: ${JSON.stringify(ui?.issues || [])}

This is round ${fixRound} of 3. Make the fixes, re-run \`npm test\`, re-run the Playwright flow via the MCP tools, and only set resolved=true if tests pass, the UI works, and no critical/high findings remain. List anything still unresolved in "remaining".`,
    { label: `fix:round-${fixRound}`, phase: 'Fix', schema: FIX }
  )
}

// ---- 6. DEPLOY (only when green) ----
phase('Deploy')
let deploy = { deployed: false, details: 'Deploy skipped (deploy=false).' }
if (doDeploy && fix.resolved) {
  deploy = await agent(
    `Local quality gates for "${phaseName}" of My Own English are GREEN. Deploy now:

1. Run \`npm run build\` once more to confirm a clean production build. Abort and report if it fails.
2. Stage and commit the work with a clear conventional message (e.g. "feat: ${phaseName} ...") ending with the Co-Authored-By trailer for Claude. Work on the \`main\` branch.
3. Push to origin (GitHub repo: jaerimee-rg/my-own-english). The push triggers the Vercel auto-deploy for this repo.
4. If this phase introduced or changed database schema, apply the corresponding migration to the linked Supabase project using the supabase MCP \`apply_migration\` tool (load it via ToolSearch) so the remote DB reflects the new schema. Keep SQL idempotent.
5. Verify: confirm the push succeeded and (if available) report the Vercel deployment URL/status.

Return whether it deployed, the commit hash, the deployment URL, and details.`,
    { phase: 'Deploy', schema: DEPLOY }
  )
} else if (doDeploy && !fix.resolved) {
  deploy = {
    deployed: false,
    details: `Deploy BLOCKED: unresolved issues after ${fixRound} fix round(s): ${JSON.stringify(fix.remaining)}`,
  }
}

log(`${phaseName} complete — tests:${test?.passed ? 'pass' : 'FAIL'} ui:${ui?.passed ? 'pass' : 'FAIL'} deployed:${deploy.deployed}`)

return {
  phase: phaseName,
  implement: impl,
  test,
  reviewFindings: findings,
  blockingFindings,
  ui,
  fix,
  fixRounds: fixRound,
  deploy,
}
