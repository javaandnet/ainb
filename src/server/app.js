import express from 'express';
import multer from 'multer';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { Server, Socket } from 'socket.io';
import Util from './util/util.js';
const util = new Util();
import cors from 'cors'
import bodyParser from 'body-parser'
import { AI } from './util/ai.js';
const ai = new AI();
import { AssistantFactory } from './util/assistantFactory.js';
const assistantFactory = new AssistantFactory();



//Path 設定
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
app.use(cors());
// 使用 body-parser 中间件来解析 JSON 请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var options = {
    key: fs.readFileSync(path.join(__dirname, 'crt/local.key')),
    cert: fs.readFileSync(path.join(__dirname, 'crt/local.crt'))
};
// console.log(path.join(__dirname, '../server/public'));
app.use('/', express.static(path.join(__dirname, './public/dist')))
const port = 8379;

let server = http.createServer(options, app);

const ASSISITANT_NAME = "company";
// cros
const io = new Server(server, {
    cors: {
        origin: ["http://192.168.1.160:8080", "http://localhost:3000", "http://localhost:8379", "http://localhost:8080", "https://localhost:8080", "http://192.168.1.160:3000"],
        methods: ["GET", "POST"]
    }
});

server.listen(port, function () {
    console.log(`AI App listening on port ${port}`);
});

let assistant = assistantFactory.get(ASSISITANT_NAME);
/**
 * 定义一个 POST 路由来接收前台的 AJAX 请求
 */
app.post('/model', async (req, res) => {
    const data = req.body;

    var rtn = await assistant.func.getModelById({
        model: data.model,
        id: data.id
    });
    rtn.model = data.model;
    // 返回响应
    res.json(rtn);
});

app.post('/confirmInfo', async (req, res) => {
    let data = req.body;
    data.root = __dirname;
    //链接地址
    var rtn = await assistant.out.confirmInfo(data);
    // 返回响应
    res.json(rtn);
});

let FILES = { resume: [] };

const refreshFile = function (folder = "") {
    const directoryPath = path.join(__dirname, 'files', folder);
    const files = fs.readdirSync(directoryPath);
    let rtn = [];
    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            rtn.push({ text: file, value: util.encrypt(file + "#0#1") });
        }
    });
    return rtn;
};
FILES.resume = refreshFile("resume");

/**
 * Files处理 Start
 */
// 设置存储配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'files', req.query.folder));
    },
    filename: function (req, file, cb) {
        // console.log(file);
        //cb(null,file);
        cb(null, decodeURI(file.originalname));
    }
});

const multerErrorHandler = (err, req, res, next) => {
    if (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    } else {
        next();
    }
};
const upload = multer({ storage: storage });
// 上传文件接口
app.post('/upload', [upload.any("files"), multerErrorHandler], (req, res) => {
    const folder = req.query.folder;
    const fileInfos = req.files.map(file => ({
        originalname: file.originalname,
        size: file.size
    }));
    FILES.resume = refreshFile(folder);
    res.json({
        msg: 'ok',
        list: FILES.resume,
        files: fileInfos
    });

});


function checkExistFile(filePath) {
    var isExist = false;
    try {
        fs.statSync(filePath);
        isExist = true;
    } catch (err) {
        isExist = false;
    }
    return isExist;
}

function deleteFile(filePath) {
    var result = false;
    if (!checkExistFile(filePath)) {
        return true;
    }
    try {
        fs.unlinkSync(filePath);
        return true;
    } catch (err) {
        console.error('无法删除文件: ' + err);
        return false;
    }
}

// 上传文件接口
app.post('/files', (req, res) => {
    const folder = req.body.folder;

    if (req.body.option == "list") {
        if (req.body.flag === true) {
            FILES.resume = refreshFile(folder);
        }
        let rtn = [];
        try {
            rtn = FILES.resume;
        } catch (err) {
            console.error('dont scan: ' + err);
        }
        res.json(rtn);
    } else if (req.body.option == "delete") {
        let filePath = req.body.id;
        filePath = path.join(__dirname, 'files', folder, filePath);
        let rtn = "ok";
        let delLtn = deleteFile(filePath);
        if (delLtn) {
            console.log('File Del', filePath);
        } else {
            rtn = "ng";
        }
        FILES.resume = refreshFile(folder);
        res.send(rtn);
    }
});

