const express = require('express')
const fs = require('fs');
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
var https = require('https');


const Azure = require('./util/azure.js');
const AI = require('./util/ai.js');



//const ffmpeg = require('fluent-ffmpeg');
const azure = new Azure();
const ai = new AI();


const app = express();
var options = {
    key: fs.readFileSync(path.join(__dirname, 'crt/local.key')),
    cert: fs.readFileSync(path.join(__dirname, 'crt/local.crt'))
};
app.use('/', express.static(path.join(__dirname, 'public')))

server = https.createServer(options, app).listen(443, function () {
    console.log('Example app listening on port 3000')
})
// server = http.createServer(options,app).listen(3000, function () {
//     console.log('Example app listening on port 3000')
// })
const io = socketio(server);


io.on('connection', (socket) => {
    let sampleRate = 48000;
    let bufferAll = [];

    /**
     * 初期化
     */
    socket.on('start', (data) => {
        sampleRate = data.sampleRate;
        bufferAll = [];
        //console.log(`Sample Rate: ${sampleRate}`);
    });

    /**
     * Add Str
     */
    socket.on('send_pcm', (data) => {
        const itr = data.values()
        const buf = new Array(data.length)
        for (var i = 0; i < buf.length; i++) {
            buf[i] = itr.next().value
        }
        bufferAll = bufferAll.concat(buf)
    });

    //Stop
    socket.on('stop', (data, ack) => {
        //const filename = path.join(__dirname, `/public/222.wav`);
        azure.v2t(bufferAll, 1).then(function (text) {
            ai.ask(text).then(function (ans) {
                azure.t2v(ans).then(
                    //Base64
                    function (stream) {
                        ack({ data: stream });
                    }
                );
            });
        }).catch((result) => {
            console.log(result);
            ack({ info: "fail" });
        });
    });
});



const getToNgram = (text, n) => {
    let ret = {};
    for (var m = 0; m < n; m++) {
        for (var i = 0; i < text.length - m; i++) {
            const c = text.substring(i, i + m + 1);
            ret[c] = ret[c] ? ret[c] + 1 : 1;
        }
    }
    return ret;
};