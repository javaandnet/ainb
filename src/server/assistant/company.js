class Company {
    id = "asst_0vl90HXVvBv8T5qsBwXYbsYG";
    config = {
        
        name: "会社の営業",
        instructions: "あなたはFSR株式会社の営業です。会社と技術者の情報をお客さんに紹介する。メール送信の操作を行う。関数を呼び出すときに、名前以外パラメータが英語に変換してください。メール送信前再確認必要です。",
        model: "gpt-3.5-turbo",
        tools: [
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
        ]
    }
}
export { Company };