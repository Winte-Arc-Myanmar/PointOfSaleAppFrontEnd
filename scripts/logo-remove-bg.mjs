import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const jpegPath = path.join(publicDir, "logo.jpeg");
const svgPath = path.join(publicDir, "logo.svg");

// Remove background: sample corners to detect bg color, then make matching pixels transparent
const CORNER_SAMPLE = 0.12; // sample 12% from each edge for corner regions
const COLOR_TOLERANCE = 42; // max RGB distance to consider "background" (0-442 scale)

function getCornerSamples(data, width, height, channels) {
  const h = Math.max(1, Math.floor(height * CORNER_SAMPLE));
  const w = Math.max(1, Math.floor(width * CORNER_SAMPLE));
  const samples = [];
  const add = (x, y) => {
    const i = (y * width + x) * channels;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      add(x, y);
      add(width - 1 - x, y);
      add(x, height - 1 - y);
      add(width - 1 - x, height - 1 - y);
    }
  return samples;
}

function medianChannel(samples, c) {
  const arr = samples.map((s) => s[c]).sort((a, b) => a - b);
  return arr[Math.floor(arr.length / 2)];
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

const img = sharp(jpegPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
if (channels !== 3) {
  throw new Error("Expected RGB image, got " + channels + " channels");
}

const samples = getCornerSamples(data, width, height, channels);
const bgR = medianChannel(samples, 0);
const bgG = medianChannel(samples, 1);
const bgB = medianChannel(samples, 2);

const out = Buffer.alloc(width * height * 4);
for (let i = 0; i < data.length; i += 3) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const dist = colorDistance(r, g, b, bgR, bgG, bgB);
  const isBg = dist <= COLOR_TOLERANCE;
  const j = (i / 3) * 4;
  out[j] = r;
  out[j + 1] = g;
  out[j + 2] = b;
  out[j + 3] = isBg ? 0 : 255;
}

const pngNoBg = await sharp(out, {
  raw: { width, height, channels: 4 },
})
  .png()
  .toBuffer();

const base64 = pngNoBg.toString("base64");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image href="data:image/png;base64,${base64}" width="${width}" height="${height}"/>
</svg>`;

if (fs.existsSync(svgPath)) fs.unlinkSync(svgPath);
fs.writeFileSync(svgPath, svg);
console.log("Created logo.svg from logo.jpeg with background removed (" + width + "x" + height + ")");
