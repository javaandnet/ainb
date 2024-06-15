import SF from './sf.js';
import { Mail } from './mail.js';
const mail = new Mail();
class Helper {

    getInfo = async function (args) {
        if (args.query.includes("name") || args.query.includes("名前")) {
            return "FSR株式会社"
        } else if (args.query.includes("社長") || args.query.toLowerCase().includes("ceo") || args.query.toLowerCase().includes("president")) {
            return "孫光"
        } else if (args.query.includes("未稼働") || args.query.includes("inactive") || (args.condition && (args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")))) {

            var sf = new SF();

            return await sf.noWorkName();
        }
        return "";
    }

    getEmp = async function (args) {
        var name = "";
        if (typeof (args.query) == "string") {
            name = args.query;
        } else {
            name = args.query.name;
        }
        var sf = new SF();
        if (name && name != "") {
            var info = await sf.workByName(name);
            return info;
        } else {
            return {};
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
        console.log(args);
        if (args.isConfirm === "確認") {
            var str = "";
            str += "";
            str += "mailTo:" + address[args.mailto] + "\r\n";
            str += "Subject:" + "技術者提案" + "\r\n";
            str += "内容:\r\n" + args.info + "\r\n";
            str += "Attachment:\r\n" + "" + "\r\n";
            str += "上記情報を使用して送信してよろしいでしょうか？";
            return str;
        } else {
            if(to && (to == "") ){
                return "誰に送信しますか？";
            }
            var to = args.mailto;
            if(!(to.includes("@") && to.includes("."))){
                to = address[to];
            }
            console.log(to);
            await mail.sendMail({
                to: to,
                subject: "技術者提案",
                content: args.info
            });
        }
        return "OK";
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