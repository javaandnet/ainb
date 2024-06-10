
const WavEncoder = require('wav-encoder')
const fs = require('fs');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { Readable } = require('stream');
const PassThrough = require('stream').PassThrough;
const Config = require("./config.js");
const config = new Config();
const path = require('path');
const subscriptionKey = config.azure.subscriptionKey;
const serviceRegion = config.azure.serviceRegion;
// 创建语音配置
const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
// 设置语音合成的语言
speechConfig.speechSynthesisLanguage = "ja-JP";
speechConfig.speechRecognitionLanguage = "ja-JP";  // 设置为日语

// 创建一个从 ArrayBuffer 读取数据的 Readable Stream
class ArrayBufferReadable extends Readable {
    constructor(buffer) {
        super();
        this.buffer = Buffer.from(buffer);
        this.sent = false;
    }

    _read() {
        if (!this.sent) {
            this.push(this.buffer);
            this.sent = true;
        } else {
            this.push(null);
        }
    }
}


class PushAudioOutputStreamCallback extends sdk.PushAudioOutputStreamCallback{
    constructor(array) {
      super();
      this.array = array;
    }
  
    write(data){
        // ここでストリーム化したデータを処理
          console.log(`Received ${data.byteLength} bytes of audio data.`);
  
          // encode to base64
          let buffer = Buffer.from(data);
          let base64 = buffer.toString('base64');
          this.array.add(base64);
    }
    close(){
        console.log('Stream closed.');
    }
  }

// Convert byte array to Float32Array
const toF32Array = (buf) => {
    const buffer = new ArrayBuffer(buf.length)
    const view = new Uint8Array(buffer)
    for (var i = 0; i < buf.length; i++) {
        view[i] = buf[i]
    }
    return new Float32Array(buffer)
}



// default config
module.exports = class {
    log = (txt) => {
        console.log(txt);
    };
    exportWAV = (buffer) => {
        return new Promise(resolve => {
            let sampleRate = 48000;//此处需要修改 是否一致
            const f32array = toF32Array(buffer);
            const audioData = {
                sampleRate: sampleRate,
                channelData: [f32array]
            }
            const filename =path.join(__dirname, `../public/wav/${String(Date.now())}.wav`)
   
            WavEncoder.encode(audioData).then((buffer) => {
                fs.writeFile(filename, Buffer.from(buffer), (e) => {
                    if (e) {
                        console.log(e)
                    } else {
                        console.log(`Successfully saved ${filename}`)
                    }
                });
                resolve(buffer);
            });
        });
    }




    createStream = (obj, type) => {
        return new Promise(resolve => {
            var pushStream;
            if (type == 0) {
                // create the push stream we need for the speech sdk.
                pushStream = sdk.AudioInputStream.createPushStream();
                // open the file and push it to the push stream.
                fs.createReadStream(obj).on('data', function (arrayBuffer) {
                    pushStream.write(arrayBuffer.slice());
                }).on('end', function () {
                    pushStream.close();
                    resolve(pushStream);
                });
            } else if (type == 1) {
                let sampleRate = 48000;
                const f32array = toF32Array(obj);
                const audioData = {
                    sampleRate: sampleRate,
                    channelData: [f32array]
                };
                WavEncoder.encode(audioData).then((buffer) => {
                    // 创建 ArrayBuffer 的可读流
                    const audioStream = new ArrayBufferReadable(buffer);

                    // 创建一个 pushStream
                    const pushStream = sdk.AudioInputStream.createPushStream();

                    // 从 Readable Stream 中读取数据并将其推送到 pushStream
                    audioStream.on('data', (chunk) => {
                        pushStream.write(chunk);
                    });
                    audioStream.on('end', () => {
                        pushStream.close();
                        resolve(pushStream);
                    });

                });
            } else {//Stream
                resolve(obj);
            }
        });
    };
    /**
     * 
     * @param {*} obj 
     * @param {*} type  0:FilePath 1:Buffer 2:Stream
     */
    v2t = (obj, type) => {
        var me = this;
        const bufferStream = new PassThrough();
        const stream = sdk.PushAudioOutputStream.create({
            write: (a) => bufferStream.write(Buffer.from(a)),
            close: () => bufferStream.end(),
        });
        return new Promise((resolve, reject) => {
            me.createStream(obj, type).then(function (stream) {
                // speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000"); // 10000ms
                // 创建音频配置
                let audioConfig = sdk.AudioConfig.fromStreamInput(stream);
                // 创建语音识别器
                const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

                recognizer.recognizeOnceAsync(result => {
                    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                        console.log("v2t:"+result.text);
                        resolve(result.text);
                    } else {
                        reject(result);
                    }
                    recognizer.close();
                });
            });
        });
    };
     t2v = (text, type) => {
        const bufferStream = new PassThrough();
        const stream = sdk.PushAudioOutputStream.create({
            write: (a) => bufferStream.write(Buffer.from(a)),
            close: () => bufferStream.end(),
        });

        speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
        const audioConfig = sdk.AudioConfig.fromStreamOutput(stream);
       // let callback = new PushAudioOutputStreamCallback(this.array);
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        return new Promise((resolve, reject) => {
            //此处返回，当写数据时 返回给前台
            var str = "";
            bufferStream.on('data', chunk => {
                str+=chunk.toString('base64');
            });
            //resolve on end
            bufferStream.on("end",function(){
                resolve(str);
            });
           
            synthesizer.speakTextAsync(
                text,
                result => {
                    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                        console.log("Synthesis completed.");
                    } else {
                        console.error("Speech synthesis canceled, " + result.errorDetails);
                    }
                    synthesizer.close();
                    //resolve(bufferStream);

                },
                error => {
                    console.error(error);
                    synthesizer.close();
                    reject(result);
                }
            );
        });
    };
    saveFile = (buffer) => {
        const filename = path.join(__dirname, `/${String(Date.now())}.wav`);
        fs.writeFile(filename, Buffer.from(buffer), (e) => {
            if (e) {
                console.log(e)
            } else {
                console.log(`Successfully saved ${filename}`);
            }
        });
    };
};