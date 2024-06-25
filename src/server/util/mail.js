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
class Mail {
    sendMail = async function (config) {
        var mailOptions = {
            from: config.from || "任峰磊<nin@fsr.co.jp>", // 发件人
            to: config.to, //收件人，多个收件人用,号隔开
            cc: config.cc, //抄送
            bcc: config.bcc, //秘送
            subject: config.subject, //标题
            //text: config.content, //纯文本
            html: config.content,
            attachments: config.attach
        }
        var rtn = await transport.sendMail(mailOptions);
        return rtn;

    }
    // //送信区分：１（グループ）０（個人）
    // String type = weComId == null ? '1' : '0';
    // 送信名（グループ：SALESFORCE）
    sendWecom = async function (message, type = 1, name = "SALESFORCE") {
        const endpointurl = 'http://160.16.216.251:11117/msg?type=' + type + '&to=' + name + '&msg=' + message;
        return await axios.get(endpointurl);
    }
}
export { Mail };
