import Worker from '../model/worker.js';
import Project from '../model/project.js';
const workerModel = new Worker();
const projectModel = new Project();
import TestUtil from '../test/testUtil.js';
const test = new TestUtil();
// console.log(resume.toTxt());
// test.test(workerModel, "sync", { AutoNo__c: '0152' }, true);
// test.test(workerModel, "sync", {}, true);
// test.test(workerModel, "sync", { SalesStatus__c: '可能' }, true);
// test.test(workerModel, "sync", { SalesStatus__c: '可能' }, true);
// test.test(projectModel, "sync", { "status__c": "0" }, true);
//test.test(project, "sync", {"status__c":"0" }, true);
// const workers = await workerModel.getDBData("name,vec,must", {});
// for (const worker in workers) {
//     workerModel.Resume__c
//     workerModel.getSyncTxt(worker);
// }
const projects = await projectModel.getDBData("sfid,no,name,vec,must,phase", {});
let workers = await workerModel.getDBData("sfid,no,name,vec,must,phase", {});
for (const project of projects) {
    Project.sortWorker(project, workers);
    // console.log(project);
}






