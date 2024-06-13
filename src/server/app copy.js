import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { Server, Socket }  from 'socket.io';
import SF from './util/sf.js';
import cors from 'cors'
// const sf = new SF();
// sf.noWorkName();


import Azure   from './util/azure.js';
const AI = require('./util/ai.js');


const azure = new Azure();
const ai = new AI();

const app = express();
app.use(cors());
var options = {
    key: fs.readFileSync(path.join(__dirname, 'crt/local.key')),
    cert: fs.readFileSync(path.join(__dirname, 'crt/local.crt'))
};
app.use('/', express.static(path.join(__dirname, 'public')))
const port = 3000;



server = http.createServer(options, app);
// server = http.createServer(options,app).listen(3000, function () {
//     console.log('Example app listening on port 3000')
// })


const socketOptions = {
    cors: {
        origin: function (origin, fn) {
            const isTarget = origin !== undefined && origin.match(/^https?:\/\/www\.test\.net/) !== null;
            return isTarget ? fn(null, origin) : fn('error invalid domain');
        },
        credentials: true
    }
};

// cros
const io = socketio(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }

});
server.listen(port, function () {
    console.log(`AI App listening on port ${port}`);
});
//初期化
io.on('connection', (socket) => {
    let wavRate = 48000;
    let bufferAll = [];
    /**
     * 初期化
     */
    socket.on('start', (data, ack) => {
        wavRate = data.wavRate;
        console.log(wavRate);
        bufferAll = [];
      //  ack({ info: "ok" });
    });

    socket.on('message', (message) => {
        console.log('Message received: ', message);
        ai.company(message.content).then(function (ans) {
            console.log(ans);
            socket.emit("message", { content: ans });

        });

    });

    socket.on('ai', (data) => {
        ai.ask(data).then(function (ans) {
            console.log(ans);
            socket.emit("answer", ans);

        });
        console.log("chatgpt");
    });
    /**
     * Add Str
     */
    socket.on('recording', (data) => {
        const itr = data.values();
        const buf = new Array(data.length);
        for (var i = 0; i < buf.length; i++) {
            buf[i] = itr.next().value;
        }
        bufferAll = bufferAll.concat(buf);
    });

    socket.on('saveRec', (data, ack) => {
        azure.exportWAV(bufferAll);
    });

    //Stop
    socket.on('stop', (data, ack) => {
        //const filename = path.join(__dirname, `/public/222.wav`);
        azure.v2t(bufferAll, 1).then(function (text) {
            //text: 问题
            //ans:回答
            ai.ask(text).then(function (ans) {
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
                ack({  q: text, a: ans });
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


