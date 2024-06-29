import SF from '../util/sf.js';
import Util from '../util/util.js';
import { Sender } from '../util/sender.js';
import Worker from '../model/worker.js';
import path from 'path';
import fs from 'fs';

const senderToOut = new Sender();
const sf = new SF();
const util = new Util();
const workerModel = new Worker();
class Company {
    setServer(server) {
        this.server = server;
        workerModel.server = server;
    };
    me = this;
    DEBUG = false;
    id = "asst_KQsWjF05lR95Z92JwpOMCZBE";
    config = {
        name: "会社の営業",
        instructions: "あなたはFSR株式会社の営業です。会社、技術者、案件情報、面接の情報をお客さんに紹介する。メール送信前再確認必要です。",
        model: "gpt-3.5-turbo",//gpt-4o//gpt-3.5-turbo
        tools: [{
            type: "function",
            function: {
                name: "changePrice",// 绑定到函数
                description: "修改提案单价",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        name: { description: "技術者の名前", type: "string" },
                        price: { description: "修改单价的内容", type: "string" }
                    },
                    required: ["name", "price"],//必须
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getInfo",// 绑定到函数
                description: "会社情報を取得する、会社の名前、社長、社員数、技術者社員数",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        query: { description: "質問の内容", type: "string" }
                    },
                    required: ["query"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "getEmp",// 绑定到函数
                description: "社員の情報を取得する、説明文、履歴書など、一覧の場合は番号を付けて出力してください",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        no: { description: "社員の番号", type: "string" },
                        query: { description: "質問の範囲", type: "string" },
                        name: { description: "社員の名前、一般的なに漢字の場合", type: "string" }
                    },
                    required: ["query", "no", "name"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "getProject",// 绑定到函数
                description: "案件関連の情報,未完了案件、具体情報",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        no: { description: "案件の番号", type: "string" },
                        condition: { description: "検索の条件", type: "string" },
                    },
                    required: ["condition"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "selectInfo",// 绑定到函数
                description: "案件または技術者を選択します。あるいは既存の選択したものから外す",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        type: { description: "選択のタイプ、案件か技術者か", type: "string" },
                        flag: { description: "選択または外すフラグ、選択の場合は１とする、その以外は０とする", type: "string" },
                        info: { description: "選択と外すの内容", type: "string" }
                    },
                    required: ["type", "info", "flag"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "addInfo",// 绑定到函数
                description: "案件または技術者を追加する",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        type: { description: "選択のタイプ、案件か技術者か", type: "string" },
                        name: { description: "案件名または技術者の名前", type: "string" }
                    },
                    required: ["type", "name"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "changeStatus",// 绑定到函数
                description: "案件または技術者の状態を変更する。あるいは既存の選択したものから外す",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        type: { description: "選択のタイプ、案件か技術者か", type: "string" },
                        flag: { description: "開始または停止フラグ、開始の場合は１とする、その以外は０とする", type: "string" },
                        info: { description: "操作の内容、名前、番号など", type: "string" }
                    },
                    required: ["type", "info", "flag"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "sendMail",// 绑定到函数
                description: "お客さんにメールを送信する、その前に送信情報を再確認必要です。実際送信または確認フラグを「実際」と「確認」に分けてください。",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        mailto: { description: "送信先", type: "string" },
                        isConfirm: { description: "実際送信または確認フラグ", type: "string" },
                        emp: { description: "送信の内容と関連する技術者、誰の何場合は誰を設定する", type: "string" },
                        info: { description: "発送内容の特定する、例えば、誰の何の場合は何を設定する", type: "string" }
                    },
                    required: ["mailto", "isConfirm"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "confirmMail",// 绑定到函数
                description: "お客さんにメールを送信前確認して、必要な場合は送信する。",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        mailto: { description: "送信先", type: "string" },
                        isConfirm: { description: "実際送信または確認フラグ", type: "string" },
                        info: { description: "発送内容", type: "string" }
                    },
                    required: ["query", "condition", "isConfirm"],//必须
                },
            },
        }
        ]
    };
    out = {
        getIcon: function (type) {
            //企業
            if (type == 0) {
                return "wap-home";
                //案件
            } else if (type == 1) {
                return "description-o";
                //Mail
            } else if (type == 2) {
                return "envelop-o";
                //企業Wechat
            } else if (type == 3) {
                return "wechat";
                //個人
            } else if (type == 4) {
                return "friends-o";
                //その他
            } else {
                return "";
            }
        },
        /**
         * 添加技术者到返回Json
         * @param {*} args 
         * @param {*} obj 
         * @returns 
         */
        selectInfo: async function (args, obj) {
            obj.option = args;
            return args;
        },

        /**
         * TODO Model改成继承，此处也可以写成通用，Maill Send
         * @param {*} args 
         * @param {*} obj 
         * @returns 
         */
        confirmInfo: async function (args, obj) {
            const senders = args.sender;
            const workers = args.worker;
            // console.log(path.join("../files/resume/"));
            let toMails = [];
            let toWecoms = [];
            let toCompanys = [];
            let toContacts = [];
            let mailStr = "";
            let mailRtn = [];
            let ids = [];
            let workerPrice = {};
            let wecomName = {};
            for (const worker of workers) {
                //worker.info 修改单价 
                ids.push(worker.value);
                if (worker.info && worker.info.replaceAll(" ", "") != "") {
                    workerPrice[worker.value] = worker.info;
                }
            }
            var datas = await workerModel.getDataByIds(ids);
            for (const data of datas) {
                //如果存在才替换
                if (workerPrice[data.Id]) {
                    data.Information__c = workerModel.replaceFieldValue(data.Information__c, "単 価", workerPrice[data.Id]);
                }

            }

            for (const sender of senders) {
                if (sender.model == "account") {
                    toCompanys.push(sender.value);
                } else if (sender.model == "mail") {
                    /**個人メールの場合、自由追加 */
                    toMails.push({ "name": sender.text, "email": sender.value });
                } else if (sender.model == "user") {
                    toWecoms.push(sender.value);
                    wecomName[sender.value] = sender.text;
                } else if (sender.model == "contact") {
                    toContacts.push(sender.value);
                }
            }
            /**企業 メール追加*/
            if (toCompanys.length > 0) {
                let contacts = await sf.queryByIds("SELECT Id,  Name,Account.Name, LastName, Email FROM Contact where AccountId in", toCompanys);
                //企業一覧にメール
                for (const contact of contacts.records) {
                    toMails.push({ "name": contact.Account.Name + "<br>" + contact.LastName, "email": contact.Email });
                }
            }
            /**連絡先追加*/
            if (toContacts.length > 0) {
                let contacts = await sf.queryByIds("SELECT Id,  Name, LastName, Email FROM Contact where id in", toContacts);
                //企業一覧にメール
                for (const contact of contacts.records) {
                    toMails.push({ "name": contact.LastName, "email": contact.Email });
                }
            }

            if (toMails.length > 0) {
                //メール送信文字列
                //1 外部 无需替换、Info 内部处理 
                const workerMailObj = await workerModel.info(datas, 1, true, true);
                mailStr = "下記の技術者を提案いたしました。ご確認をお願いします。<br>" + workerMailObj.rtn;
                let filesStrs = workerMailObj.files;
                let files = [];
                //File attatch
                for (const filesStr of filesStrs) {
                    const filePath = path.join(args.root, "files", "resume", filesStr);
                    if (fs.existsSync(filePath)) {
                        files.push({
                            filename: filesStr,
                            path: filePath // stream this file
                        })
                    }
                }

                /** SendMail Start **/
                mailRtn = await senderToOut.mail({
                    fromName: args.fromName || "FSRのAI営業",
                    subject: args.subject || "FSR技術者提案",
                    content: mailStr,
                }, toMails, files);
            }

            /** WebCom Start **/
            async function sendWecom(sender, datas) {
                let rtn = [];
                let flag = true;
                for (const data of datas) {
                    /** 每一个用户,长度有限制，只能1条1条发 */
                    let wecomStr = await workerModel.infoHtml([data], 1);//外部
                    //Id、内容 0 个人
                    const rtnWecom = await senderToOut.wecom(wecomStr, 0, sender);
                    //成功返回
                    if (rtnWecom.data != "success") {
                        flag = false;

                    }
                }
                if (flag) {
                    rtn.push(sender);
                }
                return flag;
            }

            /** WebCom Start **/
            const wecomRtn = [];
            if (toWecoms.length > 0) {
                // let toWecomIds = await sf.queryByIds("SELECT Id,  Name, LastName, Email FROM Contact where id in", toWecoms);
                //企業一覧にメール
                for (const wecom of toWecoms) {
                    const rtnFlg = await sendWecom(wecom, datas);
                    if (rtnFlg) {
                        wecomRtn.push(wecomName[wecom]);
                    }

                }
            }
            let rtnMailStr = "";
            if (mailRtn.length > 0) {
                rtnMailStr = "[" + mailRtn.join(",") + "]にメールを送信いたしました。"
            }
            let rtnWecomStr = "";
            if (wecomRtn.length > 0) {
                rtnWecomStr = "[" + wecomRtn.join(",") + "]にWeComを送信いたしました。"
            }

            const mailResult = {
                ai: JSON.stringify({ mailto: mailRtn.join(",") }), //只有名字
                out: rtnMailStr + "\r\n" + rtnWecomStr
            };

            return mailResult;
        },
        changePrice: async function (args, obj) {
            obj.option = args;
            return args;
        },
        listInfo: async function (args, obj) {

            let model = args.type;
            let condition = {};
            let field = " Name,Id";
            if (args.type == "project") {
                model = "Project__c";
                condition = { Status__c: '0' };
                field = "Status__c,Id, Name";
            } else if (args.type == "worker") {
                model = "Worker__c";
                condition = { SalesStatus__c: '可能' };
                field = "Status__c,Id, Name";
            } else if (args.type == "user") {
                model = "Worker__c";
                condition = { "isSales__c": true };
                field = "Name,WeCom__c";
            }
            var datas = await sf.find(model, condition, field, 50);
            var rtn = [];
            var cb = function () {
            }
            if (args.type == "worker") {
                //data:before ele:after
                cb = function (before, after) {
                    after.text = workerModel.transValue("Status__c", before) + " :" + after.text;
                };
            }
            let map = { "Id": "value", "Name": "text" };
            if (args.type == "user") {
                map = { "WeCom__c": "value", "Name": "text" };
            }
            rtn = util.objsToArray(datas, map, cb);
            return { model: args.type, list: rtn };

            return {};
        },
        addInfo: async function (args, obj) {
            var insertObj = { Name: util.firstLine(args.info), Detail__c: args.info, status__c: 0 };
            var rtn = await sf.insert("Project__c", insertObj);
            return args;
        }
    };

    func = {

        changePrice: async function (args) {
            return "OK";
        },
        doProjectWithWorker: async function (args) {
            return "情報がありません";
        },
        addInfo: async function (args) {
            return "OK";
        },
        getInfo: async function (args) {
            if (args.name == "ceo") {
                return "孫光です。"
            } else if (args.name == "name") {
                return "会社の名前はFSR株式会社です。"
            } else if (args.name == "inactive") {
                return await sf.workerNoWork();
            } else if (args.name == "emp") {
                return "105人です";
            }
            return "情報がありません";
        },
        //営業停止
        changeSalesStatus: async function (args) {
            let objName = "";
            let status = args.status;
            let objs = [];
            let rtn = [];
            for (const id of args.ids) {
                let item = {};
                item["Id"] = id.value;
                if (args.model == "worker") {
                    objName = "WORKER__c";
                    if (status == 0) {
                        item["SalesStatus__c"] = "不可";
                    } else {
                        item["SalesStatus__c"] = "可能";
                    }
                } else if (args.model == "project") {
                    objName = "PROJECT__C";
                    if (status == 0) {
                        item["Status__c"] = "9";
                    } else {
                        item["Status__c"] = "0";
                    }
                }
                // objs.push(item);
                const rets = await sf.update(objName, [item]);

                for (const ret of rets) {
                    if (ret.success) {
                        rtn.push(ret.id);
                    }
                }
            }


            return rtn;
        },
        changeStatus: async function (args) {
            let doFlg = false;
            if (args.type == "WORKER__c") {
                args.condition = { "Name": args.info };
                if (args.flag == 0) {
                    args.updateObj = { "SalesStatus__c": "不可" };
                } else {
                    args.updateObj = { "SalesStatus__c": "可能" };
                }
                doFlg = true;
            } else if (args.type == "PROJECT__C") {
                args.condition = { "AutoNo__c": args.info };
                if (args.flag == 0) {
                    args.updateObj = { "Status__c": "9" };
                } else {
                    args.updateObj = { "Status__c": "0" };
                }
                doFlg = true;
            }
            if (doFlg) {
                var rtn = sf.updateByCondition(args.type, args.condition, args.updateObj);
                if (rtn.id == "-1") {
                    return "NG";
                } else {
                    return "OK";
                }
            }
            else {
                return { ai: "情報なし", out: "変更種類がありません" };
            }
        },
        getProject: async function (args) {
            if (util.defined(args.status)) {
                var status = {};
                if (args.status == "0") {
                    var parent = this.parent;
                    var data = await parent.out.listInfo({ type: "project" });
                    if (data == null || data.size == 0) {
                        return { ai: "情報なし", out: "案件情報がありません" };
                    } else {
                        return {
                            func: "listInfo",
                            args: { type: "project" },
                            ai: "NO", //只有名字
                            out: data
                        };
                    }
                }

                if (args.status != "-1") {
                    status.Status__c = args.status;
                }
                var data = await sf.find("Project__c", status, "Id, Name, Status__c, AutoNo__c", 50);
                if (data == null || data.totalSize == 0) {
                    return { ai: "情報なし", out: "案件情報がありません" };
                } else {
                    var project = {};
                    var ai = {};
                    data.forEach((element, index) => {
                        project[element.AutoNo__c] = element.Name;
                        ai[index + 1] = element.AutoNo__c;
                    });
                    return {
                        ai: util.objToStr(ai), //只有名字
                        out: util.objToStr(project)
                    };
                }
            } else if (util.defined(args.no)) {
                var data = await sf.projectByNo(args.no);
                if (data != null) {
                    const project_str = util.objToStr({ "案件号": data.no, "案件名": data.name, "内容": data.detail });
                    return {
                        ai: JSON.stringify({ id: data.id, no: data.no }), //只有名字
                        out: project_str
                    };
                }
            } else if (util.defined(args.id)) {
                var data = await sf.find("Project__c", { id: id }, "Id, Name, Status__c,AutoNo__c,Detail__c", 1);
                return data;
            }

            return { ai: "情報なし", out: "案件情報がありません" };


        },
        getModelById: async function (args) {
            let object = "";
            let field = "";
            let map = {};
            let data = null;
            if (args.model == "project") {
                object = "Project__c";
                field = "Status__c,Id, Name, AutoNo__c,Detail__c";
                data = await sf.find(object, { id: args.id }, field, 1);
                // console.log(data);
                if (data.length > 0) {
                    return util.objToObj(data[0], map);
                }
            } else {
                object = "Worker__c";
                field = "Status__c,Id, Name,  AutoNo__c,Japanese__c,TecLevel__c, Information__c, NameToOuter__c,Resume__c";
                //内部
                // * @param {*} isHtml  true Tag
                // * @param {*} isSendMail  メール発送
                // workerModel.trans(datas, fields);

                return await workerModel.infoById(args.id, field, 0, true);
            }
            return {};
        },
        selectInfo: async function (args) {
            return JSON.stringify(args);
        },

        getEmp: async function (args) {
            var parent = this.parent;
            if (args.status == "inactive") {
                // return await sf.workerNoWork();
                // var sql = "SELECT Id,  Name,AutoNumber__c  FROM Worker__c  where SalesStatus__c = '可能'";
                var data = await parent.out.listInfo({ type: "worker" });;
                if (data == null || data.size == 0) {
                    return { ai: "情報なし", out: "技術者情報がありません" };
                } else {
                    var worker = {};
                    var ai = {};
                    data.forEach((element, index) => {
                        worker[element.AutoNo__c] = element.Name;
                    });
                    return {
                        func: "listInfo",
                        args: { type: "worker" },
                        ai: "NO", //只有名字
                        out: data
                    };
                }
            } else if (args.name) {
                var info = await sf.empByName(args.name);

                if (info == null) {
                    return { ai: "情報なし", out: "技術者情報がありません" };
                }
                return {
                    ai: JSON.stringify({ id: info.id, emp: info.name }), //只有名字
                    out: info.information
                };
            } else if (args.no) {
                var data = await sf.empByNo(args.no);
                return { ai: "情報なし", out: "技術者情報がありません" };
            }
            return { ai: "情報なし", out: "技術者情報がありません" };

        },
        confirmMail: async function (args) {
            var address = {
                "任峰磊": "javaandnet@gmail.com"
            };
            var str = "";
            str += "mailTo:" + address[args.mailto] + "\r\n";
            str += "送信Subject:" + "技術者提案" + "\r\n";
            str += "内容:\r\n" + args.info + "\r\n";
            str += "Attachment:\r\n" + "" + "\r\n";
            return str;
        },
        sendMail: async function (args) {
        }
    };



    changeArgs = {
        changeStatus: async function (args) {
            var type = util.getArg(args, [""], {
                "employee": "WORKER__c"
                , "技術者": "WORKER__c"
                , "案件": "PROJECT__C"
            });
            args.type = type;
            return args;
        },
        getInfo: async function (args) {
            var name = util.getArg(args, [""], {
                "社長": "ceo"
                , "ceo": "ceo"
                , "president": "ceo"
                , "company": "name"
                , "会社名": "name"
                , "社名": "name"
                , "name": "name"
                , "名前": "name"
                , "社員数": "emp"
            });
            name = util.getNullStr(name, "");
            args.name = name;
            return args;
        },

        getProject: async function (args) {
            var status = util.getArg(args, ["status"], {
                "未完了": "0",
                "未完了案件": "0",
                "一覧": "0",
                "all": "0",
                "全ての案件": "0",
                "incomplete": "0"
                , "complete": "9"
            }, "status:"
            );
            if (status != null) {
                args.status = status;
                return args;
            }
            var name = util.getArg(args, ["name"], null, "name=");
            if (name != null) {
                args.name = name;
            }
            return args;
        },
        sendMail: async function (args) {
            return args;
        },
        confirmMail: async function (args) {
            return args;
        },
        getEmp: async function (args) {
            var status = util.getArg(args, ["status", "employment_status", "name"], {
                "待机": "inactive",
                "未稼働": "inactive",
                "inactive": "inactive",
                "unassigned": "inactive",
                "稼働していない": "inactive",
                "working": "active",
                "active": "active"
                , "稼働中": "active"
            }, "status:"
            );
            if (status != null) {
                args.status = status;
                return args;
            }

            var name = util.getArg(args, ["name"], null, "name=");
            if (name != null) {
                args.name = name;
            }
            if ((name == null) && (args.query)) {
                args.no = args.query;
            }
            if (args.name.indexOf("FSR") >= 0) {
                args.no = args.name;
            }
            if (args.no.indexOf("FSR") >= 0) {
                delete args.name;
            }
            //FSR-TW654
            return args;
        }
    }
}
export { Company };