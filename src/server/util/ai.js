
import { Config } from "./config.js";
import Util from '../util/util.js';
const util = new Util();
import WavEncoder from 'wav-encoder';
import { AssistantFactory } from './assistantFactory.js';
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const assistantFactory = new AssistantFactory();
const openai = new OpenAI(Config.openai);

class AI {
    constructor() {
        this.DEBUG = true;
        this.DEBUGRESULT = true;
        this.DEBUGRTN = true;
        this.assistantName = "";
    }

    /**
     * 
     * 
     * @param {*} msg 
     * @param {*} threadId threadId
     * @param {*} strFlg Trueの場合、Stringに戻す
     * @returns 
     *    { 
     *       data: messages,        //OpenAI に保存する　messages
     *        rtn: { 
     *                fun: "funcname", //関数名
     *                args: "args", 　   //パラメータ
     *                ai: "AI",             //AIに渡す情報
     *    　         type: "AI/FUNC" //出力タイプ　AIの場合はaiを生成する
     *                str: "BBB" 　　  //出力文字列
     *            }
     *        }
     */
    chat = async function (msg, threadId, strFlg = true) {

        //1. 确认Thread，本质应该需要每一次都传
        if (util.undefined(threadId)) {
            //TODO Test
            if (util.undefined(this.thread)) {
                console.error("Create Thread First");
                return {};
            } else {
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
        let result = await this.waitRun(threadId, run.id);
        //6.信息变化,必要な場合前のMessageを変更する
        const msgs = await this.doMsg(result.data);
        //TODO serverにrequest
        let rtnType = "AI";
        if (result.rtn.out) {
            rtnType = "FUNC";
            rtnStr = result.rtn.out;
        } else {
            rtnStr = msgs.data[0].content[0].text.value;
        }
        result.rtn.type = rtnType;
        result.rtn.str = rtnStr;
        //data 設定前に出力する
        if (this.DEBUG) {
            console.log("Rtn:", result.rtn);
        }
        result.data = msgs;
        return result;
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

    /**
     * 
     * @returns thread
     */
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
    /**
     * 全てAssistantを削除する
     * @param {*} run 
     */
    deleteAssistants = async (run) => {
        var ass = await openai.beta.assistants.list({ limit: 100 });
        // console.log(ass.data.length);
        for await (const a of ass.data) {
            // console.log(a.id);
            openai.beta.assistants.del(a.id);
        }

    };
    /**
     *  実行する
     * @param {*} threadId 
     * @param {*} runId 
     * @param {*} doRtn 
     * @returns 
     */
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
                    console.log("変更前実行変数：", args);
                }
                var assistantConfig = assistantFactory.get(this.assistantName);
                //変数を変更する
                //args = await this.doChangeArgs(funcName, args);
                if ((assistantConfig.changeArgs)[funcName]) {
                    args = await ((assistantConfig.changeArgs)[funcName](args));
                }
                if (this.DEBUG) {
                    console.log("変更後実行変数：", args);
                }
                //Run Step可获得,To Update
                let doRtn = await (assistantConfig.func)[funcName](args);

                if (this.DEBUG && this.DEBUGRESULT) {
                    console.log("実行結果：", doRtn);
                }
                //Stringの場合は同じする、生成StringをRequestする
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

    chatInVoice = async function (buffer, threadId, type = 0) {
        const txt = await this.v2t(buffer, type);
        const rtn = await this.chat(txt, threadId);
        return rtn;
    };

    v2t = async function (buffer, type = 0) {
        //TODO MP3
        // const bodyData = JSON.parse(req.body);
        // const base64Audio = bodyData.audioData;
        // // Decode Base64 to binary
        // const audioBuffer = Buffer.from(base64Audio, "base64");
        // Convert byte array to Float32Array
        const toF32Array = (buf) => {
            const buffer = new ArrayBuffer(buf.length)
            const view = new Uint8Array(buffer)
            for (var i = 0; i < buf.length; i++) {
                view[i] = buf[i]
            }
            return new Float32Array(buffer)
        }
        let sampleRate = 48000;//此处需要修改 是否一致
        const f32array = toF32Array(buffer);
        const audioData = {
            sampleRate: sampleRate,
            channelData: [f32array]
        };

        var buffer = await WavEncoder.encode(audioData);

        const transcription = await openai.audio.transcriptions.create({
            file: await toFile(buffer, "audio.wav", {
                contentType: "audio/wav",
            }),
            model: "whisper-1",
        });
        if (this.DEBUG) {
            console.log("Trans Txt:" + transcription.text);
        }
        return transcription.text;

    };
};
export { AI };
