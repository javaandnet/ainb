
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

    similar = async function (text1, text2) {
        try {
            const response1 = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text1,
            });

            const response2 = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text2,
            });

            const embedding1 = response1.data[0].embedding;
            const embedding2 = response2.data[0].embedding;
            console.log();
            const similarity = cosineSimilarity(embedding1, embedding2);
            return similarity;
            console.log(`相似度: ${similarity}`);
        } catch (error) {
            console.error("Error calculating similarity:", error);
        }


        function cosineSimilarity(vecA, vecB) {
            const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
            const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
            const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
            return dotProduct / (magnitudeA * magnitudeB);
        }
    };

    /**
     * 
     * 
     * @param {*} msg 
     * @param {*} keyWords {"#ADD#":"案件を追加する"}　交換要　Keyword,1の場合は第一行
     * @param {*} threadId threadId Null 一次性
     * @param {*} strFlg Trueの場合、Stringに戻す
     * @returns 
     *    { 
     *       data: messages,        //OpenAI に保存する　messages
     *        rtn: { 
     *                func: "funcname", //関数名
     *                args: "args", 　   //パラメータ
     *                ai: "AI",             //AIに渡す情報
     *    　         type: "AI/FUNC" //出力タイプ　AIの場合はaiを生成する
     *                str: "BBB" 　　  //出力文字列
     *            }
     *        }
     */
    chat = async function (msg, keyWords = {}, threadId, strFlg = true) {

        //0.Key Word处理 Once
        let keys = Object.keys(keyWords);
        let beforeMsg = "";
        for (const key of keys) {
            if (msg.indexOf(key) >= 0) {
                //元のMSGを一時退避する               
                beforeMsg = msg;
                //KeyWord を削除する
                msg = msg.replace("#Add#", "");
                threadId = null;
                //1の場合は第一行                
                if (keyWords[key].indexOf("{0}") >= 0) {
                    msg = keyWords[key].replace("{0}", util.firstLine(msg));
                } else {
                    msg = keyWords[key];
                }
            }
        }
        //1. 确认Thread，本质应该需要每一次都传
        if (util.undefined(threadId)) {//ForTest
            if (util.undefined(this.thread)) {//FIRST
                this.thread = await this.createThread();
            }
            threadId = this.thread.id;
        } else if (threadId == null) {//一次性
            let _thread = await this.createThread();
            threadId = _thread.id;
        }
        //2. do what hahaha

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
        //5. 执行
        if (this.DEBUG) {
            console.log("To AI:", msg);
        }
        let result = await this.waitRun(threadId, run.id);

        //6.信息变化,必要な場合前のMessageを変更する
        // Todo serverにrequest assitant中で処理など
        const msgs = await this.doMessages(threadId, result);
        //7.戻り値を処理する
        let rtnType = "AI";
        let rtnStr = "";

        if (util.undefined(result.rtn)) {
            result.rtn = {};
        }
        if (result.rtn.out) {
            rtnType = "FUNC";
            rtnStr = result.rtn.out;
        } else if (result.rtn.server) {
            rtnType = "SERVER";
            rtnStr = result.rtn.server;
        }
        else {
            try {
                rtnStr = msgs.messages.data[0].content[0].text.value;
            } catch (e) {
                console.error(e);
                rtnStr = "Serve error";
            }
        }
        //8.一次性处理？
        result.rtn.type = rtnType;
        result.rtn.str = rtnStr;
        result.threadId = threadId;

        //data 設定前に出力する
        if (this.DEBUG) {
            console.log("Rtn:", result.rtn);
        }
        if (strFlg) {
            return result.rtn.str;
        }
        result.data = msgs;

        for (const key of keys) {
            if (beforeMsg.indexOf(key) >= 0) {
                result.rtn.args.KEYWORDSTR = beforeMsg.replace(key, "");
            }
        }

        return result;
    };

    /**
     * 
     * @param {*} objs 配置Map
     * @param {*} rtn AI返回值
     * @param {*} obj  exe Object
     * @returns 
     */
    // func: 'selectInfo',
    // args: { type: '案件', flag: '1', info: 'FSR-0048' },
    //{company:["selectInfo","sendMail"]}
    exe = async function (objs, rtn, obj) {
        const keys = Object.keys(objs);
        let doRtn = null;
        for await (const objKey of keys) {
            let at = assistantFactory.get(objKey);
            if (objs[objKey].indexOf(rtn.func) >= 0) {//数组中存在
                if (at != null) {
                    //関数実行
                    doRtn = await (at.out)[rtn.func](rtn.args, obj);
                    break;
                }
            }
        }
        return doRtn;

    };

    /**
     * 
     * @param {*} threadId 
     * @param {*} message 
     */
    //处理实际返回的值，注意存储的与给用户显示的可以不同
    doMessages = async function (threadId, message) {
        return message;
    };

    /**
     * 
     * @returns thread
     */
    createThread = async () => {
        const thread = await openai.beta.threads.create();
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
        this.assistant = at;
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
            // console.log(run.status);
            if (run.status === "queued" || run.status === "in_progress") {
                await new Promise((resolve) => setTimeout(resolve, 200));
                return await this.waitRun(threadId, runId, doRtn);
            } else if (run.status === "requires_action" && run.required_action) {//需要下一步
                // NOTE: 複数回の Tools の呼び出しには対応していない
                const call = run.required_action.submit_tool_outputs.tool_calls[0];

                const funcName = call.function.name;
                let args = JSON.parse(call.function.arguments);
                if (this.DEBUG) {
                    console.log("関数名：", funcName);
                    console.log("変更前実行変数：", args);
                }
                var assistantConfig = assistantFactory.get(this.assistantName);
                //変数を変更する
                if ((assistantConfig.changeArgs)[funcName]) {
                    args = await ((assistantConfig.changeArgs)[funcName](args));
                }
                if (this.DEBUG) {
                    console.log("変更後実行変数", args);
                }
                //Exe
                if (util.undefined((assistantConfig.func)[funcName])) {
                    console.error("No Func" + funcName + ": ,Pls fix it.");
                    return {
                        messages: null,
                        rtn: {
                            server: "No Func Rtn,Pls Fix it",
                            func: funcName,
                            args: args
                        }
                    };
                }
                let doRtn = await (assistantConfig.func)[funcName](args);
                if (util.undefined(doRtn)) {
                    console.error("Asssitant関数" + funcName + ": No Rtn ,Pls fix it.");
                    return {
                        messages: null,
                        rtn: {
                            server: "No Func Rtn,Pls Fix it",
                            func: funcName,
                            args: args
                        }
                    };
                } else if (typeof (doRtn) == "string") {  //Stringの場合生成StringをRequestする
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
                if (util.undefined(doRtn.func)) {
                    doRtn.func = funcName;
                }
                if (util.undefined(doRtn.args)) {
                    doRtn.args = args;
                }
                //递归调用
                return await this.waitRun(threadId, runId, doRtn);
            } else if (run.status === "completed") {
                //注意为逆序操作
                //最後の状態で戻ります
                // console.log(messages);
                let messages = await openai.beta.threads.messages.list(threadId);

                //返回值包含计算的信息
                return {
                    messages: messages,
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
