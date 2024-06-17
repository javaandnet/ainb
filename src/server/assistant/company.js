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
                            query: { description: "質問の対象", type: "string" },
                            condition: { description: "検索の范围", type: "string" },
                        },
                        required: ["query", "condition"],//必须
                    },
                },
            }, {
                type: "function",
                function: {
                    name: "selectInfo",// 绑定到函数
                    description: "内容を選択して、そのまま出力する",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            info: { description: "選択の内容", type: "string" }
                        },
                        required: ["info"],//必须
                    },
                },
            }, {
                type: "function",
                function: {
                    name: "doProjectWithWorker",// 绑定到函数
                    description: "技術者をとある案件関連して、提案します",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の対象", type: "string" },
                            condition: { description: "検索の范围", type: "string" },
                        },
                        required: ["project", "worker"],//必须
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
    func = {
        doProjectWithWorker: async function (args) {
            return "情報がありません";
        },
        getInfo: async function (args) {
            if (args.query.includes("社長") || args.query.toLowerCase().includes("ceo") || args.query.toLowerCase().includes("president")) {
                return "孫光です。"
            } else if (args.query.includes("company") || args.query.includes("name") || args.query.includes("名前")) {
                return "会社の名前はFSR株式会社です。"
            } else if (args.query.includes("未稼働") || args.query.includes("inactive") || (args.condition && (args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")))) {
                return await sf.workerNoWork();
            }
            return "情報がありません";
        },

        getProject: async function (args) {
            if (util.defined(args.status)) {
                var data = await sf.projectByCondition(args.status);
                if (data.totalSize == 0) {
                    return { ai: "情報なし", out: "案件情報がありません" };
                } else {
                    var str = "";
                    var ais = [];
                    var projects = [];
                    data.records.forEach((element, index) => {
                        str += (element.AutoNo__c) + ":" + element.Name + "\r\n";
                        // projects.push({
                        // no:index,
                        // name:element.name }); 
                        ais.push({
                            no: element.AutoNo__c
                        });
                    });
                    return {
                        ai: JSON.stringify(ais), //只有名字
                        out: str
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
            return args.info;
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
        },
        getNumber: async function (args) {
            if (args.query.includes("未稼働") || args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")) {
                var sf = new SF();
                return await sf.workerNoWork();
            }
            else if ((args.query.includes("employees") || args.query.includes("社員"))) {
                return "100";
            }
            return "0";
        }
    };
    changeArgs = {
        getProject: async function (args) {
            var status = 9;
            var con = "";
            if (util.isString(args.query)) {
                con = args.query;
            } else {
                con = args.query.name;
            }
            if (con && con != "") {
                if (con.includes("未完了")) {
                    status = 0;
                    args.status = status;
                } else {
                    if (util.isNumeric(con.replace("FSR-", ""))) {
                        args.no = con;
                    } else {
                        status = 9;
                    }
                }
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

            var status = util.getArg(args, ["status","employment_status"], {
                "未稼働": "inactive",
                "inactive": "inactive",
                "unassigned": "inactive",
                "稼働していない": "inactive",
                "working": "active",
                "active": "active"
                , "稼働中": "active"
            },"status:"
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