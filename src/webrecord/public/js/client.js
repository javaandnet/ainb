const socket = io.connect()
let processor = null
let localstream = null

// let recorder = new Recorder();
// recorder.start().then(() => {
//   // 开始录音
// }, (error) => {
//   // 出错了
//   console.log(`${error.name} : ${error.message}`);
// });
// Recorder.getPermission().then(() => {
//   console.log('给权限了');
// }, (error) => {
//    alert(error);
// });
/**
 * 开始记录
 */
function startRecording() {
    console.log('start recording')
    context = new window.AudioContext()
    socket.emit('start', { 'sampleRate': context.sampleRate });
    // document.getElementById("btn").innerHTML ="離され終了";
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
        localstream = stream;
        const input = this.context.createMediaStreamSource(stream);
        processor = context.createScriptProcessor(4096, 1, 1)

        input.connect(processor);
        processor.connect(context.destination);
        //Send data
        processor.onaudioprocess = (e) => {
            const voice = e.inputBuffer.getChannelData(0);
            socket.emit('send_pcm', voice.buffer);
        }
    }).catch((e) => {
        // "DOMException: Rrequested device not found" will be caught if no mic is available
        console.log(e)
    })
}

function stopRecording() {
  // recorder.stop(); 
   console.log('stop recording')
    processor.disconnect()
    processor.onaudioprocess = null
    processor = null
    localstream.getTracks().forEach((track) => {
        track.stop()
    })
    socket.emit('stop', '', (res) => {
        document.getElementById("msg").innerHTML = `${res.data}`; 
        var newData = "data:audio/mp3;base64,"+ res.data;
        const audio = new Audio();
      audio.src = newData;

    function play() {
      audio.play();
    }
    play();       
    });

    // document.getElementById("btn").innerHTML ="押下開始";
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



  // 获取按钮元素
  const btn_play = document.getElementById('btn_play');
  // 处理按钮松手事件
  btn_play.addEventListener('click', () => {
    play();
});


