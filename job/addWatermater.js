const { imageSizeFromFile } = require("image-size/fromFile");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
module.exports = async function addWaterMark(src, text) {
  const dimensions = await imageSizeFromFile(src);
  if (dimensions.height > 60) {
    const canvas = createCanvas(dimensions.width, dimensions.height);
    const ctx = canvas.getContext("2d");
    const image = await loadImage(src);
    ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
    const width = ctx.measureText(text).width;
    const height =
      ctx.measureText(text).actualBoundingBoxAscent +
      ctx.measureText(text).actualBoundingBoxDescent;
    ctx.strokeStyle = "#ff00002b";
    ctx.font = "bold 16px serif";
    ctx.strokeText(
      text,
      Math.ceil((dimensions.width - width) / 2),
      Math.ceil((dimensions.height - height) / 2)
    );
    ctx.strokeText(text, 0, height * 2);
    ctx.strokeText(text, Math.ceil(dimensions.width - width / 2 * 3), height * 2);
    ctx.strokeText(text, 0, Math.ceil(dimensions.height - height));
    ctx.strokeText(
      text,
      Math.ceil(dimensions.width - width / 2 * 3),
      Math.ceil(dimensions.height - height)
    );
    const buffers = canvas.toBuffer("image/png", { compressionLevel: 7 });
    fs.writeFileSync(src, buffers);
  }
};
