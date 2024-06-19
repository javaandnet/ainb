import SF from './sf.js';
import { Mail } from './mail.js';
const mail = new Mail();
const sf = new SF();
class Helper {
    constructor() {

    }
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
            var info = await sf.empByName(name);
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
            emp = await sf.empByName(args.emp);
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
export { Helper };