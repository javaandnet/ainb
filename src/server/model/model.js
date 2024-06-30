import Util from '../util/util.js';
import SF from '../util/sf.js';
import { Config } from "../util/config.js";
import OpenAI from "openai";
import MySql from '../util/mysql.js';
const openai = new OpenAI(Config.openai);
const mySql = new MySql();
const util = new Util();
const sf = new SF();
export default class Model {
    constructor(server, name, keyToValue) {
        this.name = name;
        this.server = server;
        this.keyToValue = keyToValue;
        mySql.createPool();
        this.mySql = mySql;
    }

    setRootPath(path) {
        this.rootPath = path;
    }

    initExcel(path) {
        this.excel.init(path);
    }

    embedTxt = async function (text) {
        try {
            const response = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text,
            });
            if (response.data && response.data.length > 0 && response.data[0].embedding) {
                return response.data[0].embedding;
            } else {
                return Buffer.from('');
            }
        } catch (error) {
            console.error("embedTxt:", error);
            return Buffer.from('');
        }
    }


    async sync(condition= {}, isVec = true) {
        const config = this.getSyncConfig();
        const mySql = this.mySql;
        const me = this;
        const model = config.model;
        const field = config.field;
        if (util.undefined(condition)) {
            condition = this.getSyncCondition();
        } else {
            if (condition.no) {
                condition = { "AutoNo__c": condition.no };
            } else if (condition.id) {
                condition = { "Id": condition.id };
            }
        }

        let datas = await sf.find(model, condition, field, 200);
        let mysqlDatas = [];
        let nos = [];

        for (const data of datas) {
            let ele = {};
            ele.sfid = data.Id;
            ele.name = data.Name
            ele.no = data.AutoNo__c;
            let txt = this.getSyncTxt(data);
            ele.txt = txt;
            //Sync vec
            if (isVec) {
                let vec = Buffer.from("");
                if (txt != "") {
                    vec = await this.embedTxt(txt);
                }
                ele.vec = vec;
            }
            nos.push(ele.no);
            mysqlDatas.push(ele);
        }
        const deleteRow = await mySql.deleteIn(this.model, "no", nos);

        console.log("Sync Data:", deleteRow);
        return await mySql.insert(this.model, mysqlDatas);
    }


    /**
     *  変換
     * @param {*} key 
     * @param {*} obj 
     * @returns 
     */
    transValue(key, obj) {
        if (util.undefined(this.keyToValue[key])) {
            return "";
        }
        return this.keyToValue[key][obj[key]];
    }

    async getDataByIds(ids) {
        return await sf.retrieve(this.name, ids);
    }

    /**
     *  mapのValueと交換するï
     * @param {*} datas 
     * @param {*} fields 検索Fileds
     */
    trans(datas, fields) {
        let rtnStr = "";
        for (let data of datas) {
            const mapKeys = Object.keys(this.keyToValue);
            let fieldsArray = fields.split(",");
            for (const f of mapKeys) {
                if (fieldsArray.indexOf(f) >= 0) {
                    data[f] = this.transValue(f, data);//変換
                }
            }
        }
    }

    async info() {

    }

    async encrypt(str) {
        return util.encrypt(str);
    }
    async decrypt(str) {
        return util.decrypt(str);
    }
    /**
     * 
     * @param {*} datas 
     * @param {*} type //内部外部
     * @returns 
     */
    async infoTxt(datas, type) {
        let rtn = await this.info(datas, type, false, false);
        return rtn.rtn;
    }

    /**
     * 
     * @param {*} datas 
     * @param {*} type //内部外部
     * @returns 
     */
    async infoHtml(datas, type) {
        let rtn = await this.info(datas, type, true, false);
        return rtn.rtn;
    }
    escapeRegExp(string) {
        // 转义特殊字符
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    replaceFieldValue(text, fieldName, newValue) {
        if (text == null) {
            return "";
        }
        // 将字段名转换为正则表达式
        const regex = new RegExp(`【${this.escapeRegExp(fieldName)}】：([^\\n]*)`);
        // 将匹配的值替换为新的值，判断到换行符位置，会把\r去掉所以需要补上
        let newText = text.replace(regex, `【${fieldName}】：${newValue}\r`);
        // newText = newText +"\r\n";
        return newText;
    }
}
