import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { Server, Socket } from 'socket.io';

import cors from 'cors'
// import Azure   from './util/azure.cjs';
import { AI } from './util/ai.js';
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
app.use('/', express.static(path.join(__dirname, 'public')))
const port = 3000;
// let server = https.createServer(options, app);
let server = http.createServer(options, app);

// cros
const io = new Server(server, {
    cors: {
        origin: "http://192.168.1.160:8080",
        methods: ["GET", "POST"]
    }
});
server.listen(port, function () {
    console.log(`AI App listening on port ${port}`);
});
var asstId = "asst_0vl90HXVvBv8T5qsBwXYbsYG";
await ai.getAssistant(asstId);
ai.updateAssistant();
var thread = await ai.createThread();
//初期化
io.on('connection', (socket) => {
    //AI 新しいThread
    ai.createThread()
        .then(thread => {
            socket.emit("newThread", { thread: thread.id });
        });
    socket.on('message', (message) => {
        console.log('Message received: ', message);
        ai.chat(message.msg.content, message.thread.thread).then(function (ans) {
            console.log(ans);
            socket.emit("message", { content: ans });
        });
    });
    // //VOICE
    // let wavRate = 48000;
    // let bufferAll = [];
    // /**
    //  * 初期化
    //  */
    // socket.on('start', (data, ack) => {
    //     wavRate = data.wavRate;
    //     console.log(wavRate);
    //     bufferAll = [];
    //     //  ack({ info: "ok" });
    // });

    // /**
    //  * Add Str
    //  */
    // socket.on('recording', (data) => {
    //     const itr = data.values();
    //     const buf = new Array(data.length);
    //     for (var i = 0; i < buf.length; i++) {
    //         buf[i] = itr.next().value;
    //     }
    //     bufferAll = bufferAll.concat(buf);
    // });

    // socket.on('saveRec', (data, ack) => {
    //     azure.exportWAV(bufferAll);
    // });

    // //Stop
    // socket.on('stop', (data, ack) => {
    //     //const filename = path.join(__dirname, `/public/222.wav`);
    //     azure.v2t(bufferAll, 1).then(function (text) {
    //         //text: 问题
    //         //ans:回答
    //         ai.ask(text).then(function (ans) {
    //             var voiceAns = "";
    //             if (ans.length > 25) {
    //                 var ansArr = ans.split("。");
    //                 if (ansArr.length > 0) {
    //                     voiceAns = ansArr[0] + "。";
    //                 } else {
    //                     voiceAns = ansArr[0];
    //                 }
    //                 console.log(voiceAns);
    //             } else {
    //                 voiceAns = ans;
    //             }
    //             ack({ q: text, a: ans });
    //             // azure.t2v(voiceAns).then(
    //             //     //Base64
    //             //     function (stream) {
    //             //         ack({ data: stream, q: text, a: ans });
    //             //     }
    //             // );
    //         });
    //     }).catch((result) => {
    //         console.log(result);
    //         ack({ a: "fail" });
    //     });
    // });
});


