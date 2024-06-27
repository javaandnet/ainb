import Worker from '../model/worker.js';
import TestUtil from '../test/testUtil.js';

const test = new TestUtil();

const worker = new Worker();


async function testFunc(type, isHtml) {
    await test.testAwait(worker, "info", "a05F300000HYu5xIAD", "Id, Name,Status__c, AutoNo__c,Japanese__c,TecLevel__c, Information__c, NameToOuter__c,Resume__c", type, isHtml);
}
// async function testInfo(id, fields) {
//     console.log(await worker.info(id, fields, 0, true));
//     console.log(await worker.info(id, fields, 1, true));
//     console.log(await worker.info(id, fields, 0, false));
//     console.log(await worker.info(id, fields, 1, false));
// }
// testInfo("a05F300000HYu5xIAD", "Id, Name, Status__c, AutoNo__c,Japanese__c,TecLevel__c, Information__c, NameToOuter__c,Resume__c");
// await testFunc(0, true);
// await testFunc(1, true);
// await testFunc(0, false);
// await testFunc(1, false);

await test.testAwait(worker, "trans", "Status__c", { Status__c: 9 });