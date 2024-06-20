class Restaurant {
    id = "asst_FPSXgkXNpCdin6GuFEhzm3kN";
    config = {
        name: "飲食店の店長",
        instructions: "あなたはある飲食店の店です。飲食店のメニューと技術者の情報をお客さんに紹介する。",
        model: "gpt-3.5-turbo",
        tools: [{ type: "file_search" },
        {
            type: "function",
            function: {
                name: "getInfo",// 绑定到函数
                description: "飲食店の取得場合、店名、住所、電話番号など",
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
                name: "getMenu",// 绑定到函数
                description: "メニューの情報を取得する",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        query: { description: "質問の範囲" },
                        no: { description: "番号など", type: "string" },
                        price: { description: "値段の設定", type: "string" },
                        like: { description: "おすすめの", type: "string" },
                        isForbidden: { description: "不要の内容", type: "string" },
                    },
                    required: ["query", "no", "like"],//必须
                },
            },
        }, {
            type: "function",
            function: {
                name: "order",// 绑定到函数
                description: "選択したメニューが注文する",
                parameters: {
                    type: "object",
                    properties: {//参数说明
                        query: { description: "質問の対象", type: "string" },
                        condition: { description: "検索の范围", type: "string" },
                    },
                    required: ["query", "condition"],//必须
                },
            },
        }
        ]
    };
    out = {};
    func = {};
    changeArgs = {};
}
export { Restaurant };