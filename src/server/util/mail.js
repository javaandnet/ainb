import { createTransport } from "nodemailer";

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
            text: config.content, //纯文本
            //html: " <b>你好啊！</b>",
            attachments:config.attach
        }
        var rtn = await transport.sendMail(mailOptions);
        return rtn;

    }
}
export { Mail };
//         {
//     filename: "检测报告",
//     path: attach //文件路径
// },
// {
//     filename: "fileName", //文件名
//     content: "texttexttext" //文件内容，自己写
// }
