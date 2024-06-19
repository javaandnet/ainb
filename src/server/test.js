import { AI } from './util/ai.js';
import Util from './util/util.js';
const util = new Util();
import { Config } from "./util/config.js";
import OpenAI from "openai";
import { Azure } from './util/azure.js';
import fs from "fs";
const azure = new Azure();
const openai = new OpenAI(Config.openai);
const ai = new AI();
const ASSISITANT_NAME = "company";
// const assistant = new Assistant();
//azure.sample();
//Delete All Assistants
// await ai.deleteAssistants();
//Create a new Assistant
// var res = await(ai.createAssistant("company"));
//初始化使用
var res = await ai.getAssistant("company");
//更新配置
ai.updateAssistant("company");
//创建Thread
//await ai.createThread();
// //Sample
//var msg = "";
//msg = await ai.chat("未完了案件一覧を教えてください");
//  msg = await ai.chat("FSR-0048");
//msg = await ai.chat("FSR-0048");
//  await ai.chat("選択する");
//  await ai.chat("選択する");
//  await ai.chat("選択する");
//var msg = await ai.chat("稼働社員一覧は教えてください");
//console.log("AIから：\r\n",msg);
//   await ai.chat("社員数は何人ですか？");
// var text = "未稼働社員は教えてください";
// text = "未稼働社員一覧は教えてください";
// text = "劉磊の説明文を教えてください";
// var msg ="";
//  //msg =  await ai.chat(text);
//  text = "劉磊の説明文を任峰磊にメール送信します";
//  msg =await ai.chat(text);
// //会社の名前は
//  text = "送信する";
//  msg =await ai.chat(text);
//  console.log("AIから：\r\n",msg);
// 未稼働一覧は教えてください
// 劉磊の説明文を教えてください。
// 未稼働社員で劉磊がいますか？



// import { Readable } from 'stream';

// var path = "/Users/fengleiren/git/ainb/src/server/public/wav/1718536871971.wav";
// var buffer = fs.readFileSync(path)
// const stream = Readable.from(buffer);


//   const transcription = await openai.audio.transcriptions.create({
//     file: await toFile(buffer, "audio.wav", {
//         contentType: "audio/wav",
//       }),
//     model: "whisper-1",
//   });
function testUtil_01() {
    var rtn = {
        rtn: {
            ai: '{"type":"案件","flag":"1","info":"FSR-0048"}',
            func: 'selectInfo',
            args: { type: '案件', flag: '1', info: 'FSR-0048' },
            type: 'AI',
            str: '案件FSR-0048が選択されました。何かほかにお手伝いできることがあればお知らせください。'
        }
    };

    var json = { content: rtn.rtn.str };
    //外在插件执行
    ai.exe({ "company": ["selectInfo"] }, rtn.rtn, json);
    console.log(json);
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
    await ai.chat("FSR-TW607の技術者");

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
 *  外部実行サンプル
 */
async function testAI_001() {
    var msg = "#Add# 案件名：テスト案件 ADDED FROM AI  \r\n案件内容\r\n案件内容2行テスト";
    var fitstLine = util.firstLine(msg);
    await ai.chat(msg, { "#Add#": "案件:{0}を追加する" }, "", false).then(function (rtn) {
        var json = { content: rtn.rtn.str };
        var outFuncMap = {};
        outFuncMap[ASSISITANT_NAME] = ["selectInfo", "addInfo"];
        ai.exe(outFuncMap, rtn.rtn, json).then(function (data) {
            console.log("testAI_001", json);
        });
    });
}
//

// await ai.chat("1+3");

// #Add# 案件名：テス
// あsだ


// あsdあsd

// あsd
/**
 *  案件一覧、状態変更
 * */
async function testCompany_005() {
    await ai.chat("案件一覧を教えてください");
    await ai.chat("案件FSR-0004の情報");
}
// testCompany_005();
testAI_001();