/** 

*/
app.get('/files/:folder/:name', (req, res) => {
    let filePath = req.params.name;
    let folder = req.params.folder;


    let fileArray = util.decrypt(filePath);
    fileArray = fileArray.split("#");
    if (fileArray.length != 3) {
        res.json({ "info": "Error" });
    }
    try {
        if (!(fileArray[1] == "0" || (util.inDays(parseInt(fileArray[2]), 3)))) {
            res.send("Expired Link リンク期限切れ");
        }

    } catch (e) {
        res.json({ "info": "Error" });
    }
    filePath = fileArray[0];

    const type = filePath.split('.').pop();
    let header = "";
    filePath = path.join(__dirname, 'files', folder, filePath);
    if (type == "xlsx") {
        header = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (type == "xls") {
        header = 'application/vnd.ms-excel';
    } else if (type == "pdf") {
        header = 'application/vnd.ms-excel';
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading the file.');
        } else {
            res.setHeader('Content-Type', header);
            // const deFileName = encodeURI(filePath);
            // console.log(fileArray[0]);
            // res.setHeader('Content-Disposition', "attachment; filename=" +fileArray[0] + "");
            res.setHeader('Content-Disposition', 'attachment; ');
            res.send(data);
        }
    });
});


/**
 * Files处理 END
 */

/**
 * 录音处理Start
 */

app.post('/stop', async (req, res) => {
    const data = req.body;
    console.log('Received data:', data);
    let rtn = await assistant.func.changeSalesStatus(data);
    console.log(rtn);
    // 返回响应
    res.json(rtn);
});

app.post('/cmd', async (req, res) => {
    const data = req.body;
    var cmdList = {
        "#0#": {
            msg: "help",
            desc: "Help",
        },
        "#1#": {
            msg: "listInfo",
            args: { type: "worker" },
            desc: "営業中技術者一覧,点击单元格查看详细信息",
        }, "#2#": {
            msg: "listInfo",
            args: { type: "project" },
            desc: "未完了案件一覧,点击单元格查看详细信息",
        }, "#3#": {
            msg: "addInfo",
            args: { type: "project" },
            desc: "案件を追加する。#3#後ろ内容で、第一行は案件名です。",
        }, "#4#": {
            msg: "listInfo",
            args: { type: "interview" },
            desc: "面接一覧",
        }, "#5#": {
            msg: "upload",
            desc: "ファイルをUploadする、FSR_XXXX_外部名.xlsx",
        },
        "#9#": {
            msg: "sendInfo",
            desc: "情報発送",
        },
    };
    // 返回响应
    res.json(cmdList);
});

await ai.updateAssistant(ASSISITANT_NAME);
await ai.getAssistant(ASSISITANT_NAME);
var keyWordMap = { "#Add#": "案件:{0}を追加する" };
var outFuncMap = {};
outFuncMap[ASSISITANT_NAME] = ["selectInfo", "addInfo", "listInfo"];
//初期化
io.on('connection', (socket) => {
    //AI 新しいThread
    ai.createThread()
        .then(thread => {
            socket.emit("newThread", thread.id);
        });
    socket.on('message', (message) => {
        if (message.option == "server") {
            let msg = { func: message.text, args: message.args };
            console.log("server", message);
            const rtn = ai.exe(outFuncMap, { func: message.text, args: message.args }, {}).then(function (data) {
                if (data == null) {
                    msg.type = "FUNC";
                }
                msg.text = data;
                socket.emit("message", msg);
            });
        } else {
            // console.log(message);
            ai.chat(message.text, keyWordMap, message.threadId, false).then(function (rtn) {
                var json = { text: rtn.rtn.str, type: rtn.rtn.type, func: rtn.rtn.func, args: rtn.rtn.args };
                ai.exe(outFuncMap, rtn.rtn, json).then(function (data) {
                    socket.emit("message", json);
                });
            });
        }
    });


    //VOICE
    let wavRate = 48000;
    let bufferAll = {};

    /**
     * 初期化
     */
    socket.on('startRecord', (data, ack) => {
        const threadId = data.threadId;
        console.log("startRecord");
        bufferAll[threadId] = [];
        //  ack({ info: "ok" });
    });

    /**
     * 读取中
     */
    socket.on('recording', (data) => {
        console.log("recording");
        const threadId = data.threadId;
        let voiceData = data.data;
        console.log(threadId);
        const itr = voiceData.values();
        const buf = new Array(voiceData.length);
        for (var i = 0; i < voiceData.length; i++) {
            buf[i] = itr.next().value;
        }
        bufferAll[threadId] = bufferAll[threadId].concat(buf);
    });

    socket.on('stopRecord', (data, ack) => {
        console.log("stopRecord");
        const threadId = data.threadId;
        //放入输入框中 无需转换
        var txt = ai.v2t(bufferAll[threadId]).then(function (txt) {
            console.log(txt);
            socket.emit("v2t", txt);
            bufferAll[threadId] = [];//Clear
        }).catch((result) => {
            console.log(result);
            ack({ a: "fail" });
        });
    });

    //Stop
    socket.on('stop', (data, ack) => {

    });
});


