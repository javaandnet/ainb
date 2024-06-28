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
}
