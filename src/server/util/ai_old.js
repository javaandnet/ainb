
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
                    description: "会社普通情報を取得場合",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の範囲" },
                            condition: { description: "質問の条件", type: "string" }
                        },
                        required: ["query","condition"],//必须
                    },
                },
            }, {
                type: "function",
                function: {
                    name: "get_emp",// 绑定到函数
                    description: "技術者の情報を取得する",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の範囲" },
                            condition: { description: "質問の条件", type: "string" }
                        },
                        required: ["query","condition"],//必须
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
        if (lastFlag) {
            // console.log(msgs[0].content[0].text);
            var text = msgs[0].content[0].text.value;
            return text;
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
            await new Promise((resolve) => setTimeout(resolve, 100));
            return await this.waitRun(threadId, runId);
        } else if (run.status === "requires_action" && run.required_action) {//需要下一步
            // NOTE: 複数回の Tools の呼び出しには対応していない
            const call = run.required_action.submit_tool_outputs.tool_calls[0];
            //console.log(call.function.name);
            const args = JSON.parse(call.function.arguments);
            //执行
            console.log(call.function.name);
            console.log(args);
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
            return await this.waitRun(threadId, runId);
        } else if (run.status === "completed") {
            let messages = await openai.beta.threads.messages.list(threadId);
            //注意为逆序操作
            return messages.data;
        }
        console.log(run.status);
        return run;
    };
    createAssistant = async () => {
        const assistant = await openai.beta.assistants.create({
            name: "会社の営業",
            instructions: "あなたはFSR株式会社の営業です。会社の情報をお客さんに紹介する。",
            model: "gpt-3.5-turbo",
            tools: this.tools
        });

        // const assistant = await openai.beta.assistants.create({
        //     name: "飲食店の店員",
        //     instructions: "あなたは飲食店の店員です。飲食店のメニューを紹介すること、注文すること。",
        //     model: "gpt-3.5-turbo",
        //     tools: this.tools
        // });
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
        if (args.query.includes("name") || args.query.includes("名前")) {
            return "FSR株式会社"
        } else if (args.query.includes("社長") || args.query.toLowerCase().includes("ceo") || args.query.toLowerCase().includes("president")) {
            return "孫光"
        } else if (args.query.includes("未稼働") || args.query.includes("inactive") || (args.condition && (args.condition.includes("未稼働") || args.condition.includes("稼働していない") || args.condition.includes("未稼働") || args.condition.includes("inactive")))) {

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
    };
    createJson = function(){
        return [
            {
                "MenuName": "宫保鸡丁",
                "Ingredients": "鸡胸肉, 花生, 干辣椒, 酱油, 蒜, 姜",
                "PreparationMethod": "鸡肉切块，腌制10分钟，炒熟后加入配料炒匀。",
                "Price": 25,
                "Spiciness": 3,
                "Review": "麻辣适中，口感丰富"
            },
            {
                "MenuName": "麻婆豆腐",
                "Ingredients": "豆腐, 牛肉末, 辣椒酱, 豆瓣酱, 蒜, 姜",
                "PreparationMethod": "豆腐切块焯水，牛肉末炒熟，加入豆瓣酱和辣椒酱，放入豆腐煮10分钟。",
                "Price": 18,
                "Spiciness": 5,
                "Review": "非常麻辣，适合重口味"
            },
            {
                "MenuName": "红烧肉",
                "Ingredients": "五花肉, 生抽, 老抽, 冰糖, 葱, 姜",
                "PreparationMethod": "五花肉切块，焯水后煮沸，加入调料慢炖1小时。",
                "Price": 30,
                "Spiciness": 2,
                "Review": "酱香浓郁，肥而不腻"
            },
            {
                "MenuName": "酸辣土豆丝",
                "Ingredients": "土豆, 青椒, 红辣椒, 醋, 酱油",
                "PreparationMethod": "土豆切丝焯水，热油爆香辣椒，加入土豆丝翻炒，最后加醋和酱油。",
                "Price": 15,
                "Spiciness": 4,
                "Review": "酸辣开胃，口感脆嫩"
            },
            {
                "MenuName": "鱼香茄子",
                "Ingredients": "茄子, 猪肉末, 辣椒酱, 酱油, 蒜, 姜",
                "PreparationMethod": "茄子切块炸至金黄，猪肉末炒熟，加入调料和茄子翻炒均匀。",
                "Price": 22,
                "Spiciness": 4,
                "Review": "味道浓郁，茄子软嫩"
            },
            {
                "MenuName": "蒜蓉粉丝蒸扇贝",
                "Ingredients": "扇贝, 粉丝, 蒜, 酱油, 料酒",
                "PreparationMethod": "扇贝洗净，粉丝泡软，铺在蒜蓉和酱油料酒混合料上蒸10分钟。",
                "Price": 35,
                "Spiciness": 1,
                "Review": "鲜美可口，蒜香浓郁"
            },
            {
                "MenuName": "回锅肉",
                "Ingredients": "五花肉, 青椒, 红辣椒, 豆瓣酱, 蒜, 姜",
                "PreparationMethod": "五花肉煮熟切片，热锅爆炒青椒和红辣椒，再加入五花肉和豆瓣酱炒匀。",
                "Price": 28,
                "Spiciness": 3,
                "Review": "香辣适口，肉质鲜嫩"
            },
            {
                "MenuName": "干煸四季豆",
                "Ingredients": "四季豆, 干辣椒, 蒜, 姜",
                "PreparationMethod": "四季豆焯水，热油炒干辣椒和四季豆至干香。",
                "Price": 20,
                "Spiciness": 4,
                "Review": "干香麻辣，口感独特"
            },
            {
                "MenuName": "香辣虾",
                "Ingredients": "虾, 干辣椒, 花椒, 蒜, 姜",
                "PreparationMethod": "虾去壳，炒干辣椒和花椒，加入虾炒至变红。",
                "Price": 38,
                "Spiciness": 5,
                "Review": "香辣过瘾，虾肉鲜美"
            },
            {
                "MenuName": "水煮牛肉",
                "Ingredients": "牛肉, 辣椒, 花椒, 豆瓣酱, 豆芽",
                "PreparationMethod": "牛肉切片焯水，热锅炒辣椒和花椒，加入牛肉和豆瓣酱煮熟，最后加豆芽煮1分钟。",
                "Price": 40,
                "Spiciness": 5,
                "Review": "麻辣鲜香，牛肉嫩滑"
            }
        ];
        
    }

};
export { AI };
