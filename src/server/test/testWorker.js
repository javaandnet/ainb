import Worker from '../model/worker.js';
import Project from '../model/project.js';
const workerModel = new Worker();
const project = new Project();
import TestUtil from '../test/testUtil.js';
const test = new TestUtil();
// console.log(resume.toTxt());
//test.test(workerModel, "sync", { SalesStatus__c: '可能' }, false);
//test.test(project, "sync", { }, true);


// const workers = await workerModel.getDBData("name,vec,must", {});
// for (const worker in workers) {
//     workerModel.Resume__c
//     workerModel.getSyncTxt(worker);
// }


