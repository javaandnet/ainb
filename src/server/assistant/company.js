import SF from '../util/sf.js';
import Util from '../util/util.js';
import { Mail } from '../util/mail.js';
const mail = new Mail();
const sf = new SF();
const util = new Util();
class Company {
    id = "asst_KQsWjF05lR95Z92JwpOMCZBE";
    config = {
        name: "会社の営業",
        instructions: "あなたはFSR株式会社の営業です。会社、技術者、案件情報、面接の情報をお客さんに紹介する。メール送信前再確認必要です。",
        model: "gpt-3.5-turbo",
        tools: [
            {
                type: "function",
                function: {
                    name: "getInfo",// 绑定到函数
                    description: "会社情報を取得する",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の範囲" },
                            condition: { description: "質問の条件", type: "string" }
                        },
                        required: ["query", "condition"],//必须
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
                            query: { description: "質問の範囲" },
                            condition: { description: "質問の条件", type: "string" }
                        },
                        required: ["query", "condition"],//必须
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
                            info: { description: "追加内容", type: "string" }
                        },
                        required: ["type", "info"],//必须
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
        addInfo: async function (args, obj) {
            obj.option = args;
            console.log("addInfo:", obj.KEYWORDSTR);
            return args;
        }
    };
    func = {
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
            }
            return "情報がありません";
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
                var rtn = sf.update(args.type, args.condition, args.updateObj);
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
                const project_str = util.objToStr({ "案件号": data.no, "案件名": data.name, "内容": data.detail });
                return {
                    ai: JSON.stringify({ id: data.id, no: data.no }), //只有名字
                    out: project_str
                };
            }
            else {
                return { ai: "情報なし", out: "案件情報がありません" };
            }

        },

        selectInfo: async function (args) {
            return JSON.stringify(args);
        },

        getEmp: async function (args) {

            if (args.status == "inactive") {
                return await sf.workerNoWork();
            } else {
                var info = await sf.workByName(args.name);
                if (info == null) {
                    return { ai: "情報なし", out: "技術者情報がありません" };
                }
                return {
                    ai: JSON.stringify({ id: info.id, emp: info.name }), //只有名字
                    out: info.information
                };
            }
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
            var address = {
                "任峰磊": "javaandnet@gmail.com"
            };
            var emp = {};
            if (args.emp) {
                emp = await sf.workByName(args.emp);
            } else {
                return { ai: "送信内容を不明です", out: "どうの内容を不明です" };
            }
            if (emp == null) {
                return { ai: "該当技術者の情報がありません", out: "該当技術者の情報がありません" };
            }
            var to = args.mailto;

            //送信先を設定する
            if (to && (to == "")) {
                return { ai: "送信先を設定が必要", out: "誰に送信しますか？" };
            } else {
                if (!(to.includes("@") && to.includes("."))) {
                    to = address[to];
                }
            }

            if (args.isConfirm === "確認") {
                var str = "";
                str += "mailTo:" + to + "\r\n";
                str += "Subject:" + "技術者提案「" + emp.name + "」\r\n";
                str += "内容:\r\n" + emp.information + "\r\n";
                str += "Attachment:\r\n" + emp.link + "\r\n";
                str += "上記情報を使用して送信してよろしいでしょうか？";
                return {
                    ai: JSON.stringify({ mailto: args.mailto, emp: emp.name }), //只有名字
                    out: str
                };
            } else {
                //SendMail
                var res = await mail.sendMail({
                    to: to,
                    subject: "FSR技術者提案「" + emp.name + "」",
                    content: emp.information
                });
                if (res.accepted.length > 0) {
                    return {
                        ai: JSON.stringify({ mailto: to, emp: emp.name }), //只有名字
                        out: "[" + res.accepted.join(",") + "]に送信いたしました。"
                    };
                } else {
                    return {
                        ai: JSON.stringify({ mailto: to, emp: emp.name }), //只有名字
                        out: "送信失敗しました。"
                    };
                }
            }
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
                , "name": "name"
                , "名前": "name"
                , "未稼働": "inactive"
                , "inactive": "inactive"
                , "未稼働": "inactive"
                , "稼働していない": "inactive"
            });
            name = util.getNullStr(name, "");
            args.name = name;
            return args;
        },

        getProject: async function (args) {
            var status = util.getArg(args, ["status"], {
                "未完了": "0",
                "一覧": "-1",
                "all": "-1",
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

            var status = util.getArg(args, ["status", "employment_status"], {
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
            return args;
        }
    }
}
export { Company };