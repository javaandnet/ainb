import Excel from '../util/excel.js';

import Util from '../util/util.js';
import SF from '../util/sf.js';
import Model from '../model/model.js';



const util = new Util();
const sf = new SF();
export default class Worker extends Model {
    constructor(server = "") {

        const keyToValue =
        {
            "Status__c": { "0": "待機中", "2": "提案中", "3": "面接あり", "4": "契約済", "9": "稼働中", "-1": "管理外", "8": "保留中" },
            "Japanese__c": { "0": "N3以下", "1": "N2相当", "4": "N2", "5": "N1相当", "7": "N1", "8": "N1流暢", "9": "ネイティブ" },
            "TecLevel__c": { "0": "初心者", "1": "簡単できる", "2": "少しFollow必要", "3": "独立作業可能", "4": "Follow他人可能", "5": "全部できる", },
        };
        super(server, "Worker__c", keyToValue);
        this.excel = new Excel();
        this.model = "worker";

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
        let datas = await sf.find(this.sfModel, { id: id }, fields, 1);
        this.trans(datas, fields);
        return await this.info(datas, type = 0, isHtml = true, isSendMail = false);
    }


    getSyncCondition() {
        return { SalesStatus__c: '可能' };
    }

    getSyncConfig() {
        return {
            model: "Worker__c",
            field: "Id, Name,Resume__c,AutoNo__c"
        };
    }


    getSyncTxt(data) {
        let txt = "";
        const filePath = this.rootPath + data.Resume__c;
        const fileExist = util.checkExistFile(filePath);
        if (fileExist) {// 文件存在
            this.initExcel(filePath);
            txt = this.toTxt();
        }
        return txt;
    }


    toTxt() {
        const lastRow = this.excel.getLastRow();
        const skillConfig = {
            start: "◇工程経験：",
            end: "◇その他：",
            judgeCell: "E",
            infoCell: "I",
        };
        const resumeConfig = {
            index: "業種：",
            judgeCell: "E",
            end: "◇その他：",
            judgeCell: "K",
            infoCell: "I",
        };
        let skillFLg = false;
        let skillFinishFLg = false;
        let skillArray = [];

        for (let i = 1; i < lastRow; i++) {
            /**Skill Part */
            if (!skillFinishFLg) {
                const judgeName = skillConfig.judgeCell + i;
                const infoName = skillConfig.infoCell + i;
                const cell = this.excel.getCellValue(judgeName, 0);
                if (util.defined(cell)) {
                    if (cell == skillConfig.start) {
                        skillFLg = true;
                        skillArray.push("スキル部分開始する");
                    } else if (cell == skillConfig.end) {
                        skillFLg = false;
                        skillFinishFLg = true;
                        skillArray.push("スキル部分終了する");
                    }
                    if (skillFLg) {
                        skillArray.push(cell + ":" + this.excel.getCellValue(infoName));
                    }
                }
            }
            /**resume Part */
            if (skillFinishFLg) {
                const judgeCellName = resumeConfig.judgeCell + i;

                let cellResumeNames = {
                    "kind": [1, 0],
                    "sepg": [1, 4],
                    "os": [5, 0],
                    "language": [3, 0],
                    "info": [-6, 0],
                };
                let cellPhaseNames = {
                    "調査分析": [9, 0],
                    "要件定義": [10, 0],
                    "基本設計": [11, 0],
                    "詳細設計": [12, 0],
                    "製　　造": [13, 0],
                    "単体試験": [14, 0],
                    "結合試験": [15, 0],
                    "総合試験": [16, 0],
                    "運用保守": [17, 0],
                };
                const judgeCell = this.excel.getCellValue(judgeCellName);
                //Index確定
                if (util.defined(judgeCell)) {
                    //履历部分
                    let resumeCellMap = {};
                    //担当部分
                    let phaseCellMap = {};

                    /**1回的数据 一时保存,以此为基准取值 [業種：]使用判断*/
                    if (judgeCell == resumeConfig.index) {
                        const infoCellCol = this.excel.getColName(resumeConfig.judgeCell, 1);
                        let infoAray = [];

                        /**業　　　務　　　経　　　験 */
                        Object.keys(cellResumeNames).map((k) => {
                            resumeCellMap[k] = this.excel.calCellName(judgeCellName, cellResumeNames[k][0], cellResumeNames[k][1]);
                        });

                        /** 開発段階 */
                        Object.keys(cellPhaseNames).map((k) => {
                            phaseCellMap[k] = this.excel.calCellName(resumeConfig.judgeCell + i, cellPhaseNames[k][0], 0);
                        });

                        /** Get Value*/
                        Object.keys(resumeCellMap).forEach((k) => {
                            infoAray.push(this.excel.getCellValue(resumeCellMap[k]));
                        });
                        skillArray.push("業務部分開始する");
                        skillArray.push(infoAray.join("\t"));
                        skillArray.push("業務部分終了する");

                        infoAray = [];
                        Object.keys(phaseCellMap).forEach((k) => {
                            if (this.excel.getCellValue(phaseCellMap[k]) == "●") {
                                infoAray.push(k);
                            }
                        });
                        skillArray.push("業務担当部分開始する");
                        skillArray.push(infoAray.join("\t"));
                        skillArray.push("業務担当部分終了する");
                    }
                }
            }
        }
        const txt = skillArray.join("\r\n");
        return txt;
        // console.log(skillArray.join("\r\n"));
    }
}
