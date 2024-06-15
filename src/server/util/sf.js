
// const AI = require("./util/ai.js");

import { JSH } from './jsh.js';


export default class SF {
  constructor(x) {

  }

  async workByName(name) {
    var jsh = new JSH();
    var sql = "SELECT Id, Name, Information__c, Resume__c FROM Worker__c where name =  '" + name +"'";
    var data = await jsh.query(sql);
    var str = "";
    if (data.totalSize > 0) {
      var rec = data.records[0];
      return {"name":rec.Name,"information":rec.Information__c,"link":rec.Resume__c};
    }

    return {information:""};

  }

  async noWorkName() {
    var jsh = new JSH();
    var sql = "SELECT Id,  Name FROM Worker__c  where SalesStatus__c = '可能'";
    var data = await jsh.query(sql);
    var str = "";
    if (data.totalSize > 0) {
      data.records.forEach((element) => { str = str + "," + element.Name });
    }
    // console.log(str);
    return str;

  }
}
