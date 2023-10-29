const pinyin = require("pinyin");
const fs = require("fs");
const path = require("path");

const globalPath = "./res";
const relatePath = "./res";
let existsFile = {};
const converterPinyin = {};

/**
 * 将中文汉字替换为拼音
 * @param {*} hanz
 * @param {*} path
 */
const hanz2pinyin = (hanz, path = false) => {
  const res = pinyin(hanz, {
    style: pinyin.STYLE_NORMAL, // 输出拼音格式
    heteronym: false, // 是否启用多音字模式，默认关闭
    segment: false, //默认不启用分词
  });
  res.forEach((item, index) => {
    index > 0 &&
      item[0] &&
      item[0][0] != "@" &&
      (res[index] = item[0][0].toUpperCase() + item[0].substr(1));
  });
  if (/^\d/.test(res[0][0]) && !path) res[0] = `img${res[0]}`;
  return res.join("").replace(/\s/g, "");
};

/**
 * 读取图片文件
 * @param {*} path
 */
const getFiles = (path) => {
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    if (!file.endsWith("png")) {
      getFiles(`${path}/${file}`);
    } else {
      if (!converterPinyin[path]) converterPinyin[path] = {};
      converterPinyin[path][file] = hanz2pinyin(file);
      existsFile[converterPinyin[path][file]] = file;
    }
  });
};

/**
 * 用于判断路径是否存在， 如果不存在，则创建一个
 * @param {*} pathStr
 * @param {*} cb
 */
function mkdirPath(pathStr, cb) {
  fs.exists(pathStr, function (exists) {
    !exists && fs.mkdir(pathStr, cb);
  });
}

/**
 * 重命名文件
 * @param {*} filePath
 * @param {*} path
 */
const renameFiles = (filePath, path) => {
  Object.keys(filePath).forEach((file) => {
    if (typeof filePath[file] === "string") {
      const newDirpath = hanz2pinyin(path);
      mkdirPath(newDirpath, (r) => {
        fs.rename(
          `${path}/${file}`,
          `${newDirpath}/${hanz2pinyin(filePath[file])}`,
          (e) => {}
        );
      });
    } else renameFiles(filePath[file], file);
  });
};

const exit = {};

/**
 * 扁平化文件
 * @param {*} files
 * @param {*} path
 * @returns
 */
const flattFile = (files, path) => {
  return Object.keys(files).reduce((pre, cur, idx) => {
    if (typeof files[cur] === "string") {
      let i = files[cur].lastIndexOf("@");
      let varName = `${
        path === globalPath
          ? ""
          : hanz2pinyin(path, true)
              .replace(/\//g, (m, p) => "_")
              .replace(/(\s|\.)/g, "")
      }_${files[cur].substr(0, i > -1 ? i : files[cur].lastIndexOf("."))}`;
      if (exit[varName]) return pre;
      exit[varName] = 1;
      return (
        pre +
        `import ${varName} from '${
          path === globalPath ? relatePath : path
        }/${files[cur].replace(/@\dx/, "")}';\n`
      );
    } else return pre + flattFile(files[cur], cur);
  }, "");
};

getFiles(globalPath);
renameFiles(converterPinyin, globalPath);
const imp = flattFile(converterPinyin, globalPath);
const exp = `\nconst Images = {\n ${Object.keys(exit)
  .map((name) => `\t${name},\n`)
  .join("")}\n};\nexport default Images;\n`;

console.log(imp);
console.log(exp);

fs.writeFileSync("./output.js", imp + exp);
