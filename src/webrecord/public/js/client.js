const socket = io.connect()
let processor = null
let localstream = null
let recorder = null;

function statusHtml(txt) {
    document.getElementById('status').innerHTML = txt;
}

/**
 * 権限をチェックする
 */
Recorder.getPermission().then(() => {
    // console.log('権限あり');
    statusHtml("権限あり");
}, (error) => {
    statusHtml(error);
});

var state = {
    sampleBit: 16,
    sampleRate: 48000,
    numChannel: 1,
    compiling: false,
    isRecording: false,     // 是否正在录音
    duration: 0,
    fileSize: 0,
    vol: 0,
}
collectData = () => {
    return {
        sampleBits: state.sampleBit,
        sampleRate: state.sampleRate,
        numChannels: state.numChannel,
        compiling: state.compiling,       // 是否开启边录音边转化（后期改用web worker）
    };
}
/**
 * 开始记录
 */
function startRecording() {
    context = new window.AudioContext();
    const config = collectData();
    if (!recorder) {
        recorder = new Recorder(config);
        recorder.onprogress = (params) => {
            voice = params.data;
            socket.emit('send_pcm', params.data.buffer);
        };
    }
    socket.emit('start', { 'wavRate': context.sampleRate },function(info){
        statusHtml(info.info);
        recorder.start().then(() => {
        }, (error) => {
            console.log(`${error.name} : ${error.message}`);
        });
    });

    
}

function stopRecording() {
    recorder.stop();
    console.log('stop recording')
    // socket.emit('stop', '', (res) => {
    //     document.getElementById("msg").innerHTML = `${res.a}`;
    //     play(res.data);
    // });
    //For Test
    socket.emit('saveRec', '', (res) => {
        statusHtml("save");
    });

}


function play(base64Str) {

    var newData = "data:audio/mp3;base64," + base64Str;
    const audio = new Audio();
    audio.src = newData;

    function play64() {
        audio.play();
    }
    play64();
}
// 获取按钮元素
const btn_start = document.getElementById('btn_start');
const btn_end = document.getElementById('btn_end');
// 处理按钮按下事件
btn_start.addEventListener('click', () => {
    startRecording();
});

// 处理按钮松手事件
btn_end.addEventListener('click', () => {
    stopRecording();
});




