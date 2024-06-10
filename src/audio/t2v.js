const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");

// 替换为您的 Azure 语音服务的密钥和区域
const subscriptionKey = "6f78e68a9ef543988c4866e30d46bbae";
const serviceRegion = "japaneast";
const audioFilePath = "output.wav";
// 要转换为语音的文本
const text = "1.自己紹介 氏名、年齢、在日期間、留学経歴がある場合RP、取得資格、IT経験、SAP経験、得意モジュール、リードなど経験がある場合RP、対応できる作業内容、履歴書に直近の2、3個プロジェクトを紹介してください";
// 创建语音配置和语音合成器
const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
// 设置语音合成的语言
speechConfig.speechSynthesisLanguage = "ja-JP";
const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);

const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

synthesizer.speakTextAsync(
    text,
    result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("Synthesis completed.");
        } else {
            console.error("Speech synthesis canceled, " + result.errorDetails);
        }
        synthesizer.close();
    },
    error => {
        console.error(error);
        synthesizer.close();
    }
);


 // 检查文件是否存在
if (!fs.existsSync(audioFilePath)) {
    console.error(`Audio file does not exist: ${audioFilePath}`);
    process.exit(1);
}else{
    console.log(111);
}
 //audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audioFilePath));

// 创建语音识别器
// const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

// recognizer.recognizeOnceAsync(result => {
//     if (result.reason === sdk.ResultReason.RecognizedSpeech) {
//         console.log(`Recognized: ${result.text}`);
//     } else {
//         console.error(`Error recognizing speech: ${result.errorDetails}`);
//     }
//     recognizer.close();
// });


console.log("Now synthesizing to: output.wav");
