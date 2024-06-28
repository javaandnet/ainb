import Util from '../util/util.js';
import SF from '../util/sf.js';
const util = new Util();
const sf = new SF();
export default class Model {
    constructor(server = "http://160.16.216.251:8379/", name, keyToValue) {
        this.name = name;
        this.server = server;
        this.keyToValue = keyToValue;
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
        // 将字段名转换为正则表达式
        const regex = new RegExp(`【${this.escapeRegExp(fieldName)}】：([^\\n]*)`);
        // 将匹配的值替换为新的值，判断到换行符位置，会把\r去掉所以需要补上
        let newText = text.replace(regex, `【${fieldName}】：${newValue}\r`);
        // newText = newText +"\r\n";
        return newText;
    }
}
