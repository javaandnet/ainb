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

async function testConfirmInfo() {
    var data = {
        sender: [
            { type: 0, text: 'FSR会社', value: '13', icon: 'wap-home' },
            {
                type: 2,
                text: 'ts_xyf@hotmail.com',
                value: 'ts_xyf@hotmail.com',
                icon: 'envelop-o'
            },
            {
                type: 2,
                text: 'javaandnet@gmail.com',
                value: 'javaandnet@gmail.com',
                icon: 'envelop-o'
            },
            {
                type: 3,
                text: 'javaandnet@gmail.com',
                value: 'javaandnet@gmail.com',
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
            },
            {
                text: '李宥霖',
                value: 'a05F300000HYu61IAD',
                checked: true,
                type: 9,
                icon: ''
            },
            {
                text: '王瀚達',
                value: 'a05F300000HYu68IAD',
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
