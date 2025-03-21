const {
  getData,
  getOutputDirectory,
  getTemplateContent,
  mergeData,
  getDocDirectory,
  getWorkSpaceDirectory,
} = require("./common");
const { Notebook } = require("crossnote");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Mustache = require("mustache");
module.exports = async function generalDocs() {
  console.log("任务名称：《构建所有文档》");
  const data = getData("base.json");
  for (let item of data.repos) {
    await generalDoc(item);
  }
};

async function generalDoc(item) {
  console.log(`任务名称：《${item.name}》`);
}

async function buildPages(item) {
  const result = [];
  const dir = path.join(
    getWorkSpaceDirectory(),
    "codes",
    item.name,
    item.dirctory
  );
  const list = fs.readdirSync(dir);
  let bookName = list.shift();
  while (bookName) {
    const bookPath = path.join(dir, bookName);
    const hash = crypto.createHash("md5");
    bookId = hash.update(bookName).digest("hex");
    console.log(`开始获取书籍《${bookName}》下的章节信息`);
    const bookInfo = {
      id: bookId,
      name: bookName,
      fullPath: bookPath,
      chapterList: getBookChapters(bookPath),
      type: "book",
      url: `/${bookId}_${chapterId}.html`,
      chapterLength: 0,
    };
    bookInfo.chapterLength = bookInfo.chapterList.length;
    result.push(bookInfo);
    bookInfos.push({
      value: bookInfo.chapterList,
      key: bookId,
      bookName: bookName,
    });
    bookName = list.shift();
  }
  return result;
}

async function generalChapter(chapterInfo, total, current) {
  const filePath = chapterInfo.path;
  const subhead = path.basename(filePath).slice(0, -3).replace(/^\d*/, "");
  log(`[${current}/${total}] 开始转化章节：${subhead}`);
  const html = await parseMarked(filePath);
  const result = mergeData("base.json", "common.json");
  const chapterdata = getChapterList(chapterInfo.key.split("_")[0]);
  return Object.assign(result, {
    html,
    subhead,
    id: chapterInfo.key,
    ...chapterdata,
  });
}

async function parseMarked(filePath) {
  const notebook = await Notebook.init({
    config: {
      previewTheme: "atom-light.css",
      mathRenderingOption: "KaTeX",
      codeBlockTheme: "atom-light.css",
      printBackground: true,
      enableScriptExecution: true,
    },
  });
  const engine = notebook.getNoteMarkdownEngine(filePath);
  await engine.htmlExport({ offline: false, runAllCodeChunks: true });
  let html = fs.readFileSync(filePath.replace("md", "html")).toString();
  const imageReg = /<img[^src]*src="([^"]*)"/g;
  let result;
  while ((result = imageReg.exec(html)) !== null) {
    const fileFullPath = path.join(
      path.dirname(filePath),
      decodeURIComponent(result[1])
    );
    const fileName = crypto
      .createHash("md5")
      .update(fileFullPath.slice(getDocDirectory().length))
      .digest("hex");
    const outputFile = path.join(
      getOutputDirectory(),
      "assets/images",
      fileName + path.extname(result[1])
    );
    fs.copyFileSync(fileFullPath, outputFile);
    html = html.replace(
      result[1],
      `/assets/images/${fileName + path.extname(result[1])}`
    );
  }
  fs.rmSync(filePath.replace("md", "html"));
  let hrefReg = /<a[^href]*href=\"([^\"]*)\"/g;
  html = html.replace(hrefReg, (match, $1) => {
    if ($1[0] === ".") {
      const fullPath = path.join(path.dirname(filePath), $1);
      if (fullPath) {
        const fileFullPath = path.join(
          path.dirname(fullPath),
          decodeURIComponent($1)
        );
        const key = findKey(fileFullPath);
        if (key) {
          return match.replace($1, `/${key}.html`);
        }
        return match;
      }
      return match;
    }
    return match;
  });
  const contentReg = /<body [^>]*>([\s\S]*)<\/body>/gm;
  result = contentReg.exec(html);
  if (result) {
    html = result[1];
  }
  return html;
}

function findKey(fullPath) {
  const data = getData("chapters.json");
  const item = data.find(
    (el) => path.normalize(el.path) === path.normalize(fullPath)
  );
  return item ? item.key : "";
}

function getChapterList(bookId) {
  let result = getData("books.json").find((el) => el.key === bookId.toString());
  return { bookName: result.bookName, chapterList: result.value };
}
function generalPage(result) {
  let content = Mustache.render(getTemplateContent("chapter.html"), result);
  content = content.replace(/[(\r\n)|(\n)]/g, "");
  fs.writeFileSync(
    path.join(getOutputDirectory(), result.id + ".html"),
    content
  );
}
