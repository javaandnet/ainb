import Worker from '../model/worker.js';
import TestUtil from '../test/testUtil.js';

const test = new TestUtil();

const worker = new Worker();


async function testInfo(type, isHtml) {
    const id = "a05F300000HYu5xIAD";
    const fields = "Id, Name,Status__c, AutoNo__c,Japanese__c,TecLevel__c, Information__c, NameToOuter__c,Resume__c";
    await test.testAwait(worker, "info", id, fields, type, isHtml, true);
}
 

await testInfo(0, true);
await testInfo(1, true);
await testInfo(0, false);
await testInfo(1, false);

await test.testAwait(worker, "transValue", "Status__c", { Status__c: 9 });