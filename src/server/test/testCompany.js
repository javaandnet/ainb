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

async function testCompany_001() {
    await ai.chat("劉磊営業停止");
}

/**
 *  案件一覧、状態変更
 * */
async function testCompany_002() {
    await ai.chat("案件一覧を教えてください");
    await ai.chat("案件FSR-004停止");
}


/**
 *  案件一覧、状態変更
 * */
async function testCompany_004() {
    await ai.chat("未稼働技術者一覧は教えてください");
    await ai.chat("FSR-TW607の技術者")
}

/**
 *  测试修改单价内容
 * */
async function testCompany_003() {
    // await ai.chat("未稼働技術者一覧は教えてください");
    await ai.chat("未稼働社員一覧は教えてください");
    // await ai.chat("単価修正100");
}

/**
 *  案件一覧、状態変更
 * */
async function testCompany_005() {
    await ai.chat("案件一覧を教えてください");
    await ai.chat("案件FSR-0004の情報");
}

async function testCompany_006() {
    var outFuncMap = {};
    outFuncMap[ASSISITANT_NAME] = ["selectInfo", "addInfo", "listInfo"];
    var message = { content: 'listInfo', args: { type: 'worker' }, option: 'server' };
    const rtn = await ai.exe(outFuncMap, { func: message.content, args: message.args }, {}).then(function (data) {
        console.log(data);
    });
}
async function testConfirmInfo() {
    var data = {
        root: "/Users/fengleiren/git/ainb/src/server",
        sender: [
            {
                type: 2,
                text: '任峰磊 Hotmail',
                value: 'ts_xyf@hotmail.com',
                icon: 'envelop-o'

            }, {
                type: 3,
                text: 'ren',
                value: 'nin',
                icon: 'envelop-o'
            }
        ],
        worker: [
            {
                text: '宋岩',
                value: 'a05F300000HYu5xIAD',
                checked: true,
                type: 9,
                icon: ''
            }
        ]
    };

    //更新配置
    var data = await assistant.out.confirmInfo(data);
    console.log(data);
}
testConfirmInfo();
