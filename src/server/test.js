import { AI } from './util/ai.js';


const ai = new AI();
// const assistant = new Assistant();

// console.log(assistant.get("company"));
 // await ai.deleteAssistants();
//var res = await(ai.createAssistant());
var res = await(ai.createAssistant("company"));
//  await ai.getAssistant("company");
// ai.updateAssistant();
// await ai.createThread();
// var msg = await ai.chat("未稼働一覧は教えてください");

// console.log("AIから：\r\n",msg);
// //   await ai.chat("社員数は何人ですか？");
// var text = "未稼働社員は教えてください";
// text = "未稼働一覧は教えてください";
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
