

import { AssistantFactory } from './assistantFactory.js';
const assistantFactory = new AssistantFactory();

export default class Util {
    copy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    deepCopy(obj) {
        console.log(obj);
        if (Array.isArray(obj)) {
            return obj.map(deepCopy);
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.fromEntries(
                Object.entries(obj).map(([key, val]) => [key, deepCopy(val)])
            );
        } else {
            return obj;
        }
    }
    isObject(obj) {
        return typeof obj === "object";
    }
    isString(obj) {
        return typeof obj === "string";
    }
    undefined(obj) {
        return typeof obj === "undefined";
    }
    defined(obj) {
        return !(typeof obj === "undefined");
    }
    isNumeric(str) {
        return /^\d+$/.test(str);
    }
    objToStr(obj) {
        let strs = [];
        Object.keys(obj).forEach((k) => {
            strs.push(k + ":" + obj[k]);
        });
        return strs.join("\r\n");
    }
    /**
     * 
     * @param {*} obj 
     * @param {*} keys 
     * @param {*} vals 
     * @param {*} replaceStr 
     * @param {*} flag 
     */
    isExist(obj, keys, vals, replaceStr = "", flag = true) {
        if (this.undefined(obj)) {
            return false;
        }
        const str = "";
        if (flag) {
            str = JSON.stringify(obj);
        }
        for (var i = 0; i < vals.length; i++) {
            if (flag) {
                if (str.includes(vals[i])) {
                    return true;
                }
            } else {
                let strEle = vals[i];
                if (replaceStr != "") {
                    strEle = strEle.replace(replaceStr, "");
                }
                return keys.every(key => {
                    return util.defined(obj[key]) && obj[key].includes(strEle);
                });
            }
        }
        return false;
    }

    /**
     * 1.{ condition: 'name= XXX ', query: {} }
     * Value直接存在键值
     * @param {*} objs  [arg]
     * @param {*} key name
     * @param {*} replaceStr name=
     * @returns 
     */
    getArgByKeyInValue(obj, key, replaceStr = "") {
        let rtn = null;

        const values = Object.values(obj);
        for (const val of values) {//All values
            //key in value
            if (this.isString(val) && val.toLowerCase().includes(key)) {
                return val.toLowerCase().replace(replaceStr, "");
            }
        }

        return rtn;
    }

    /**
     * value中含有已知的值
     * 2.{ query: 'all', condition: 'inactive' }
     * @param {*} objs 
     * @param {*} key 
     * @param {*} replaceStr 
     * @returns 
     */
    getArgByValueInValue(obj, keyMap, replaceStr = "") {
        let rtn = null;
        if (keyMap == null) {
            return null;
        }
        const keys = Object.keys(keyMap);
        const values = Object.values(obj);
        for (let val of values) {//All values
            if (this.isString(val)) {
                val = val.toLowerCase(); //Active => active condition: 'status:未稼働'
                val = val.replace(replaceStr, "");
                if (keyMap.hasOwnProperty(val)) {//value中含有已知的值
                    rtn = keyMap[val];
                    break;
                }
            }
        }

        return rtn;
    }

    /**
     * 
     * 3. { query: 'employees', condition: {status:'inactive'} }
     * @param {*} objs 
     * @param {*} keyMap 
     * @param {*} replaceStr 
     * @returns 
     */
    getArgByKeyInKey(obj, key, replaceStr = "") {
        let rtn = null;

        const keys = Object.keys(obj);
        for (const objKey of keys) {
            if (objKey == key) {
                rtn = obj[key].replace(replaceStr, "");
                break;
            }
        }

        return rtn;
    }
    /**
     * 
     * @param {*} objs 配置Map
     * @param {*} rtn AI返回值
     * @param {*} obj  exe Object
     * @returns 
     */
    // func: 'selectInfo',
    // args: { type: '案件', flag: '1', info: 'FSR-0048' },
    //{company:["selectInfo","sendMail"]}
    exe = async function (objs, rtn, obj) {
        const keys = Object.keys(objs);
        let doRtn = null;
        for (const objKey of keys) {
            let at = assistantFactory.get(objKey);
            if (objs[objKey].indexOf(rtn.func) >= 0) {//数组中存在
                if (at != null) {
                    //関数実行
                    doRtn = await (at.func)[rtn.func](JSON.parse(rtn.args), obj);
                    break;
                }
            }
        }
        return doRtn;
    };
    /**
     * { query: { employee_status: 'active' }, condition: 'list', name: null }
     * @param {*} objs 
     * @param {*} key 
     * @param {*} keyMap 
     * @param {*} replaceStr 
     * @returns 
     */
    getArg(obj, keys, keyMap, replaceStr = "") {
        var rtn = null;
        //Map 最优先
        rtn = this.getArgByValueInValue(obj, keyMap, replaceStr);
        if (rtn != null) {
            return rtn;
        }
        for (const key of keys) {
            if (rtn == null) {
                rtn = this.getArgByKeyInValue(obj, key, replaceStr);
            }
            if (rtn == null) {
                rtn = this.getArgByKeyInKey(obj, key, replaceStr);
            }
            if (rtn != null) {
                break;
            }
        }
        return rtn;
    }

    getNullStr(str, nullStr) {
        if (str && str != null) {
            return str;
        } else {
            return nullStr;
        }
    };

    repalceStr(objs, replaceStr) {
        let str = "";
        for (const obj of objs) {

        }
        objs.forEach(obj => {
            if (obj && this.isString(obj)) {
                str = obj;
                if (replaceStr != null) {
                    str = str.repalce(replaceStr, "");
                }
                return;
            }
        });
        return str;
    }

}

export { Util };



