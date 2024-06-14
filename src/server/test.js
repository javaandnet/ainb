import { AI } from './util/ai.js';

const ai = new AI();
//var res = await(ai.createAssistant());
var asstId ="asst_sQewFuoZYaY8i5VEH35yq7X8";
await ai.getAssistant(asstId);
var thread = await ai.createThread();
var msg = await ai.chat("会社の名前");
// console.log(msg);
