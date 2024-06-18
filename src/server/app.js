import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { Server, Socket } from 'socket.io';

import cors from 'cors'
import { Azure } from './util/azure.js';
import { AI } from './util/ai.js';
const azure = new Azure();
//Path 設定
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new AI();

const app = express();
app.use(cors());
var options = {
    key: fs.readFileSync(path.join(__dirname, 'crt/local.key')),
    cert: fs.readFileSync(path.join(__dirname, 'crt/local.crt'))
};
app.use('/', express.static(path.join(__dirname, 'public/dist')))
const port = 3000;
// let server = https.createServer(options, app);
let server = http.createServer(options, app);

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
await ai.getAssistant("company");
ai.updateAssistant();
var thread = await ai.createThread();
//初期化
io.on('connection', (socket) => {
    //AI 新しいThread
    ai.createThread()
        .then(thread => {
            socket.emit("newThread", thread.id);
        });
    socket.on('message', (message) => {
        // console.log('Message received: ', message);
        ai.chat(message.msg.content, message.threadId,false).then(function (rtn) {
            // console.log(rtn.rtn);
            socket.emit("message", { content: rtn.rtn.str });
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
        // console.log(wavRate);
        bufferAll[threadId] = [];
        //  ack({ info: "ok" });
    });

    /**
     * Add Str
     */
    socket.on('recording', (data) => {
        // console.log(data.threadId.thread);
        const threadId = data.threadId;
        let voiceData = data.data;
        const itr = voiceData.values();
        const buf = new Array(voiceData.length);
        for (var i = 0; i < voiceData.length; i++) {
            buf[i] = itr.next().value;
        }
        bufferAll[threadId] = bufferAll[threadId].concat(buf);
    });

    socket.on('stopRecord', (data, ack) => {
        // console.log(data.threadId);
        const threadId = data.threadId;
        // const stream = azure.createStream(bufferAll, 1).then(function(stream){
        //     console.log(stream);
        //   //  azure.saveStream(stream);
        // });
        //放入输入框中 无需转换
        var txt = ai.v2t(bufferAll[threadId]).then(function (txt) {
            console.log(txt);
            socket.emit("v2t", txt);
            bufferAll[threadId] = [];//删除
        }).catch((result) => {
            console.log(result);
            ack({ a: "fail" });
        });
    });

    //Stop
    socket.on('stop', (data, ack) => {
        //const filename = path.join(__dirname, `/public/222.wav`);
        azure.v2t(bufferAll, 1).then(function (text) {
            //text: 问题
            //ans:回答
            ai.chat(text).then(function (ans) {
                var voiceAns = "";
                if (ans.length > 25) {
                    var ansArr = ans.split("。");
                    if (ansArr.length > 0) {
                        voiceAns = ansArr[0] + "。";
                    } else {
                        voiceAns = ansArr[0];
                    }
                    console.log(voiceAns);
                } else {
                    voiceAns = ans;
                }
                ack({ q: text, a: ans });
                // azure.t2v(voiceAns).then(
                //     //Base64
                //     function (stream) {
                //         ack({ data: stream, q: text, a: ans });
                //     }
                // );
            });
        }).catch((result) => {
            console.log(result);
            ack({ a: "fail" });
        });
    });
});


