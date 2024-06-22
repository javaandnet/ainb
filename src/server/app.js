import express from 'express';
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
console.log(path.join(__dirname, '../server/public'));
app.use('/', express.static(path.join(__dirname, '../server/public/dist')))
const port = 3000;

let server = http.createServer(options, app);
const ASSISITANT_NAME = "company";
// cros
const io = new Server(server, {
    cors: {
        origin: ["http://192.168.1.160:8080", "http://localhost:3000", "http://localhost:8080", "https://localhost:8080", "http://192.168.1.160:3000"],
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
    console.log('Received data:', data);
    var rtn = await assistant.func.getModelById({
        model: data.model,
        id: data.id
    });
    console.log(rtn);
    // 返回响应
    res.json(rtn);
});


ai.updateAssistant();
var keyWordMap = { "#Add#": "案件:{0}を追加する" };
var outFuncMap = {};
outFuncMap[ASSISITANT_NAME] = ["selectInfo", "addInfo"];
//初期化
io.on('connection', (socket) => {
    //AI 新しいThread
    ai.createThread()
        .then(thread => {
            socket.emit("newThread", thread.id);
        });
    socket.on('message', (message) => {
        ai.chat(message.msg.content, keyWordMap, message.threadId, false).then(function (rtn) {
            var json = { content: rtn.rtn.str };
            ai.exe(outFuncMap, rtn.rtn, json).then(function (data) {
                socket.emit("message", json);
            });
        });
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


