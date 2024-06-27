import Util from '../util/util.js';
import SF from '../util/sf.js';
const util = new Util();
const sf = new SF();
export default class Worker {
    constructor(server = "http://160.16.216.251:8379/") {

        this.name = "Worker__c";
        this.server = server;
        this.keyToValue =
        {
            "Status__c": { "0": "待機中", "2": "提案中", "3": "面接あり", "4": "契約済", "9": "稼働中", "-1": "管理外", "8": "保留中" },
            "Japanese__c": { "0": "N3以下", "1": "N2相当", "4": "N2", "5": "N1相当", "7": "N1", "8": "N1流暢", "9": "ネイティブ" },
            "TecLevel__c": { "0": "初心者", "1": "簡単できる", "2": "少しFollow必要", "3": "独立作業可能", "4": "Follow他人可能", "5": "全部できる", },
        };
    }

    /**
     *  変換
     * @param {*} key 
     * @param {*} obj 
     * @returns 
     */
    trans(key, obj) {
        if (util.undefined(this.keyToValue[key])) {
            return "";
        }
        return this.keyToValue[key][obj[key]];
    }

    /**
     *  技術者情報
     * @param {*} id 
     * @param {*} type  0 内部
     * @param {*} isHtml  true Tag
     */
    async info(id, fields = "id", type = 0, isHtml = true) {
        fields = fields.replaceAll(" ", "");
        let datas = await sf.find(this.name, { id: id }, fields, 1);
        let data = null;
        if (datas.length > 0) {
            const mapKeys = Object.keys(this.keyToValue);
            data = datas[0];
            let fieldsArray = fields.split(",");
            for (const f of mapKeys) {
                if (fieldsArray.indexOf(f) >= 0) {
                    data[f] = this.trans(f, data);//変換
                }
            }
        }
        let rtnArray = [];
        if (data != null) {
            rtnArray.push("状態：" + data.Status__c);
            if (type == 0) {
                rtnArray.push("Skill:" + data.TecLevel__c);
                rtnArray.push("日本語:" + data.Japanese__c);
            }
            rtnArray.push(data.Information__c);
            let link = this.server + "files/resume/" +
                data.Resume__c;
            if (isHtml) {
                rtnArray.push("<a href='" +
                    link + "' target='_blank'>履歴書Download</a>");
            } else {
                rtnArray.push(link);
            }

        }
        let rtnStr = "";
        if (isHtml) {
            rtnStr = rtnArray.join("<br><br>");
        } else {
            rtnStr = rtnArray.join("\r\n");
        }


        return rtnStr;
    }

}
