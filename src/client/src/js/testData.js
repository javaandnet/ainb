export default class TestData {

    getSenderList = function () {
        return [
            { type: "0", text: "FSR", value: "11" },
            { type: "1", text: "SAP案件", value: "11" },
            { type: "2", text: "任 nin@fsr.co.jp", value: "11" },
            { type: "3", text: "任", value: "11" },
        ]
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