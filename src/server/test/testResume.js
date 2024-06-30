import Resume from '../service/resume.js';
const resume = new Resume();
import TestUtil from '../test/testUtil.js';
const test = new TestUtil();
const excelPath = "/Users/fengleiren/git/ainb/src/server/files/resume/FSR_0107_宋E.xlsx";
resume.init(excelPath);
// console.log(resume.toTxt());
test.test(resume,"sync",{no:"0107"});

