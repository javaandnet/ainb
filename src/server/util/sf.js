
// const AI = require("./util/ai.js");

import { JSH } from './jsh.js';


export default class SF {
  constructor(x) {

  }
  async projectByCondition(name) {
    var jsh = new JSH();

    var sql = "SELECT Id, Name, Status__c,AutoNo__c FROM Project__c where status__c = '" + name + "'";
    var data = await jsh.query(sql);

    return data;
  }
  async projectByNo(no) {
    var jsh = new JSH();
    var sql = "SELECT Id, Name, Status__c,AutoNo__c,Detail__c FROM Project__c where AutoNo__c = '" + no + "'";
    var data = await jsh.query(sql);
    var str = "";
    if (data.totalSize > 0) {
      var rec = data.records[0];
      return { "id": rec.Id, "name": rec.Name, "no": rec.AutoNo__c, "detail": rec.Detail__c };
    }
    return null;

  }
  async empByName(name) {
    var jsh = new JSH();
    var sql = "SELECT Id, Name, Information__c, Resume__c FROM Worker__c where name =  '" + name + "'";
    var data = await jsh.query(sql);
    var str = "";
    if (data.totalSize > 0) {
      var rec = data.records[0];
      return { "id": rec.Id, "name": rec.Name, "information": rec.Information__c, "link": rec.Resume__c };
    }
    return null;
  }
  async empByNo(no) {
    var jsh = new JSH();
    var sql = "SELECT Id, Name, Information__c, Resume__c FROM Worker__c Where AutoNo__c =  '" + no + "'";
    var data = await jsh.query(sql);
    var str = "";
    if (data.totalSize > 0) {
      var rec = data.records[0];
      return { "id": rec.Id, "name": rec.Name, "information": rec.Information__c, "link": rec.Resume__c };
    }
    return null;
  }
  async findProject(status) {
    var jsh = new JSH();
    var con = {};
    if (status) {
      con.status = status;
    }
    var obj = await jsh.find("Project__c", con, "No", "Id", "Name", 50);
    if (obj.length > 0) {
      return obj;
    }
    return null;
  }

  async find(name, condition, fields, limit) {
    var jsh = new JSH();
    return await jsh.find(name, condition, fields, limit);
  }

  async retrieve(model, id) {
    var jsh = new JSH();
    return await jsh.retrieve(model, id);
  }

  async updateStatus(name, status) {
    var jsh = new JSH();
    var obj = await jsh.find("worker__c", { 'Name': name }, "Id");
    if (obj.length > 0) {
      await jsh.update("worker__c", { Id: obj[0].Id, 'Name': name, 'ArriveinJP__c': status });
      return "OK";
    }
    return "NG";
  }

  async updateByCondition(objName, condition, updateObj) {
    var jsh = new JSH();
    var obj = await jsh.find(objName, condition, "Id");
    if (obj.length > 0) {
      updateObj.Id = obj[0].Id;
      return await jsh.update(objName, updateObj);
    }
    return { id: -1 };
  }

  async update(objName, updateObj) {
    var jsh = new JSH();
    return await jsh.update(objName, updateObj);

  }

  async insert(objName, insertObj) {
    var jsh = new JSH();
    return await jsh.insert(objName, insertObj);
  }


  async workerNoWork() {
    var jsh = new JSH();
    var sql = "SELECT Id,  Name,AutoNumber__c  FROM Worker__c  where SalesStatus__c = '可能'";
    var data = await jsh.query(sql);
    if (obj.length > 0) {
      return obj;
    }
    return null;
    //   var names = [];
    //   if (data != null && data.totalSize > 0) {
    //     data.records.forEach((element) => { names.push(element.Name) });
    //   }
    //   return names.join(",");
  }
}
