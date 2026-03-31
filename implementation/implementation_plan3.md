# Theme Switcher and Modal Color Adjustments

This plan covers adding a theme switcher to toggle between the original theme and the new dark green theme, adjusting the green theme to be less bright, and ensuring the modal dialog respects the current theme.

## Proposed Changes

### CSS Styling
#### [MODIFY] styles.css
- Refactor `:root` to contain the new, darker "Dark Green" theme variables.
- Adjust `--bg-dark`, `--btn-hover`, and gradient backgrounds to be deeper and less bright.
- Add `[data-theme="original"]` selector to explicitly define the original theme variables.
- Update `.modal-content.glass-panel` and other hardcoded modal/quiz colors to use CSS variables so they switch dynamically.

### HTML Structure
#### [MODIFY] index.html
- Add a `<select>` dropdown menu in the `<footer>` section with options for "Dark Green (Default)" and "Original Blue".

### JavaScript Logic
#### [MODIFY] app.js
- Add event listeners for the theme dropdown to toggle the `data-theme` attribute on the `document.body` or `document.documentElement`.
- Load the user's preferred theme from `localStorage` on page load.

## Verification Plan

### Automated Tests
- No automated tests available for UI manipulation.

### Manual Verification
- Open `index.html` in the browser.
- Verify the background is a darker, more comfortable green.
- Verify the modal uses the correct theme colors.
- Change the theme using the dropdown in the footer.
- Verify the entire app (including modal and buttons) switches to the original blue theme.
- Refresh the page to ensure the selected theme persists.
