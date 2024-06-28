import Worker from '../model/worker.js';
import TestUtil from '../test/testUtil.js';

const test = new TestUtil();

const worker = new Worker();


async function testInfo(type, isHtml, isSendMail) {
    const id = "a05F300000HYu5xIAD";
    const fields = "Id, Name,Status__c, AutoNo__c,Japanese__c,TecLevel__c, Information__c, NameToOuter__c,Resume__c";
    await test.test(worker, "infoById", id, fields, type, isHtml, isSendMail);
}


// await testInfo(0, true);
// await testInfo(1, true);
// await testInfo(0, false);
await testInfo(1, true, true);
const objs = await worker.getDataByIds(["a05F300000HYu5xIAD"]);
// await test.test(worker, "infoTxt", objs, 0);
// 