const OpenAI = require("openai");
const Config = require("./config.js");
const config = new Config();
const openai = new OpenAI(config.openai);

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
        console.log("ai:"+str);
        return str;
    };
 


};