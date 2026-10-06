# Codebase review findings

Reviewed on 2026-10-06. Scope: application source, tests, styling, configuration, documentation, and public metadata/assets. Findings describe the code at review time; fixes have not been applied as part of this review.

## Verification

- `pnpm test --run`: all 17 tests across five files passed.
- `pnpm build`: type-check and production build passed, with one Sass warning about the unquoted `wheat` map key.
- Direct execution of the board utilities confirmed that stored boards with string-valued number tokens or a robber on a resource tile pass validation.
- A constant random source reproduced adjacent hot numbers after generation exhausted its retries. In 10,000 ordinary random extended-board generations, no adjacent-hot-number failures were observed.
- Browser layout and assistive-technology behavior were not verified interactively.

## 1. Stored-board validation accepts invalid token types and robber placement

**Severity:** Medium  
**Location:** [src/utils/board.ts](../src/utils/board.ts), `sortedKey` and `isValidBoard` (review lines 55–70).

Inventory comparison converts values to strings, so a stored token such as `"6"` passes as the number `6`. This makes the `Tile[]` type guard unsound: restored tokens fail numeric equality checks used for roll highlighting and membership checks used for red hot-number styling. Validation also checks only that one robber exists, allowing it to occupy a resource tile. It does not reject adjacent hot numbers in restored boards.

**Suggested fix:** Validate exact field types and allowed values before comparing inventories. Require numeric tokens on resource tiles, null tokens on deserts, the initial robber on a desert, and no adjacent hot numbers. Preserve exact types during inventory comparison.

**Evidence:** Both a generated board with all non-null tokens converted to strings and a board with its robber moved to a resource tile returned `true` from `isValidBoard`.

## 2. Invalid saved settings can hide all content and block UI recovery

**Severity:** Medium  
**Location:** [src/hooks/useSettings.ts](../src/hooks/useSettings.ts), `loadSettings` and `updateSettings`; [src/components/SettingsDialog.tsx](../src/components/SettingsDialog.tsx), visibility controls.

The loader accepts `showMap: false` and `showDice: false` together. The app then renders neither map nor dice. Each visibility checkbox is disabled when the other feature is hidden, so both controls become disabled and the user cannot recover through the settings dialog. Normal dialog interaction prevents this combination, but persisted data can still introduce it.

**Suggested fix:** Enforce “at least one of map or dice is visible” in both settings loading and updates, rather than relying only on disabled UI controls.

## 3. Board generation can silently return adjacent hot numbers

**Severity:** Medium  
**Location:** [src/utils/board.ts](../src/utils/board.ts), `generateBoard` (review lines 46–52); [index.html](../index.html) and [public/llms.txt](../public/llms.txt), advertised placement guarantees.

Generation retries number placement up to 2,000 times, then returns the final board even if 6s or 8s still share an edge. This violates the advertised guarantee and the test assertion that these numbers are never adjacent.

**Suggested fix:** Use a guaranteed placement fallback, such as a bounded search for valid hot-number positions, or explicitly handle exhaustion instead of returning an invalid placement silently.

**Evidence:** A constant random source reproduced the failure. No failures occurred in 10,000 ordinary random extended-board generations, so this is a demonstrated exhaustion-path defect rather than an observed frequent failure.

## 4. Dice history updater mutates a ref

**Severity:** Low  
**Location:** [src/hooks/useDiceRoll.ts](../src/hooks/useDiceRoll.ts), history update (review line 20).

`nextId.current++` runs inside the functional state updater. Repeated evaluation of that updater can consume additional IDs, because it changes external state and returns different IDs for the same input. The app is wrapped in `React.StrictMode`.

**Suggested fix:** Allocate the history entry and its ID in the timeout callback before calling `setHistory`, then keep the updater pure.

## 5. Initial dice can announce a robber roll before any roll is recorded

**Severity:** Low  
**Location:** [src/components/DicePanel.tsx](../src/components/DicePanel.tsx), robber condition (review line 15); [src/hooks/useDiceRoll.ts](../src/hooks/useDiceRoll.ts), initial dice state.

The dice start with random faces. If their initial sum is seven, the panel displays “Robber moves!” even though the user has not rolled, history is empty, and the board does not treat the initial dice as a completed roll.

**Suggested fix:** Gate completed-roll messaging on a recorded roll, or represent the initial state explicitly as awaiting the first roll.

## 6. Player selection lacks radio keyboard behavior

**Category:** Accessibility  
**Location:** [src/components/PlayerModeToggle.tsx](../src/components/PlayerModeToggle.tsx), radio group (review lines 9–19).

Buttons have `role="radio"` and `aria-checked`, but lack arrow-key navigation and managed tab stops. Both remain ordinary tab stops rather than providing the keyboard interaction implied by their radio roles.

**Suggested fix:** Use native radio inputs styled as a segmented control, or implement the complete keyboard and focus behavior for a custom radio group.

## 7. Dice results lack a live announcement

**Category:** Accessibility  
**Location:** [src/components/DicePanel.tsx](../src/components/DicePanel.tsx), result display.

The completed total and robber message change without a live region. A screen-reader user activating the roll button may not receive an announcement of the result.

