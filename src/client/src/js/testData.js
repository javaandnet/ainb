export default class TestData {

    getSenderList = function () {
        return [
            { type: "0", text: "FSR会社", value: "11" },
            { type: "1", text: "SAP案件説明名", value: "11" },
            { type: "2", text: "メール例 nin@fsr.co.jp", value: "11" },
            { type: "3", text: "任（企業Wecom）", value: "11" },
            { type: "4", text: "個人名", value: "11" },
        ]
    };
    getWorkerList = function () {
        return [
            { type: "9", text: "高大芳", value: "11" },
            { type: "9", text: "王瀚達", value: "11" }]
    };
    listMsg = function () {
        return {
            mode: "list", model: "worker", list: [{
                text: "高大芳",
                value: "a05F300000HYu46IAD"//Id,   
            }, {
                text: "王瀚達",
                value: "a05F300000HYu68IAD"//Id,   
            }]
        };
    }
}