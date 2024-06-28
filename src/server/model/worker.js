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
    async info(id, fields = "id", type = 0, isHtml = true, isSendMail = false) {
        let rtnObj = {};
        fields = fields.replaceAll(" ", "");
        let datas = await sf.find(this.name, { id: id }, fields, 1);
        let rtnStr = "";
        let files = [];
        if (datas.length > 0) {
            this.trans(datas, fields);
            for (let data of datas) {
                let rtnArray = [];
                rtnArray.push("状態：" + data.Status__c);
                if (type == 0) {
                    rtnArray.push("Skill:" + data.TecLevel__c);
                    rtnArray.push("日本語:" + data.Japanese__c);
                }
                rtnArray.push(data.Information__c);

                if (!isSendMail) {
                    let resume = data.Resume__c;
                    files.push(resume);
                    //TODO 转换加密3日内有效
                    // if (type == 1) {
                    //     resume = resume + "#" + type; //加密
                    // }
                    let link = this.server + "files/resume/" +
                        resume;
                    if (isHtml) {
                        rtnArray.push("<a href='" +
                            link + "' target='_blank'>履歴書Download</a>");
                    } else {
                        rtnArray.push(link);
                    }
                }
                if (isHtml) {
                    rtnStr = rtnArray.join("<br><br>");
                } else {
                    rtnStr = rtnArray.join("\r\n");
                }
            }
        }
        rtnObj.rtn = rtnStr;
        rtnObj.files = files;
        return rtnObj;
    }

}
