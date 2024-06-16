import SF from '../util/sf.js';
import { Mail } from '../util/mail.js';
const mail = new Mail();
const sf = new SF();
class Company {
    id = "asst_KQsWjF05lR95Z92JwpOMCZBE";
    route = {
        "get_info": this.getInfo,
        "get_number": this.getNumber,
        "get_emp": this.getEmp,
        "send_mail": this.sendMail,
        "confirm_mail": this.confirmMail
    };
    config = {
        name: "会社の営業",
        instructions: "あなたはFSR株式会社の営業です。会社と技術者の情報をお客さんに紹介する。メール送信の操作を行う。関数を呼び出すときに、名前以外パラメータが英語に変換してください。メール送信前再確認必要です。",
        model: "gpt-3.5-turbo",
        tools: [
            {
                type: "function",
                function: {
                    name: "get_info",// 绑定到函数
                    description: "会社普通情報を取得場合",
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
                    name: "get_emp",// 绑定到函数
                    description: "社員の情報を取得する、説明文、履歴書など、情報はそのまま出力をお願いします",
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
                    name: "get_number",// 绑定到函数
                    description: "数値の情報知りたい場合",
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
                    name: "do_action",// 绑定到函数
                    description: "何が操作が行う、",
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
                    name: "send_mail",// 绑定到函数
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
                    name: "confirm_mail",// 绑定到函数
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

    getInfo = async function (args) {
        if (args.query.includes("社長") || args.query.toLowerCase().includes("ceo") || args.query.toLowerCase().includes("president")) {
            return "孫光です。"
        } else if (args.query.includes("company") || args.query.includes("name") || args.query.includes("名前")) {
            return "会社の名前はFSR株式会社です。"
        } else if (args.query.includes("未稼働") || args.query.includes("inactive") || (args.condition && (args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")))) {
            return await sf.noWorkName();
        }
        return "情報がありません";
    }

    getEmp = async function (args) {
        var name = "";
        if (typeof (args.query) == "string") {
            name = args.query;
        } else {
            name = args.query.name;
        }
        if (name && name != "") {
            var info = await sf.workByName(name);
            return {
                ai: JSON.stringify({ id: info.id, emp: info.name }), //只有名字
                out: info.information
            };
        } else {
            return { ai: "情報なし", out: "技術者情報がありません" };
        }

    }
    confirmMail = async function (args) {
        var address = {
            "任峰磊": "javaandnet@gmail.com"
        };
        var str = "";
        str += "mailTo:" + address[args.mailto] + "\r\n";
        str += "送信Subject:" + "技術者提案" + "\r\n";
        str += "内容:\r\n" + args.info + "\r\n";
        str += "Attachment:\r\n" + "" + "\r\n";
        return str;
    }
    sendMail = async function (args) {
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
    getNumber = async function (args) {
        if (args.query.includes("未稼働") || args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")) {
            var sf = new SF();
            return await sf.noWorkName();
        }
        else if ((args.query.includes("employees") || args.query.includes("社員"))) {
            return "100";
        }
        return "0";
    }
}
export { Company };