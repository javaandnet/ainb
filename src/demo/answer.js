const natural = require('natural');
const levenshtein = require('js-levenshtein');
const stringSimilarity = require('string-similarity');
const tokenizer = new natural.WordTokenizer();

const str1 = '画面レイアウト、イベント設計書、DB設計書';
const str2 = '画面レイアウト、イベント設計書、DB設計書';
 

const similarity = stringSimilarity.compareTwoStrings(str1, str2);
console.log('Similarity:', similarity);