
import { Config } from "./config.js";
import SF from './sf.js';
import OpenAI from "openai";
const openai = new OpenAI(Config.openai);

// default config
class AI {
    constructor() {
        this.MODE = "";
        this.QUERY = "";
        this.TYPE = "";
        this.messages = [];
        this.tools = [
            {
                type: "function",
                function: {
                    name: "get_info",// 绑定到函数
                    description: "文字列情報を取得場合",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の範囲" },
                            condition: { description: "質問の条件", type: "string" }
                        },
                        required: ["query"],//必须
                    },
                },
            }, {
                type: "function",
                function: {
                    name: "get_number",// 绑定到函数
                    description: "数値の情報知りたい場合",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の対象", type: "string" },
                            condition: { description: "検索の范围", type: "string" },
                        },
                        required: ["query", "condition"],//必须
                    },
                },
            }, {
                type: "function",
                function: {
                    name: "do_action",// 绑定到函数
                    description: "何が操作が行う",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の対象", type: "string" },
                            condition: { description: "検索の范围", type: "string" },
                        },
                        required: ["query", "condition"],//必须
                    },
                },
            }
        ];
    }
    ask = async function main(q) {
        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: q }]
        });

        return stream.choices[0].message.content;
    };
    func = async function main(messages, tools) {
        var options = {
            model: "gpt-3.5-turbo",
            messages: messages
        };
        if (tools) {
            options.tools = tools;
            options.tool_choice = "auto";
        }
        return await openai.chat.completions.create(options);
    };
    company = async function (msg) {
        //配置，可以改成动态的，或者保存文件 进行热更新 json.parse?

        this.messages = [];
        this.messages.push({
            role: "user",
            content: msg
        });
        //第一步查询，分流，每次执行一遍
        var res = await this.func(this.messages,  this.tools);
        //console.log("#####1");
        //里面应有choices，各种信息
        const responseMessage = res.choices[0].message;
        if (responseMessage.tool_calls) {
            var toolCall = responseMessage.tool_calls[0];
            var name = toolCall.function.name;
            console.log(name);
            var args = JSON.parse(toolCall.function.arguments);
            console.log(args);
            //上次信息加入
            this.messages.push(responseMessage);
            var tool = await this.createTool(toolCall, name, args);//答案
            //这个模式下，清空上下文，并且推送第一次的Message
            this.messages.push(tool);
            //第二次请求，推送东西
            let secondResponse = await this.func(this.messages);
            console.log(secondResponse.choices[0].message.content);
            return secondResponse.choices[0].message.content;
        } else {
            return await this.ask(msg);//普通
        }
    }
    createTool = async function (toolCall, func, args) {
        var content = "";
        if (func == "get_info") {
            content = await this.getInfo(args);
        } else if (func == "get_number") {
            content = await this.getNumber(args);
        } else {
            content = "¸¸¸" + args.query;
        }

        return {
            tool_call_id: toolCall.id,
            role: "tool",
            name: func,
            content: content
        };
    }

    getInfo = async function (args) {
        if ((args.query.includes("name") || args.query.includes("名前"))) {
            return "FSR株式会社"
        } else if (args.query.includes("社長") || args.query.toLowerCase().includes("ceo") || args.query.toLowerCase().includes("president")) {
            return "孫光"
        } else if (args.query.includes("未稼働") || (args.condition && (args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")))) {

            var sf = new SF();

            return await sf.noWorkName();
        }
        return "";
    }
    getNumber = async function (args) {
        if (args.query.includes("未稼働") || args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")) {

            var sf = new SF();

            return await sf.noWorkName();
        }
        else if ((args.query.includes("employees") || args.query.includes("社員"))) {
            return "100";
        }
        return "0";
    }
    assistants = async function (msg) {
        const assistant = await openai.beta.assistants.create({
            name: "会社の営業",
            description: "FSR株式会社の情報を連携する",
            model: "gpt-3.5-turbo",
            tools:  this.tools
        });

        const thread = openai.beta.threads.create();
        var message = client.beta.threads.messages.create(
            thread_id = thread.id,
            role = "user",
            content = msg
        );

        let run = client.beta.threads.runs.create(
            thread_id = thread.id,
            assistant_id = assistant.id,
            instructions = "Use the function tool for this query."
        );
        client.beta.threads.runs.retrieve(
            thread_id = thread.id,
            run_id = run.id
        );
        messages = client.beta.threads.messages.list(
            thread_id = thread.id
        );
    };
};
export { AI };