**Suggested fix:** Announce completed results through a polite status region, while keeping intermediate flickering faces out of that announcement.

**Verification limit:** Assistive-technology behavior still needs interactive testing.

## 8. Unquoted Sass resource key produces a build warning

**Severity:** Low  
**Location:** [src/index.scss](../src/index.scss), resource texture map (review lines 465–467).

Sass interprets the unquoted `wheat` key as a color value and warns when interpolating it into a selector. The build succeeds, but the key's type is unintended and creates unnecessary warning noise.

**Suggested fix:** Quote all resource map keys so they are consistently strings.

## 9. README has drifted from the implementation

**Severity:** Low  
**Location:** [README.md](../README.md).

At review time, the README:

- Says maps reset on reload, although `useBoard` persists and restores them.
- Describes probability dots that `NumberToken` no longer renders.
- Lists the deleted `src/setupTests.ts` file.
- Gives a retry limit of 500 instead of 2,000.
- Omits extended player mode and settings controls.

**Suggested fix:** Align the documentation with current persistence, token rendering, project structure, generation limits, and available modes/settings.

## 10. No automated lint configuration

**Category:** Maintenance / code quality  
**Location:** [package.json](../package.json) and repository configuration.

No linter or lint script is configured. Type-checking catches type errors but does not provide dedicated checks for React hook patterns, updater purity, or broader code consistency.

**Suggested fix:** Add a small TypeScript/React lint configuration and a script that can run in development and CI.

## 11. Generation tests depend on randomness and omit exhaustion coverage

**Category:** Test quality  
**Location:** [src/utils/board.test.ts](../src/utils/board.test.ts).

The hot-number test samples 50 random boards per mode. This provides useful sampling but neither guarantees repeatable failures nor exercises retry exhaustion. The assertion says “never” while the implementation has an invalid-board fallback.

**Suggested fix:** Add deterministic random-source control and cover exhausted retries explicitly, alongside inventory and adjacency properties.

## 12. Important state and interaction paths lack tests

**Category:** Test coverage  
**Location:** [src/hooks](../src/hooks), [src/components/SettingsDialog.tsx](../src/components/SettingsDialog.tsx), and [src/App.test.tsx](../src/App.test.tsx).

Current tests do not cover settings recovery, dialog interactions, or dice timer behavior. The app test only checks that two dice render. These gaps allow the invalid visibility state and initial robber messaging to pass unnoticed.

**Suggested fix:** Add focused tests for malformed settings, the visibility invariant, mode changes, dialog closing, completed-roll recording, history limits, and timer cleanup. Use fake timers for the dice lifecycle.

## 13. Unused original assets are copied into production

**Category:** Asset maintenance  
**Location:** [public/raws](../public/raws).

Unused high-resolution resource originals occupy approximately 2.3 MB under `public/raws/`. Vite copies public files into the production output, so these assets increase deployment size even though the app does not reference them. This does not imply browsers download them during normal use.

**Suggested fix:** Keep source artwork outside `public/`, or exclude unused originals from the deployed artifact.

## Suggested priority

Fix stored-data validation and settings recovery first, followed by guaranteed board placement. Address dice-state consistency and accessibility next, then documentation, build warnings, linting, focused test coverage, and unused deployment assets.

## Resolution (2026-10-06)

All findings were addressed later the same day. Verified with `pnpm lint` (clean), `pnpm build` (no warnings) and `pnpm test --run` (60 tests, 9 files).

| # | Resolution |
|---|---|
| 1 | `isValidBoard` checks exact field types and allowed resources, compares inventories without string coercion, requires the robber on a desert, and rejects adjacent 6/8. `useBoard` also requires the stored balance mode's rules (`followsRules`). |
| 2 | `withVisibleContent` enforces "map or dice visible" both when loading and when updating settings. |
| 3 | Both generators always return a board that follows their rules. Retry loops are only for randomness, and a depth-first search (`searchAssignment`) is the guaranteed fallback. |
| 4 | The history entry and its id are created in the timeout callback; the state updater is pure. |
| 5 | Dice start blank (`null`) until the first roll, so no robber message can appear early. |
| 6 | `SegmentedControl` (which replaced `PlayerModeToggle`) has a roving tab stop and arrow-key, Home and End selection. |
| 7 | A polite `role="status"` region announces settled rolls ("Rolled 7, robber moves"), keyed per roll so repeated totals re-announce. |
| 8 | Resource map keys are quoted; the Sass warning is gone. |
| 9 | README rewritten to match the app. |
| 10 | Added oxlint (`pnpm lint`, `.oxlintrc.json`) with React hooks rules. ESLint isn't usable here: typescript-eslint requires TypeScript below 6.1, and TypeScript 7 has no JavaScript API. |
| 11 | Generation tests use a seeded random source, and a constant random source forces the retry-exhaustion paths, which must still return valid boards. |
| 12 | Added tests for settings loading and the visibility rule, the settings dialog, radio keyboard behaviour, roll announcements, and the dice lifecycle with fake timers (timing, history cap, unique ids, clear, timer cleanup). |
| 13 | Unused originals and the old water textures moved to `art/`, outside `public/`. That removes about 2.7 MB from the deployed build, which is now 1.8 MB. |
