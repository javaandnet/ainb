const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");


const voiceKey = "6f78e68a9ef543988c4866e30d46bbae";
const voiceRegion = "japaneast";
const textKey = "e77ab5dfd37547d78ad33e96c17628c9";
const textRegion = "japaneast";


// 设置语音服务的密钥和区域
const speechConfig = sdk.SpeechConfig.fromSubscription(voiceKey, voiceRegion);

// 创建语音识别器
const recognizer = new sdk.SpeechRecognizer(speechConfig);

// 创建文本分析服务的客户端
const textAnalyticsClient = new TextAnalyticsClient("https://fsr.cognitiveservices.azure.com/", new AzureKeyCredential(textKey));

// 注册识别结果的回调函数
recognizer.recognized = (s, e) => {
    const text = e.result.text;

    // 调用文本分析服务进行情感分析
    textAnalyticsClient.analyzeSentiment([text]).then((result) => {
        const sentiment = result[0].sentiment;
        console.log("Recognized Text:", text);
        console.log("Sentiment:", sentiment);
    }).catch((err) => {
        console.error("An error occurred during sentiment analysis:", err);
    });
};

// 开始实时语音识别
recognizer.startContinuousRecognitionAsync();

// 按 Enter 键停止实时语音识别
console.log("Press Enter to stop...");
process.stdin.addListener("data", () => {
    recognizer.stopContinuousRecognitionAsync();
});
