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
const port = 443;
server = https.createServer(options, app).listen(port, function () {
    console.log(`AI App listening on port ${port}`);
})
// server = http.createServer(options,app).listen(3000, function () {
//     console.log('Example app listening on port 3000')
// })
const io = socketio(server);

//初期化
io.on('connection', (socket) => {
    let wavRate = 48000;
    let bufferAll = [];

    /**
     * 初期化
     */
    socket.on('start', (data,ack) => {
        wavRate = data.wavRate;
        console.log(wavRate);
        bufferAll = [];
        ack({ info: "ok" });
    });

    /**
     * Add Str
     */
    socket.on('send_pcm', (data) => {
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
                var voiceAns ="";
                if(ans.length > 25){
                    var ansArr = ans.split("。");
                    if(ansArr.length > 0){
                        voiceAns = ansArr[0]+"。";
                    }else{
                        voiceAns = ansArr[0];
                    }
                    console.log(voiceAns);
                }else{
                    voiceAns =ans;
                }
                azure.t2v(voiceAns).then(
                    //Base64
                    function (stream) {
                        ack({ data: stream,q: text,a:ans});
                    }
                );
            });
        }).catch((result) => {
            ack({ a: "fail" });
        });
    });
});

