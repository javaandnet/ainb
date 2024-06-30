import { AI } from './util/ai.js';
import SF from './util/sf.js';
import Util from './util/util.js';
const util = new Util();
const sf = new SF();
import { Config } from "./util/config.js";
import OpenAI from "openai";


import fs from "fs";
const openai = new OpenAI(Config.openai);
const ai = new AI();

async function help(name1, name2) {
    const root = "/Users/fengleiren/git/ainb/src/server/test/";
    const text1 = await util.readFile(root + name1);
    const text2 = await util.readFile(root + name2);
    ai.similar(text1, text2);
}


async function test2() {
    const judgeStr =
    `
日本語:4
技術力:2
コミュニティケーション:3
技術分野:Java.Net`;
    const response1 = await openai.embeddings.create({
        
        model: "text-embedding-ada-002",
        input: judgeStr,
    });
    console.log(response1.data[0].embedding);
    //一样的可以保存即可
}

// const score1 = await help("1.txt", "project.txt");
// const score2 = await help("2.txt", "project.txt");
// console.log(`score1:${score1} => ${score1} > ${score2}`);
//
// SELECT Id, Name, SalesStatus__c, Japanese__c, Qualifications__c, Skill__c, TecKind__c, TecLevel__c, Communication__c, MainDrive__c FROM Worker__c WHERE SalesStatus__c = '可能'

async function judge() {

    let records = await sf.retrieve("Worker__c", ["a05F300000HYu46IAD", "a05F300000HYu5GIAT", "a05F300000HYu4oIAD", "a05F300000HYufwIAD"]);

    //要求 >=
    //SKill
    //保存
    const judgeStr =
        `
日本語:4
技術力:2
コミュニティケーション:3
技術分野:Java.Net`;

    const map2 = {
        "Japanese__c": "日本語",
        "TecLevel__c": "技術力",
        "Communication__c": "コミュニティケーション",
        "TecKind__c": "技術分野"
    };
    let max = 0;
    let maxName = 0;
    for (const record of records) {
        console.log(record.Name);
        let str = util.objToStr(util.objToObj(record, map2));
        console.log(str);
        const score = await ai.similar(judgeStr, str);
        if (score > max) {
            max = score;
            maxName = record.Name;
        }
    }

    console.log("MacName", maxName);
}

