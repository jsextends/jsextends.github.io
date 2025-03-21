const { task } = require("gulp");
const { createServer } = require("http-server");
const generalStatics = require("./job/generalStatics");
async function general(cb) {
  generalStatics()
  cb();
}

function preview(cb) {
  const port = 10000;
  createServer({ root: "" }).listen(port);
  console.log(`服务地址: http://localhost:${port}`);
  cb();
}

exports.general = task(general);
exports.preview = task(preview);