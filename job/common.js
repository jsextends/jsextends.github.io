const fs = require("fs");
const path = require("path");
function getWorkSpaceDirectory(){
  return __filename.slice(0, -14);
}
function getData(fileName) {
  let filePath = fileName
  if(!path.isAbsolute(filePath)){
    filePath = path.join(getWorkSpaceDirectory(), "data", fileName);
  }
  return JSON.parse(fs.readFileSync(filePath).toString());
}
exports.getOutputDirectory = function getOutputDirectory() {
  const config = getData("base.json");
  let outputDirectory = config.outputDirectory;
  if (!path.isAbsolute(outputDirectory)) {
    outputDirectory = path.join(getWorkSpaceDirectory(), outputDirectory);
  }
  return outputDirectory;
};

exports.getPDFExportDirctory = function getPDFExportDirctory(){
  const config = getData("base.json");
  let outputDirectory = config.pdfExportDirctory;
  if (!path.isAbsolute(outputDirectory)) {
    outputDirectory = path.join(getWorkSpaceDirectory(), outputDirectory);
  }
  return outputDirectory;
}

exports.getDocDirectory = function getDocDirectory() {
  const config = getData("base.json");

  let docDirectory = config.docDirectory;
  if (!path.isAbsolute(docDirectory)) {
    docDirectory = path.join(getWorkSpaceDirectory(), docDirectory);
  }
  return docDirectory;
};

exports.getTemplateContent = function getTemplateFile(fileName) {
  const filePath = path.join(getWorkSpaceDirectory(), "template", fileName);
  return fs.readFileSync(filePath).toString();
};

exports.mergeData = function mergeData() {
  const fileList = [...arguments];
  const result = {};
  fileList.forEach((file) => {
    Object.assign(result, getData(file));
  });
  return result;
};

exports.writeData = function writeData(fileName, data){
  fs.writeFileSync(path.join(getWorkSpaceDirectory(), "data", fileName), JSON.stringify(data, null, 4))
}

exports.removeDataFile = function removeDataFile (fileName){
  let filePath = fileName;
  if (!path.isAbsolute(filePath)) {
    filePath = path.join(getWorkSpaceDirectory(), "data", fileName);
  }
  fs.rmSync(filePath)
}

exports.existData = function existData(fileName){
  const filePath = path.join(getWorkSpaceDirectory(), "data", fileName);
  return fs.existsSync(filePath)
}
exports.getWorkSpaceDirectory = getWorkSpaceDirectory;
exports.getData =  getData;
