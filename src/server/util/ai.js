
import { Config } from "./config.js";
import { Helper } from './helper.js';
import OpenAI from "openai";
const openai = new OpenAI(Config.openai);
const helper = new Helper();
// default config
class AI {
    constructor() {
        this.DEBUG = true;
        this.DEBUGRESULT = true;
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
                        required: ["query", "condition"],//必须
                    },
                },
            }, {
                type: "function",
                function: {
                    name: "get_emp",// 绑定到函数
                    description: "社員の情報を取得する、説明文、履歴書など、情報はそのまま出力をお願いします",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            query: { description: "質問の範囲" },
                            condition: { description: "質問の条件", type: "string" }
                        },
                        required: ["query", "condition"],//必须
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
                    description: "何が操作が行う、",
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
                    name: "send_mail",// 绑定到函数
                    description: "お客さんにメールを送信する、その前に送信情報を再確認必要です。実際送信または確認フラグを「実際」と「確認」に分けてください。",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            mailto: { description: "送信先", type: "string" },
                            isConfirm: { description: "実際送信または確認フラグ", type: "string" },
                            emp: { description: "送信の内容と関連する技術者、誰の何場合は誰を設定する", type: "string" },
                            info: { description: "発送内容の特定する、例えば、誰の何の場合は何を設定する", type: "string" }
                        },
                        required: ["mailto", "isConfirm"],//必须
                    },
                },
            }, {
                type: "function",
                function: {
                    name: "confirm_mail",// 绑定到函数
                    description: "お客さんにメールを送信前確認して、必要な場合は送信する。",
                    parameters: {
                        type: "object",
                        properties: {//参数说明
                            mailto: { description: "送信先", type: "string" },
                            isConfirm: { description: "実際送信または確認フラグ", type: "string" },
                            info: { description: "発送内容", type: "string" }
                        },
                        required: ["query", "condition", "isConfirm"],//必须
                    },
                },
            }
        ];
    }

    /**
     * 
     * @param {*} msg 
     * @param {*} lastFlag 返回最后一条信息
     * @returns  返回最后一条信息
     */
    chat = async function (msg, threadId = this.thread.id, lastFlag = true) {
        //3. Messag:消息
        // ユーザーが入力したクエリを Message として OpenAI API に送信する，往哪一个线程传递，可以管理不同线程
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: msg,
        });
        //4. execute
        let run = await openai.beta.threads.runs.create(
            threadId,
            { assistant_id: this.assistant.id }
        );
        //5. 执行完毕
        let msgs = await this.waitRun(threadId, run.id);
        //信息变化
        msgs = await this.doMsg(msgs);
        //TODO msgを変更する
        if (lastFlag) {
            // console.log(msgs[0].content[0].text);
            if (msgs.rtn) {
                if (msgs.rtn.out) {
                    return msgs.rtn.out;
                } else {
                    return msgs.data[0].content[0].text;
                }
            } else {
                console.log(msgs);
                return "情報がありません";
            }

        }
        return msgs.data;
    };
    /**
     * 
     * @param {*} func 
     * @param {*} args 
     */
    //处理实际返回的值，注意存储的与给用户显示的可以不同
    doMsg = async function (msgs) {
        return msgs;
    };
    doFunc = async function (func, args) {
        //SELECT Id, Name, Information__c, Resume__c FROM Worker__c
        var content = "";
        // console.log(args);
        var funcs = {
            "get_info": helper.getInfo,
            "get_number": helper.getNumber,
            "get_emp": helper.getEmp,
            "send_mail": helper.sendMail,
            "confirm_mail": helper.confirmMail
        };
        var rtn = await funcs[func](args);

        return rtn;
    };
    /**
     * 個別の処理
     */
    doChangeArgs = async function (func, args) {
        if (func == "send_mail" || func == "confirm_mail") {
            // args.subject = "技術者：" + this.emp.name;
            // args.info = this.emp.information;
            // console.log("argsを編集する");
            return args;
        } else if (func == "get_emp") {
            if (args.condition) {
                args.condition = args.condition.replace("name:", "");
            }
            if (args.query) {
                if (args.query.name) {
                    args.query = args.query.name;
                }
                try {
                    args.query = args.query.replace("name:", "");
                } catch (e) {
                    console.log("変換不要");
                }
            }

        }
        return args;
    };

    createThread = async () => {
        var thread = await openai.beta.threads.create();
        this.thread = thread;
        return thread;
    };

    deleteThread = async function (id) {
        openai.beta.threads.delete(id)
    };

    createAssistant = async () => {
        const assistant = await openai.beta.assistants.create({
            name: "会社の営業",
            instructions: "あなたはFSR株式会社の営業です。会社と技術者の情報をお客さんに紹介する。メール送信の操作を行う。関数を呼び出すときに、名前以外パラメータが英語に変換してください。メール送信前再確認必要です。",
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
    deleteAssistant = async function (id) {
        openai.beta.assistants.delete(id);
    };
    updateAssistant = async function (id, options) {
        id = this.assistant.id;
        options = {
            tools: this.tools
        };
        openai.beta.assistants.update(id, options);
    };
    getAssistant = async (id) => {
        const assistant = await openai.beta.assistants.retrieve(id);
        this.assistant = assistant;
        return assistant;
    };

    deleteAssistants = async (run) => {

        var ass = await openai.beta.assistants.list({ limit: 100 });
        // console.log(ass.data.length);
        for await (const a of ass.data) {
            // console.log(a.id);
            openai.beta.assistants.del(a.id);
        }

    };
    waitRun = async function (threadId, runId, doRtn) {
        try {
            let rtn = {};
            const run = await openai.beta.threads.runs.retrieve(threadId, runId);
            if (run.status === "queued" || run.status === "in_progress") {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return await this.waitRun(threadId, runId, doRtn);
            } else if (run.status === "requires_action" && run.required_action) {//需要下一步
                // NOTE: 複数回の Tools の呼び出しには対応していない
                const call = run.required_action.submit_tool_outputs.tool_calls[0];
                //console.log(call.function.name);
                const funcName = call.function.name;
                let args = JSON.parse(call.function.arguments);
                if (this.DEBUG) {
                    console.log("関数名：", funcName);
                    console.log("実行変数変更前：", args);
                }
                //変数を変更する
                args = await this.doChangeArgs(funcName, args);
                if (this.DEBUG) {
                    console.log("実行変数：", args);
                }
                //Run Step可获得
                let doRtn = await this.doFunc(funcName, args);

                if (this.DEBUG && this.DEBUGRESULT) {
                    console.log("実行結果：", doRtn);
                }
                //Stringの場合は同じする
                if (typeof (doRtn) == "string") {
                    doRtn = { ai: doRtn };
                }
                //提交函数执行完的结果
                await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
                    tool_outputs: [
                        {
                            tool_call_id: call.id,
                            output: doRtn.ai//AIに発送する
                        }
                    ],
                });
                doRtn.fun = funcName;
                doRtn.args = args;
                //递归调用
                return await this.waitRun(threadId, runId, doRtn);
            } else if (run.status === "completed") {
                let messages = await openai.beta.threads.messages.list(threadId);
                //注意为逆序操作
                //最後の状態で戻ります
                // console.log(messages);
                await this.doMessages(threadId);
                //返回值包含计算的信息
                return {
                    data: messages.data,
                    rtn: doRtn
                };

            }
            return run;
        }
        catch (e) {
            console.error(e);
            return { ai: "情報なし", out: "" };
        }
    };
    /**
     * Modify msg 実行後
     * @param {} threadId 
     */
    doMessages = async (threadId) => {


    };
    //这个比较精确
    handleRunStatus = async (run) => {
        // Check if the run is completed
        if (run.status === "completed") {
            let messages = await client.beta.threads.messages.list(thread.id);
            return messages.data;
        } else if (run.status === "requires_action") {
            console.log(run.status);
            return await handleRequiresAction(run);
        } else {
            console.error("Run did not complete:", run);
        }
    };
    ask = async function main(q) {
        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: q }]
        });

        return stream.choices[0].message.content;
    };

    createRun = async function () {

    };
    todo = async function () {
    };


};
export { AI };
