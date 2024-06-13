
// const AI = require("./util/ai.js");
 
import { JSH } from './jsh.js';


export default  class SF {
  constructor(x) {
    // this.ai = new AI();;
  }

  async aaa() {
    //console.log(await ai.ask("会社の名前は教えてください"));
    // await ai.company("社長は誰ですか");
    // await ai.company("社員は何人ですか？");
    // await ai.company("未稼働の社員は何人？");
    // await ai.company("给孙光通过邮件发送任峰磊的简历");
  }

  async noWorkName() {
    var jsh = new JSH();
    var sql = "SELECT Id,  Name FROM Worker__c  where SalesStatus__c = '可能'";
    var data = await  jsh.query(sql);
    var str = "";
    if (data.totalSize > 0) {
      data.records.forEach((element) => {str = str +","+element.Name});
    }
    console.log(str);
    return str;
 
  }
}
// Test
// var sf = new SF();
// sf.noWorkName();