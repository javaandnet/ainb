
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
    /**
     * 
     * @param {*} msg 
     * @param {*} lastFlag 返回最后一条信息
     * @returns  返回最后一条信息
     */
    chat = async function (msg, lastFlag = true) {
        //3. Messag:消息
        // ユーザーが入力したクエリを Message として OpenAI API に送信する，往哪一个线程传递，可以管理不同线程
        await openai.beta.threads.messages.create(this.thread.id, {
            role: "user",
            content: msg,
        });
        //4. execute
        let run = await openai.beta.threads.runs.create(
            this.thread.id,
            { assistant_id: this.assistant.id }
        );
        //5. 执行完毕
        const msgs = await this.waitRun(this.thread.id, run.id);
        console.log(lastFlag);
        if (lastFlag) {
            return msgs;
        }
        return msgs;
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

    deleteThread = async function (id) {
        openai.beta.threads.delete(id)
    };

    deleteAssistant = async function (id) {
        openai.beta.assistants.delete(id);
    };

    waitRun = async function (threadId, runId) {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        if (run.status === "queued" || run.status === "in_progress") {
            await new Promise((resolve) => setTimeout(resolve, 500))
            return this.waitRun(threadId, runId);
        } else if (run.status === "requires_action" && run.required_action) {//需要下一步
            // NOTE: 複数回の Tools の呼び出しには対応していない
            const call = run.required_action.submit_tool_outputs.tool_calls[0];
            // console.log(call.function);
            const args = JSON.parse(call.function.arguments);
            //执行
            // await functionCall[call.function.name](args);
            //Run Step可获得
            const doRtn = await this.createTool({ id: 1 }, call.function.name, args);
            //提交函数执行完的结果
            await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
                tool_outputs: [
                    {
                        tool_call_id: call.id,
                        output: doRtn.content
                    }
                ],
            });
            //递归调用
            await this.waitRun(threadId, runId);
        } else if (run.status === "completed") {
            let messages = await openai.beta.threads.messages.list(threadId);
            //注意为逆序操作
            console.log("return");
            return messages.data;
        }
        return run;
    };
    createAssistant = async () => {
        const assistant = await openai.beta.assistants.create({
            name: "会社の営業",
            instructions: "あなたはFSR株式会社の営業です。会社の情報をお客さんに紹介する。",
            model: "gpt-3.5-turbo",
            tools: this.tools
        });
        this.assistant = assistant;
        return assistant;
    };
    getAssistant = async (id) => {
        const assistant = await openai.beta.assistants.retrieve(id);
        this.assistant = assistant;
        return assistant;
    };
    createThread = async () => {
        var thread = await openai.beta.threads.create();
        this.thread = thread;
        return thread;
    };

    deleteAssistants = async (run) => {

        var ass = await openai.beta.assistants.list({ limit: 100 });
        console.log(ass.data.length);
        // ass.data.every(function (a) {
        //     console.log(a.id);
        //     await openai.beta.assistants.del(a.id);
        //     //   console.log(response);
        // });
        for await (const a of ass.data) {
            console.log(a.id);
            openai.beta.assistants.del(a.id);
        }

    };
    //这个比较精确
    handleRunStatus = async (run) => {
        // Check if the run is completed
        if (run.status === "completed") {
            let messages = await client.beta.threads.messages.list(thread.id);
            console.log(messages.data);
            return messages.data;
        } else if (run.status === "requires_action") {
            console.log(run.status);
            return await handleRequiresAction(run);
        } else {
            console.error("Run did not complete:", run);
        }
    };

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


    assistantsSample = async function (msg) {

        // Initial Run status: queued
        // Run status: queued
        // Run status: in_progress
        // Run status: completed
        // Final Run status: completed

        //助手
        //1. server起動するときに、作成する
        const assistant = await openai.beta.assistants.create({
            name: "会社の営業",
            instructions: "あなたはFSR株式会社の営業です。会社の情報をお客さんに紹介する。",
            model: "gpt-3.5-turbo",
            tools: this.tools
        });
        //2. 线程，不同用户新建 New Connect
        const thread = await openai.beta.threads.create();

        //3. Messag:消息
        // ユーザーが入力したクエリを Message として OpenAI API に送信する，往哪一个线程传递，可以管理不同线程
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: msg,
        });
        //4. execute
        let run = await openai.beta.threads.runs.create(
            thread.id,
            { assistant_id: assistant.id }
        );
        //5. 执行完毕
        const runToReteive = await this.waitRun(thread.id, run.id)

        return runToReteive;
    };

    createRun = async function () {

    };
    todo = async function () {
        // run = openai.beta.threads.runs.retrieve(
        //     thread_id = thread.id,
        //     run_id = run.id
        // );
        // openai.beta.threads.runs.retrieve(
        //     thread_id = thread.id,
        //     run_id = run.id
        // );
        // messages = openai.beta.threads.messages.list(
        //     thread_id = thread.id
        // );
    };

    company = async function (msg) {
        //配置，可以改成动态的，或者保存文件 进行热更新 json.parse?

        this.messages = [];
        this.messages.push({
            role: "user",
            content: msg
        });
        //第一步查询，分流，每次执行一遍
        var res = await this.func(this.messages, this.tools);
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
};
export { AI };
