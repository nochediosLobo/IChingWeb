# 卦名補全 (Hexagram Name Fill-in-the-Blank) Implementation Plan

## Goal Description
Implement the new "卦名補全" (Game 6) into the Hexagram Learning section. 
Requirements include two question modes (Hexagram Symbol / Trigram Names), options containing the "back part" of the hexagram name, placing the game right after "卦名填空" (Order: 1, 5, 6, 2, 3, 4), and displaying the hexagram symbol if Trigram Names is the question mode and the answer is correct.

## Proposed Changes

### `index.html`
- **Reorder the `.game-mode-btn` buttons** in `<div class="game-btn-grid">` to match the required order: 
  - 卦象配對 (data-game="1")
  - 卦名填空 (data-game="5")
  - 卦名補全 (New: data-game="6", <h3>卦名補全</h3><p>根據卦象或上下卦名補全卦名</p>)
  - 卦象高手 (data-game="2")
  - 畫卦天才 (data-game="3")
  - 記掛大師 (data-game="4")
- **Add Settings Container `<div id="settings-g6">`**:
  Including two buttons for test types:
  - 顯示卦象 (e.g. ䷍) -> `sym`
  - 顯示卦名 (e.g. 火天__) -> `name`

### `app.js`
- **Initialize Setup Logics**: Add `settingsG6` to DOM elements. Link `.setup-g6-q-btn` to `quizConfig.g6Q` with default value `'sym'`. Adjust the game active tab switcher to hide/show `settings-g6` properly.
- **Generate Quiz (`generateQuiz()`)**: Handle `quizConfig.game === 6` by picking the base hexagram and randomly selecting 2 distinct incorrect hexagram choices as options.
- **Render UI (`loadQuestion()`)**: 
  - If `qType === 'sym'`, render the symbol size UI for `questionContainer`.
  - If `qType === 'name'`, render the trigrams combination (e.g., `<div class="quiz-q-name">火天__</div>`).
  - Calculate `backName` of the target options (e.g. from "火天大有" extract "大有", or from "乾為天" extract "乾").
  - Populate `optionsContainer` buttons with the calculated `backName`.
- **Validation Fallback (`selectAnswer`)**: 
  - Fix visual answer highlighting logic slightly. Since visually we press a button with just "大有" (which is `backName`), the checking mechanism already captures exact ID match, but the auto-correct highlight fallback needs to match against `backName`.
  - Update `feedbackText` to display the symbol if `game === 6` and `g6Q === 'name'` mode was used. e.g "正確！答案是：火天大有 ䷍".

## Verification Plan

### Manual Verification
1. Open `index.html` in Web Browser.
2. Navigate to "卦象學習" section. Check that "卦名補全" is positioned at index 3 (after 卦名填空).
3. Select "卦名補全", check that settings "測驗題目" is present ("顯示卦象" & "顯示卦名").
4. Press "開始測驗".
5. Test "顯示卦象" (sym) Mode:
   - Question should be the symbol (䷍).
   - 3 Options should be name suffix (e.g. 大有).
   - Answer correctly and incorrectly. Verify fallback logic highlights the correct answer in green.
6. Test "顯示卦名" (name) Mode:
   - Question should be "UpperLower__" (e.g. 火天__).
   - Answer correctly to see if "䷍" is displayed in the feedback block as required.
