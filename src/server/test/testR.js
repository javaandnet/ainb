import { AI } from '../util/ai.js';
import Util from '../util/util.js';
const util = new Util();

 
const ai = new AI();


const ASSISITANT_NAME = "restaurant";

var res = await ai.getAssistant(ASSISITANT_NAME);
//更新配置
ai.updateAssistant(ASSISITANT_NAME);
await ai.chat("菜单一览");
