import { AI } from '../util/ai.js';

import Util from '../util/util.js';
const util = new Util();
import { AssistantFactory } from '../util/assistantFactory.js';
const assistantFactory = new AssistantFactory();

const ai = new AI();


const ASSISITANT_NAME = "company";

let assistant = assistantFactory.get(ASSISITANT_NAME);
async function testGetModelById() {
    //更新配置
    var data = await assistant.func.getModelById({
        model: "worker",
        id: "a05F300000HYu46IAD"
    });
    console.log(data);
}
testGetModelById();
