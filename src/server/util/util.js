
import crypto from 'crypto';

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
    firstLine(str) {
        const firstLineEndIndex = str.indexOf('\n');
        const firstLine = firstLineEndIndex !== -1 ? str.substring(0, firstLineEndIndex) : str;
        return firstLine;
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

    objToObj(obj, map) {
        let rtn = {};
        Object.keys(map).forEach((k) => {
            rtn[map[k]] = obj[k];
        });
        return rtn;
    }
    /**
     * 
     * @param {*} objs 
     * @param {*} map  from:to
     * @returns 
     */
    objsToArray(objs, map, cb) {
        if (objs == null) {
            return [];
        }
        let rtn = [];
        for (const obj of objs) {
            let ele = {};
            Object.keys(map).forEach((k) => {
                ele[map[k]] = obj[k];
                //个别对应
                if (cb) {
                    cb(obj, ele);
                }
            });
            rtn.push(ele);
        }
        return rtn;
    }

    encrypt(text) {
        const key = Buffer.from("37725295ea78b626");
        const iv = Buffer.from("rflf77768bfsrai1");
        const algorithm = 'aes-128-cbc'; // 加密算法
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(text) {
        const key = Buffer.from("37725295ea78b626");
        const iv = Buffer.from("rflf77768bfsrai1");
        let src = "";
        const cipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        src += cipher.update(text, "hex", "utf8");
        src += cipher.final("utf8");
        return src;
    }

    inDays(time, days) {
        const nowTime = (new Date()).getTime();
        const threeDaysInMillis = days * 24 * 60 * 60 * 1000;
        return (nowTime - time) < threeDaysInMillis;
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


    recordsToStr(records, key, value) {
        var ele = {};
        records.forEach((element, index) => {
            if (key == "#INDEX#") {
                ele[index + 1] = element[value];;
            } else {
                ele[element[key]] = element[value];
            }

        });
        return this.objToStr(ele);
    }


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



