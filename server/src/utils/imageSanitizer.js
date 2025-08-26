const sharp = require('sharp');
const fs = require('fs');

async function reencodeToJpeg(inPath, quality = 82) {
  const tmpOut = inPath + '.tmp.jpg';
  await sharp(inPath).rotate().jpeg({ quality, mozjpeg: true }).toFile(tmpOut);
  await fs.promises.rename(tmpOut, inPath);
  return inPath;
}

module.exports = { reencodeToJpeg };
