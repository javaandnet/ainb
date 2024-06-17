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
// const assistant = new Assistant();
//azure.sample();
//Delete All Assistants
// await ai.deleteAssistants();
//Create a new Assistant
// var res = await(ai.createAssistant("company"));
//初始化使用
// var res = await ai.getAssistant("company");

// //更新配置
// ai.updateAssistant("company");
// //创建Thread
//  await ai.createThread();
// //Sample
// var msg = await ai.chat("未完了案件一覧を教えてください");
// var msg = await ai.chat("FSR-0048");
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


var args =  { query: 'active', condition: 'list' };

function getEmp(args) {

    var status = util.getArg(args, ["status","employment_status"], {
        "未稼働": "inactive",
        "inactive": "inactive",
        "unassigned": "inactive",
        "稼働していない": "inactive",
        "working": "active",
        "active": "active"
        , "稼働中": "active"
    }
    );
    if (status != null) {
        args.status = status;
        return args;
    }

    var name = util.getArg(args, ["name"], null, "name=");
    if (name != null) {
        args.name = name;
    }
    return args;
}
//TEST
console.log(getEmp({ query: 'active', condition: 'list' }));
console.log(getEmp({ query: 'aaa', condition: 'active' }));
console.log(getEmp({ query: 'all', condition: 'inactive' }));
console.log(getEmp({query: 'employees', condition: {status:'inactive'}}));
console.log(getEmp({query: 'employees', condition: {employment_status:'inactive'}}));
console.log(getEmp({condition: 'name=XXX ', query: {}}));
