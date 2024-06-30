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
        return data.Detail__c || "";
    }

}
