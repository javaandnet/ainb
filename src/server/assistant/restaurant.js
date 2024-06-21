import Util from '../util/util.js';
const util = new Util();

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
    func = {
        getMenu: async function (args) {
            return {
                ai: util.recordsToStr(createJson(), "MenuName", "Price"),
                out: util.recordsToStr(createJson(), "#INDEX#", "MenuName")
            };
        }
    };
    changeArgs = {};
}



var createJson = function () {
    return [
        {
            "MenuName": "宫保鸡丁",
            "Ingredients": "鸡胸肉, 花生, 干辣椒, 酱油, 蒜, 姜",
            "PreparationMethod": "鸡肉切块，腌制10分钟，炒熟后加入配料炒匀。",
            "Price": 25,
            "Spiciness": 3,
            "Review": "麻辣适中，口感丰富"
        },
        {
            "MenuName": "麻婆豆腐",
            "Ingredients": "豆腐, 牛肉末, 辣椒酱, 豆瓣酱, 蒜, 姜",
            "PreparationMethod": "豆腐切块焯水，牛肉末炒熟，加入豆瓣酱和辣椒酱，放入豆腐煮10分钟。",
            "Price": 18,
            "Spiciness": 5,
            "Review": "非常麻辣，适合重口味"
        },
        {
            "MenuName": "红烧肉",
            "Ingredients": "五花肉, 生抽, 老抽, 冰糖, 葱, 姜",
            "PreparationMethod": "五花肉切块，焯水后煮沸，加入调料慢炖1小时。",
            "Price": 30,
            "Spiciness": 2,
            "Review": "酱香浓郁，肥而不腻"
        },
        {
            "MenuName": "酸辣土豆丝",
            "Ingredients": "土豆, 青椒, 红辣椒, 醋, 酱油",
            "PreparationMethod": "土豆切丝焯水，热油爆香辣椒，加入土豆丝翻炒，最后加醋和酱油。",
            "Price": 15,
            "Spiciness": 4,
            "Review": "酸辣开胃，口感脆嫩"
        },
        {
            "MenuName": "鱼香茄子",
            "Ingredients": "茄子, 猪肉末, 辣椒酱, 酱油, 蒜, 姜",
            "PreparationMethod": "茄子切块炸至金黄，猪肉末炒熟，加入调料和茄子翻炒均匀。",
            "Price": 22,
            "Spiciness": 4,
            "Review": "味道浓郁，茄子软嫩"
        },
        {
            "MenuName": "蒜蓉粉丝蒸扇贝",
            "Ingredients": "扇贝, 粉丝, 蒜, 酱油, 料酒",
            "PreparationMethod": "扇贝洗净，粉丝泡软，铺在蒜蓉和酱油料酒混合料上蒸10分钟。",
            "Price": 35,
            "Spiciness": 1,
            "Review": "鲜美可口，蒜香浓郁"
        },
        {
            "MenuName": "回锅肉",
            "Ingredients": "五花肉, 青椒, 红辣椒, 豆瓣酱, 蒜, 姜",
            "PreparationMethod": "五花肉煮熟切片，热锅爆炒青椒和红辣椒，再加入五花肉和豆瓣酱炒匀。",
            "Price": 28,
            "Spiciness": 3,
            "Review": "香辣适口，肉质鲜嫩"
        },
        {
            "MenuName": "干煸四季豆",
            "Ingredients": "四季豆, 干辣椒, 蒜, 姜",
            "PreparationMethod": "四季豆焯水，热油炒干辣椒和四季豆至干香。",
            "Price": 20,
            "Spiciness": 4,
            "Review": "干香麻辣，口感独特"
        },
        {
            "MenuName": "香辣虾",
            "Ingredients": "虾, 干辣椒, 花椒, 蒜, 姜",
            "PreparationMethod": "虾去壳，炒干辣椒和花椒，加入虾炒至变红。",
            "Price": 38,
            "Spiciness": 5,
            "Review": "香辣过瘾，虾肉鲜美"
        },
        {
            "MenuName": "水煮牛肉",
            "Ingredients": "牛肉, 辣椒, 花椒, 豆瓣酱, 豆芽",
            "PreparationMethod": "牛肉切片焯水，热锅炒辣椒和花椒，加入牛肉和豆瓣酱煮熟，最后加豆芽煮1分钟。",
            "Price": 40,
            "Spiciness": 5,
            "Review": "麻辣鲜香，牛肉嫩滑"
        }
    ];

}
export { Restaurant };