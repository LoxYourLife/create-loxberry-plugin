const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const path = require('path');
const fs = require('fs');
const { open } = require('fs').promises;
const handlebars = require('handlebars');
const { indexOf } = require('lodash');

const exec = async (cmd, args, options) => {
  try {
    const { stdout } = await execFile(cmd, args, options);
    if (stdout.substr(-1) === '\n') return stdout.slice(0, -1);
    return stdout;
  } catch {
    return undefined;
  }
};

const copyRecursive = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};
const copyContentRecursive = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  }
};

const readFile = async (filename) => {
  let fileHandle, fileContent;
  try {
    fileHandle = await open(filename, 'r');
    fileContent = await fileHandle.readFile();
    fileContent = fileContent.toString();
    await fileHandle.close();
  } catch {
    if (fileHandle) await fileHandle.close();
  }
  return fileContent;
};

const writeFile = async (filename, content) => {
  let fileHandle;
  try {
    fileHandle = await open(filename, 'w');
    await fileHandle.writeFile(content);
  } finally {
    if (fileHandle) await fileHandle.close();
  }
};

const renderFile = (src, dest) => async (variables) => {
  const rawContent = await readFile(src);
  if (undefined === rawContent) return;
  const content = handlebars.compile(rawContent)(variables);
  if (dest === undefined) {
    return writeFile(src, content);
  }
  return writeFile(dest, content);
};

module.exports = {
  exec,
  copyRecursive,
  copyContentRecursive,
  renderFile
};
