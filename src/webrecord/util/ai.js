const OpenAI = require("openai");
const openai = new OpenAI({
    organization: "org-7JnZDaFZRVxEBIwVWj84ptjj",//
    project: "proj_OslquGFuzI1ln4zehBXhdCpI",
    apiKey: "sk-proj-0qspq1SJopmlioDdiX2gT3BlbkFJLkAyaVkwtvRGv2ty6lau"
});

// default config
module.exports = class {
     ask = async function main(q) {
        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: q }],
            stream: true,
        });
        var str = "";
        for await (const chunk of stream) {
            str += chunk.choices[0]?.delta?.content || "";
            //process.stdout.write(chunk.choices[0]?.delta?.content || "");
        }
        console.log(str);
        return str;
    }
};