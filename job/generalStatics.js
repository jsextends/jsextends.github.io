const path = require("path");
const { execSync } = require('node:child_process');
function buildCSS() {
  console.log("开始编译css");
  const inputFile = path.join(process.cwd(), "./template/assets/base.css");
  const outputFile = path.join(
    process.cwd(),
    "./template/assets/main.css"
  );
  execSync(`npx tailwindcss -i ${inputFile} -o ${outputFile}`);
}

module.exports = function generalStatics() {
  console.log("任务名称：《构建首页内容》");
  buildCSS();
  console.log("=========================================");
};
