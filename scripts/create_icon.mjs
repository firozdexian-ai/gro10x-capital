import fs from 'fs';
import path from 'path';

// Minimal 1x1 or valid 32x32 gold square PNG base64
// 48x48 gold square with black 'G'
const goldPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB4SURBVGhD7dexDcAgDEPRp2M4jMImjA6UFC6xQ/L3dZItj2fF1Wd6t1f31f9Z5zF3n0/v9ur65v564wK4gAvgAi6AC7gALuACuIAL4AIugAu4gAvgAi6AC7gALuACuIAL4AIugAu4gAvgAi6AC7gALuACLuACuM5rT7/u2994AV1eG5M3c88jAAAAAElFTkSuQmCC";

const extDir = path.resolve('extension');
if (!fs.existsSync(extDir)) {
  fs.mkdirSync(extDir, { recursive: true });
}

fs.writeFileSync(path.join(extDir, 'icon.png'), Buffer.from(goldPngBase64, 'base64'));
console.log('Icon written to extension/icon.png');
