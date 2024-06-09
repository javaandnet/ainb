const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");
const path = require("path");

const subscriptionKey = "6f78e68a9ef543988c4866e30d46bbae";
const serviceRegion = "japaneast";
 

// 要识别的音频文件路径
const audioFilePath = path.join(__dirname, "/222.wav");
 
// 检查文件是否存在
if (!fs.existsSync(audioFilePath)) {
    console.error(`Audio file does not exist: ${audioFilePath}`);
    process.exit(1);
}

// 检查文件是否为空
const audioFileStat = fs.statSync(audioFilePath);
if (audioFileStat.size === 0) {
    console.error(`Audio file is empty: ${audioFilePath}`);
    process.exit(1);
}

// 创建语音配置
const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
// 设置语音合成的语言
speechConfig.speechSynthesisLanguage = "ja-JP";
speechConfig.speechRecognitionLanguage = "ja-JP";  // 设置为日语

// 创建音频配置
//const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audioFilePath));
// create the push stream we need for the speech sdk.
var pushStream = sdk.AudioInputStream.createPushStream();
    
// open the file and push it to the push stream.
fs.createReadStream(audioFilePath).on('data', function(arrayBuffer) {
  pushStream.write(arrayBuffer.slice());
}).on('end', function() {
  pushStream.close();
});



// 创建音频配置
const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000"); // 10000ms
// 创建语音识别器
const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

recognizer.recognizeOnceAsync(result => {
    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        console.log(`Recognized: ${result.text}`);
    } else {
        console.log(result);
        console.error(`Error recognizing speech: ${result.errorDetails}`);
    }
    recognizer.close();
});
