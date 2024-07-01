import Excel from '../util/excel.js';

import Util from '../util/util.js';
import SF from '../util/sf.js';
import Model from '../model/model.js';

const util = new Util();
const sf = new SF();
export default class Project extends Model {
    constructor(server = "") {

        const keyToValue =
        {
            "Status__c": { "0": "待機中", "2": "提案中", "3": "面接あり", "4": "契約済", "9": "稼働中", "-1": "管理外", "8": "保留中" },
        };
        const sfModel = "Project__c";
        super(server, sfModel, keyToValue);
        this.excel = new Excel();
        this.model = "project";
        this.rootPath = "/Users/fengleiren/git/ainb/src/server/files/resume/";
    }

    /**
     * Default Condition
     * @returns 
     */
    getSyncCondition() {
        return { Status__c: '0' };
    }

    getSyncConfig() {
        return {
            model: this.sfModel,
            field: "Id, Name,Detail__c,AutoNo__c"
        };
    }

    getSyncTxt(data) {
        return { txt: data.Detail__c || "", must: "", phase: "" };
    }

    async getMustTxt(txt) {
        const msg = `
下文中的必须要求的关键词找出来，并用逗号分隔。\r\n
            ${txt.txt}`;
        const skill = await this.ask(msg);

        const regex = /[a-zA-Z]+|,/g;
        const matches = skill.match(regex);
        // matches = matches.split(",");
        // 使用 Set 去除数组中的重复项
        const uniqueMatches = [...new Set(matches)].filter(item => item !== ',' && item.length > 1);

        // 重新合成字符串
        const resultText = uniqueMatches.join(',');
        return resultText;
    }
    /**
     *  
     * @param {*} project 
     * @param {*} workers 
     * @param {*} isMust  要不要求必须条件
     */
    static async sortWorker(project, workers, isMust = false) {
        for (const worker of workers) {
            // console.log(util.getNotExist(project.must, worker.must));
            worker.notExist = util.getNotExist(project.must, worker.must);
            // if(worker.notExist.length > 0){
            //     console.log(`${project.must}:${worker.name} :${worker.must}`);
            // }
            if (worker["vec"] != null && worker["vec"].length > 0) {
                worker.score = util.similarity(project["vec"], worker["vec"]);
            } else {
                worker.score = 0;
            }
        }
        if (isMust) {
            workers = workers.filter(item => item.worker.notExist != "");
        }
        workers = workers.sort((a, b) => a.score - b.score);
        project.workers = workers;
        return workers;
    }
}
