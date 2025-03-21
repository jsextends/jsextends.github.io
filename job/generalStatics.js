const path = require("path");
const { execSync } = require("node:child_process");
const fs = require("fs");
const { getWorkSpaceDirectory, getData } = require("./common");
const { getOutputDirectory } = require("./common");
const { rimrafSync } = require("rimraf");
function buildCSS() {
  console.log("开始编译css");
  const inputFile = path.join(process.cwd(), "./template/assets/base.css");
  const outputFile = path.join(process.cwd(), "./template/assets/main.css");
  execSync(`npx tailwindcss -i ${inputFile} -o ${outputFile}`);
}

function getCode(item) {
  const codeDir = path.join(getWorkSpaceDirectory(), "codes", item.name);
  console.log(`开始获取代码《${item.name}》`);
  const url = `https://github.com/jsextends/${item.name}.git`;
  console.log(`开始复制代码：${url}`);
  execSync(`git clone -b ${item.branch} ${url} ${codeDir}`);
  console.log(`完成代码复制`);
}

function getCodes() {
  console.log(`创建代码目录《codes》`);
  fs.mkdirSync(path.join(getWorkSpaceDirectory(), "codes"));
  const data = getData("base.json");
  for (let item of data.repos) {
    getCode(item);
  }
}

module.exports = function generalStatics() {
  console.log("清空历史生成的数据");
  const outputDirectory = getOutputDirectory();
  rimrafSync(path.join(getWorkSpaceDirectory(), "codes"));
  rimrafSync(outputDirectory);
  fs.mkdirSync(outputDirectory);
  console.log("任务名称：《构建首页内容》");
  buildCSS();
  getCodes();
  console.log("=========================================");
};
