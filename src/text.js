const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

// 替换为您的 Text Analytics 终结点和密钥
const endpoint = "https://fsr.cognitiveservices.azure.com/";
const key = "e77ab5dfd37547d78ad33e96c17628c9";

// 创建 Text Analytics 客户端
const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));

// 使用 Text Analytics 客户端调用 API
async function analyzeText() {
    const document = [
        "わかりません"
    ];

    const results = await client.analyzeSentiment(document);
    for (const result of results) {
        console.dir(result.confidenceScores);
        console.log(`Sentiment: ${result.sentiment}`);
    }
}

analyzeText().catch((err) => {
    console.error("An error occurred:", err);
});
