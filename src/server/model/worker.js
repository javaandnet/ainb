import Util from '../util/util.js';
import SF from '../util/sf.js';
import Model from '../model/model.js';
const util = new Util();
const sf = new SF();
export default class Worker extends Model {
    constructor(server = "http://160.16.216.251:8379/") {


        const keyToValue =
        {
            "Status__c": { "0": "待機中", "2": "提案中", "3": "面接あり", "4": "契約済", "9": "稼働中", "-1": "管理外", "8": "保留中" },
            "Japanese__c": { "0": "N3以下", "1": "N2相当", "4": "N2", "5": "N1相当", "7": "N1", "8": "N1流暢", "9": "ネイティブ" },
            "TecLevel__c": { "0": "初心者", "1": "簡単できる", "2": "少しFollow必要", "3": "独立作業可能", "4": "Follow他人可能", "5": "全部できる", },
        };

        super(server, "Worker__c", keyToValue);
    }

    /**
       *  技術者情報
       * @param {*} id 
       * @param {*} type  0 内部
       * @param {*} isHtml  true Tag
       * @param {*} isSendMail  メール発送
       */
    async info(datas, type = 0, isHtml = true, isSendMail = false) {
        let rtnStr = "";
        let files = [];
        let rtnObj = {};
        let rtnArray = [];
        for (let data of datas) {
            // rtnArray.push("状態：" + data.Status__c);
            if (type == 0) {
                rtnArray.push("Skill:" + data.TecLevel__c);
                rtnArray.push("日本語:" + data.Japanese__c);
            }
            // this.trans(datas, "Status__c");
            const information = this.replaceFieldValue(data.Information__c, "営業状況", this.transValue("Status__c", data));
            rtnArray.push(information);
            let resume = data.Resume__c;
            if (!isSendMail) {
                resume = resume + "#" + 1 + "#" + (new Date()).getTime();
                resume = util.encrypt(resume);
                let link = this.server + "files/resume/" + resume;
                if (isHtml) {
                    rtnArray.push("<a href='" +
                        link + "' target='_blank' download='" + data.Resume__c + "'>履歴書Download</a>");
                } else {
                    rtnArray.push(link);
                }
            } else {
                files.push(resume);
            }
        }
        if (isHtml) {
            rtnStr = rtnArray.join("<br>");
            rtnStr = rtnStr.replaceAll("\r\n", "<br>");
        } else {
            rtnStr = rtnArray.join("\r\n");
            rtnStr = rtnStr.replaceAll("<br>", "\r\n");
        }
        rtnObj.rtn = rtnStr;
        rtnObj.files = files;
        return rtnObj;
    }


    /**
     *  技術者情報
     * @param {*} id 
     * @param {*} type  0 内部
     * @param {*} isHtml  true Tag
     * @param {*} isSendMail  メール発送
     */
    async infoById(id, fields = "id", type = 0, isHtml = true, isSendMail = false) {
        fields = fields.replaceAll(" ", "");
        let datas = await sf.find(this.name, { id: id }, fields, 1);
        this.trans(datas, fields);
        return await this.info(datas, type = 0, isHtml = true, isSendMail = false);
    }

}
