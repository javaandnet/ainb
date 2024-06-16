
import { Config } from "./config.js";
import { Helper } from './helper.js';
import { AssistantFactory } from './assistantFactory.js';
const assistantFactory = new AssistantFactory();
import OpenAI from "openai";
const openai = new OpenAI(Config.openai);

class AI {
    constructor() {
        this.DEBUG = true;
        this.DEBUGRESULT = true;
        this.assistantName = "";
    }

    /**
     * 
     * @param {*} msg 
     * @param {*} lastFlag 返回最后一条信息
     * @returns  返回最后一条信息
     */
    chat = async function (msg, threadId , lastFlag = true) {
        
        //确认Thread，本质应该需要每一次都传
        if(typeof (threadId) == "undefined"){
            if (typeof (this.thread) == "undefined") {
                console.error("Create Thrad First");
                return "Server Error";
            }else{
                threadId = this.thread.id;
            }
        }
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
                    return msgs.data[0].content[0].text.value;
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
        var content = "";
        // console.log(args);
        var funcs = assistantFactory.get(this.assistantName).route;
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
        
        const thread = await openai.beta.threads.create();
        this.thread = thread;
        return thread;
    };

    deleteThread = async function (id) {
        openai.beta.threads.delete(id)
    };

    createAssistant = async (name = "company") => {
        let at = assistantFactory.get(name);
        const assistant = await openai.beta.assistants.create(at.config);
        this.assistant = assistant;
        return assistant;
    };
    deleteAssistant = async function (id) {
        openai.beta.assistants.delete(id);
    };

    updateAssistant = async function (name = this.assistantName, options) {
        let at = assistantFactory.get(name);
        openai.beta.assistants.update(at.id, at.config);
    };

    getAssistant = async (name) => {
        let at = assistantFactory.get(name);
        const assistant = await openai.beta.assistants.retrieve(at.id);
        this.assistantName = name;
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
