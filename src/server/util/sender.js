import { createTransport } from "nodemailer";
import axios from 'axios';
const transport = createTransport({
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: "nin@fsr.co.jp", //账号
        pass: "fCKbifzB7kdoJUMx" //客户端密码（与登录密码不同，要到邮箱设置页面生成）
    }
});
class Sender {
    mailToMulti = async function (config, attachments = [], sender) {



    }
    mail = async function (config, senders, attachments = []) {
        let rtn = [];
        for (const sender of senders) {
            let mailInfo = sender.name + "様";
            mailInfo += "<br>";
            mailInfo += "お世話になっております<br>";
            mailInfo += config.fromName + "です。<br><br>";
            mailInfo += config.content + "<br><br>";
            mailInfo += "以上　何卒、よろしくお願いします。";
            var mailOptions = {
                from: config.from || "任峰磊<nin@fsr.co.jp>", // 发件人
                to: sender.email, //收件人，多个收件人用,号隔开
                cc: config.cc, //抄送
                bcc: config.bcc, //秘送
                subject: config.subject, //标题
                //text: config.content, //纯文本
                html: mailInfo,
                attachments: attachments
            }
            const res = await transport.sendMail(mailOptions);
            if (res.accepted.length > 0) {
                rtn.push(res.accepted);
            }
        }
        return rtn;
    }
    // //送信区分：１（グループ）０（個人）
    // String type = weComId == null ? '1' : '0';
    // 送信名（グループ：SALESFORCE）
    wecom = async function (message, type = 1, name = "SALESFORCE") {
        const endpointurl = 'http://160.16.216.251:11117/msg?type=' + type + '&to=' + name + '&msg=' + message;
        return await axios.get(endpointurl);
    }
}
export { Sender };
