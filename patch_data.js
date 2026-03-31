const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'iching_data.json');
const jsPath = path.join(__dirname, 'data.js');

try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const parsed = JSON.parse(rawData);
    
    // Fallback if data array is nested under .data or .hexagrams
    const hexData = parsed.data || parsed.hexagrams || parsed;

    const outputJs = `// Auto-generated data payload to bypass local CORS file:// restrictions
window.trigramsData = [
    { name: "天", symbol: "☰" },
    { name: "澤", symbol: "☱" },
    { name: "火", symbol: "☲" },
    { name: "雷", symbol: "☳" },
    { name: "風", symbol: "☴" },
    { name: "水", symbol: "☵" },
    { name: "山", symbol: "☶" },
    { name: "地", symbol: "☷" }
];

window.defaultHexagramData = ${JSON.stringify(hexData, null, 4)};
`;

    fs.writeFileSync(jsPath, outputJs, 'utf8');
    console.log('Successfully re-packed iching_data.json into data.js');
} catch (err) {
    console.error('Failed to pack data:', err);
}
