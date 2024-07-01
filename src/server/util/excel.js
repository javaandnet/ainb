// ExcelToTxt.js
import xlsx from 'xlsx';
import fs from 'fs';
import Util from '../util/util.js';
const util = new Util();

class Excel {
  constructor(inputFile) {
    if (inputFile) {
      this.init(inputFile);
    }
    this.sheet = null;
  }

  init(path) {
    this.workbook = xlsx.readFile(path);
  }

  convertToTxt() {
    const sheetName = this.workbook.SheetNames[0];
    const worksheet = this.workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const textData = data.map(row => row.join('\t')).join('\n');
    fs.writeFileSync(this.outputFile, textData, 'utf8');
    console.log('转换完成！');
  }

  getCellValue(cellAddress, col = 0, line = 0, sheetName) {

    if (util.undefined(sheetName)) {
      sheetName = this.workbook.SheetNames[0];
    }
    this.sheet = this.workbook.Sheets[sheetName];

    if (!(col == 0 && line == 0)) {
      cellAddress = this.calColumn(cellAddress, col, line);
    }
    const worksheet = this.sheet;
    if (!worksheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    const cell = worksheet[cellAddress];
    return cell ? cell.v : undefined;
  }

  getLastRow(sheetIndex = 0) {
    const sheetName = this.workbook.SheetNames[sheetIndex];
    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }

    const range = xlsx.utils.decode_range(worksheet['!ref']);
    return range.e.r + 1; // 返回最后一行的行号（1-based index）
  }
  calCellName(column, col, line) {
    // 正则表达式匹配列名中的字母部分和数字部分
    const matches = column.match(/([A-Z]+)(\d+)?/);

    if (!matches) {
      throw new Error('Invalid column format');
    }

    let letters = matches[1]; // 列名中的字母部分
    let number = matches[2] ? parseInt(matches[2], 10) : 0; // 列名中的数字部分（如果有）

    // 处理增量
    number = number + line;

    if (!col) {
      col = 'A';
    }


    // 将字母部分转换为数字表示（A=1, B=2, ..., Z=26, AA=27, AB=28, ...）
    let base26 = 0;
    for (let i = 0; i < letters.length; i++) {
      base26 = base26 * 26 + (letters.charCodeAt(i) - 64); // 'A' 的 ASCII 码为 65，所以减去 64 得到对应的数字
    }

    // 计算新的列名和数字
    let newBase26 = base26 + col;
    let newLetters = '';

    // 将数字表示转换回字母部分
    while (newBase26 > 0) {
      let remainder = (newBase26 - 1) % 26;
      newLetters = String.fromCharCode(remainder + 65) + newLetters; // 余数加上 65 得到对应的字母
      newBase26 = Math.floor((newBase26 - 1) / 26);
    }

    // 生成新的列名
    const newColumn = newLetters + (number > 0 ? number.toString() : '');
    return newColumn;
  }

  getColName(column, increment) {
    let base26 = 0;

    // 将列名转换为数字表示
    for (let i = 0; i < column.length; i++) {
      base26 = base26 * 26 + (column.charCodeAt(i) - 64); // 'A' 的 ASCII 码为 65
    }

    // 增加指定的数字
    base26 += increment;

    // 将数字表示转换回字母部分
    let newLetters = '';
    while (base26 > 0) {
      let remainder = (base26 - 1) % 26;
      newLetters = String.fromCharCode(remainder + 65) + newLetters;
      base26 = Math.floor((base26 - 1) / 26);
    }

    return newLetters;
  }
}

export default Excel;
