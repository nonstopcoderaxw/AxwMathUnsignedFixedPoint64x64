const fs = require("fs");
const SAVE_TO_PATH = "./test/data";


async function saveObj(objName, obj) {
    await createFile(`${SAVE_TO_PATH}/${objName}.json`, JSON.stringify(obj, null, 4));
}

async function loadObj(objName) {
    return JSON.parse(await readFile(`${SAVE_TO_PATH}/${objName}.json`));
}

async function clearObj(objName) {
    await saveObj(objName, "");
}

async function createFile(fileName, body){
    await fs.promises.writeFile(fileName, body);
    return true;
}

async function readFile(fileName){
    return await fs.promises.readFile(fileName, 'utf8');
}

module.exports = {
    saveObj, loadObj, clearObj
}
