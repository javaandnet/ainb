const socket = io.connect()
let processor = null
let localstream = null
/**
 * 开始记录
 */
function startRecording() {
    console.log('start recording')
    context = new window.AudioContext()
    socket.emit('start', { 'sampleRate': context.sampleRate });
    document.getElementById("btn").innerHTML ="離され終了";
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
        localstream = stream
        const input = this.context.createMediaStreamSource(stream)
        processor = context.createScriptProcessor(4096, 1, 1)

        input.connect(processor)
        processor.connect(context.destination)
        //Send data
        processor.onaudioprocess = (e) => {
            const voice = e.inputBuffer.getChannelData(0)
            socket.emit('send_pcm', voice.buffer)
        }
    }).catch((e) => {
        // "DOMException: Rrequested device not found" will be caught if no mic is available
        console.log(e)
    })
}

function stopRecording() {
    console.log('stop recording')
    processor.disconnect()
    processor.onaudioprocess = null
    processor = null
    localstream.getTracks().forEach((track) => {
        track.stop()
    })
    socket.emit('stop', '', (res) => {
        document.getElementById("msg").innerHTML = `${res.info}`;
        //console.log(`${res.filename}`)
    });
    document.getElementById("btn").innerHTML ="押下開始";
}
  // 获取按钮元素
  const button = document.getElementById('btn');

  // 处理按钮按下事件
  button.addEventListener('mousedown', () => {
      startRecording();
  });

  // 处理按钮松手事件
  button.addEventListener('mouseup', () => {
      stopRecording();
  });



  // 获取按钮元素
  const btn_play = document.getElementById('btn_play');
  // 处理按钮松手事件
  btn_play.addEventListener('click', () => {
    play();
});
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  
 
  // Expected output: a number from 0 to <1
  
  function play(){
    // 获取音频元素
    var rand = getRandomInt(100);
    socket.emit('play', {index:rand}, (res) => {
        const audio = document.getElementById('audio');
        // rand = 66;
        audio.src = rand+".wav";
        //console.log(`${res.filename}`)
        audio.play();
    });
    
  }
