import Worker from '../model/worker.js';
const worker = new Worker();
import TestUtil from '../test/testUtil.js';
const test = new TestUtil();
// console.log(resume.toTxt());
test.test(worker, "sync",{no:"0107"});

