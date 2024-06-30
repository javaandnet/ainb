import Excel from '../util/excel.js';
import Util from '../util/util.js';
import TestUtil from '../test/testUtil.js';
const test = new TestUtil();
const util = new Util();
const excelPath = "/Users/fengleiren/git/ainb/src/server/files/resume/FSR_0107_宋E.xlsx";
const txtPath = "/Users/fengleiren/git/ainb/src/server/files/resume/excel.txt";
const excel = new Excel(excelPath, txtPath);
function getWorkerText() {

    const lastRow = excel.getLastRow();
    const skillConfig = {
        start: "◇工程経験：",
        end: "◇その他：",
        judgeCell: "E",
        infoCell: "I",
    };
    const resumeConfig = {
        index: "業種：",
        judgeCell: "E",
        end: "◇その他：",
        judgeCell: "K",
        infoCell: "I",
    };
    let skillFLg = false;
    let skillFinishFLg = false;
    let skillArray = [];

    for (let i = 1; i < lastRow; i++) {
        /**Skill Part */
        if (!skillFinishFLg) {
            const judgeName = skillConfig.judgeCell + i;
            const infoName = skillConfig.infoCell + i;
            const cell = excel.getCellValue(judgeName, 0);
            if (util.defined(cell)) {
                if (cell == skillConfig.start) {
                    skillFLg = true;
                    skillArray.push("スキル部分開始する");
                } else if (cell == skillConfig.end) {
                    skillFLg = false;
                    skillFinishFLg = true;
                    skillArray.push("スキル部分終了する");
                }
                if (skillFLg) {
                    skillArray.push(cell + ":" + excel.getCellValue(infoName));
                }
            }
        }
        /**resume Part */
        if (skillFinishFLg) {
            const judgeCellName = resumeConfig.judgeCell + i;


            let cellResumeNames = {
                "kind": [1, 0],
                "sepg": [1, 4],
                "os": [5, 0],
                "language": [3, 0],
                "info": [-6, 0],
            };
            let cellPhaseNames = {
                "調査分析": [9, 0],
                "要件定義": [10, 0],
                "基本設計": [11, 0],
                "詳細設計": [12, 0],
                "製　　造": [13, 0],
                "単体試験": [14, 0],
                "結合試験": [15, 0],
                "総合試験": [16, 0],
                "運用保守": [17, 0],
            };
            const judgeCell = excel.getCellValue(judgeCellName);
            //Index確定
            if (util.defined(judgeCell)) {
                //履历部分
                let resumeCellMap = {};
                //担当部分
                let phaseCellMap = {};



                /**1回的数据 一时保存,以此为基准取值 [業種：]使用判断*/
                if (judgeCell == resumeConfig.index) {
                    const infoCellCol = excel.getColName(resumeConfig.judgeCell, 1);
                    let infoAray = [];


                    /**業　　　務　　　経　　　験 */
                    Object.keys(cellResumeNames).map((k) => {
                        resumeCellMap[k] = excel.calCellName(judgeCellName, cellResumeNames[k][0], cellResumeNames[k][1]);
                    });

                    /** 開発段階 */
                    Object.keys(cellPhaseNames).map((k) => {
                        phaseCellMap[k] = excel.calCellName(resumeConfig.judgeCell + i, cellPhaseNames[k][0], 0);
                    });

                    /** Get Value*/
                    Object.keys(resumeCellMap).forEach((k) => {
                        infoAray.push(excel.getCellValue(resumeCellMap[k]));
                    });
                    skillArray.push("業務部分開始する");
                    skillArray.push(infoAray.join("\t"));
                    skillArray.push("業務部分終了する");

                    infoAray = [];
                    Object.keys(phaseCellMap).forEach((k) => {
                        if (excel.getCellValue(phaseCellMap[k]) == "●") {
                            infoAray.push(k);
                        }
                    });
                    skillArray.push("業務担当部分開始する");
                    skillArray.push(infoAray.join("\t"));
                    skillArray.push("業務担当部分終了する");
                }
            }
        }
    }
    console.log(skillArray.join("\r\n"));
}
getWorkerText();
// test.test(excel,"calColumn","Z1",2,34);