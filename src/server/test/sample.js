import Worker from '../model/worker.js';
import Project from '../model/project.js';
import MySql from '../util/mysql.js';
import { Config } from "../util/config.js";
import OpenAI from "openai";
const openai = new OpenAI(Config.openai);
import Util from '../util/util.js';
const util = new Util();
const mySql = new MySql();

const workerModel = new Worker();
// workerModel.initExcel("/Users/fengleiren/git/ainb/src/server/files/resume/FSR_0107_宋E.xlsx");
// console.log((workerModel.toTxt()).must);

const projectModel = new Project();
const workers = await workerModel.getDBData("name,vec,must", { no: "0152" });
const projects = await projectModel.getDBData("name,vec,txt,must", {}, { limit: 10 });
async function match() {

    for (const project of projects) {
        let max = 0;
        let maxName = "";
        for (const worker of workers) {
            // console.log(worker["must"]);
            if(project["must"] == "Sap"){
                //   console.log(`111`);
            }
            if (worker["vec"] != null && worker["vec"].length > 0) {
                if (await match2(project["must"], worker["must"])) {
                    // console.log(project["must"]);
                    let score = util.similarity(project["vec"], worker["vec"]);
                    if (score > max) {
                        max = score;
                        maxName = worker.name;
                    }
                }

            }
        }
        if (max > 0) {
            console.log(`${project.name}:${maxName}`);
        }

    }
}

// workerModel.includeMust("sap","sap");



async function match2(must, content) {
    const msg = ` Whether all the word in  [${must}] exist in the  [${content}]. pls answer yes or no`;
    // console.log(msg);
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        messages: [{ role: "user", content: msg }],

    });

    const result = response.choices[0].message.content.trim();
    if (result.toUpperCase() == "YES") {
        return true;
    }
    return false;
}


match();