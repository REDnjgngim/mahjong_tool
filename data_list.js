'use strict';

/*
この牌理ツールはタケオしゃん氏が公開している"麻雀小粒プログラミング"を元に作成しています。
https://mahjong.org/programming/
*/

//============================================================================
//牌の配列：JSON形式
//============================================================================
function paiData() {
    var hoge = [
        { "No": 0,  "paiName": "一萬", "paiCode": "1m", "paiNo": 1, "paiType": 0 },
        { "No": 1,  "paiName": "一萬", "paiCode": "1m", "paiNo": 1, "paiType": 0 },
        { "No": 2,  "paiName": "一萬", "paiCode": "1m", "paiNo": 1, "paiType": 0 },
        { "No": 3,  "paiName": "一萬", "paiCode": "1m", "paiNo": 1, "paiType": 0 },
        { "No": 4,  "paiName": "二萬", "paiCode": "2m", "paiNo": 2, "paiType": 0 },
        { "No": 5,  "paiName": "二萬", "paiCode": "2m", "paiNo": 2, "paiType": 0 },
        { "No": 6,  "paiName": "二萬", "paiCode": "2m", "paiNo": 2, "paiType": 0 },
        { "No": 7,  "paiName": "二萬", "paiCode": "2m", "paiNo": 2, "paiType": 0 },
        { "No": 8,  "paiName": "三萬", "paiCode": "3m", "paiNo": 3, "paiType": 0 },
        { "No": 9,  "paiName": "三萬", "paiCode": "3m", "paiNo": 3, "paiType": 0 },
        { "No": 10, "paiName": "三萬", "paiCode": "3m", "paiNo": 3, "paiType": 0 },
        { "No": 11, "paiName": "三萬", "paiCode": "3m", "paiNo": 3, "paiType": 0 },
        { "No": 12, "paiName": "四萬", "paiCode": "4m", "paiNo": 4, "paiType": 0 },
        { "No": 13, "paiName": "四萬", "paiCode": "4m", "paiNo": 4, "paiType": 0 },
        { "No": 14, "paiName": "四萬", "paiCode": "4m", "paiNo": 4, "paiType": 0 },
        { "No": 15, "paiName": "四萬", "paiCode": "4m", "paiNo": 4, "paiType": 0 },
        { "No": 16, "paiName":"赤五萬","paiCode": "0m", "paiNo": 0, "paiType": 0 },
        { "No": 17, "paiName": "五萬", "paiCode": "5m", "paiNo": 5, "paiType": 0 },
        { "No": 18, "paiName": "五萬", "paiCode": "5m", "paiNo": 5, "paiType": 0 },
        { "No": 19, "paiName": "五萬", "paiCode": "5m", "paiNo": 5, "paiType": 0 },
        { "No": 20, "paiName": "六萬", "paiCode": "6m", "paiNo": 6, "paiType": 0 },
        { "No": 21, "paiName": "六萬", "paiCode": "6m", "paiNo": 6, "paiType": 0 },
        { "No": 22, "paiName": "六萬", "paiCode": "6m", "paiNo": 6, "paiType": 0 },
        { "No": 23, "paiName": "六萬", "paiCode": "6m", "paiNo": 6, "paiType": 0 },
        { "No": 24, "paiName": "七萬", "paiCode": "7m", "paiNo": 7, "paiType": 0 },
        { "No": 25, "paiName": "七萬", "paiCode": "7m", "paiNo": 7, "paiType": 0 },
        { "No": 26, "paiName": "七萬", "paiCode": "7m", "paiNo": 7, "paiType": 0 },
        { "No": 27, "paiName": "七萬", "paiCode": "7m", "paiNo": 7, "paiType": 0 },
        { "No": 28, "paiName": "八萬", "paiCode": "8m", "paiNo": 8, "paiType": 0 },
        { "No": 29, "paiName": "八萬", "paiCode": "8m", "paiNo": 8, "paiType": 0 },
        { "No": 30, "paiName": "八萬", "paiCode": "8m", "paiNo": 8, "paiType": 0 },
        { "No": 31, "paiName": "八萬", "paiCode": "8m", "paiNo": 8, "paiType": 0 },
        { "No": 32, "paiName": "九萬", "paiCode": "9m", "paiNo": 9, "paiType": 0 },
        { "No": 33, "paiName": "九萬", "paiCode": "9m", "paiNo": 9, "paiType": 0 },
        { "No": 34, "paiName": "九萬", "paiCode": "9m", "paiNo": 9, "paiType": 0 },
        { "No": 35, "paiName": "九萬", "paiCode": "9m", "paiNo": 9, "paiType": 0 },

        { "No": 36, "paiName": "一筒", "paiCode": "1p", "paiNo": 1, "paiType": 1 },
        { "No": 37, "paiName": "一筒", "paiCode": "1p", "paiNo": 1, "paiType": 1 },
        { "No": 38, "paiName": "一筒", "paiCode": "1p", "paiNo": 1, "paiType": 1 },
        { "No": 39, "paiName": "一筒", "paiCode": "1p", "paiNo": 1, "paiType": 1 },
        { "No": 40, "paiName": "二筒", "paiCode": "2p", "paiNo": 2, "paiType": 1 },
        { "No": 41, "paiName": "二筒", "paiCode": "2p", "paiNo": 2, "paiType": 1 },
        { "No": 42, "paiName": "二筒", "paiCode": "2p", "paiNo": 2, "paiType": 1 },
        { "No": 43, "paiName": "二筒", "paiCode": "2p", "paiNo": 2, "paiType": 1 },
        { "No": 44, "paiName": "三筒", "paiCode": "3p", "paiNo": 3, "paiType": 1 },
        { "No": 45, "paiName": "三筒", "paiCode": "3p", "paiNo": 3, "paiType": 1 },
        { "No": 46, "paiName": "三筒", "paiCode": "3p", "paiNo": 3, "paiType": 1 },
        { "No": 47, "paiName": "三筒", "paiCode": "3p", "paiNo": 3, "paiType": 1 },
        { "No": 48, "paiName": "四筒", "paiCode": "4p", "paiNo": 4, "paiType": 1 },
        { "No": 49, "paiName": "四筒", "paiCode": "4p", "paiNo": 4, "paiType": 1 },
        { "No": 50, "paiName": "四筒", "paiCode": "4p", "paiNo": 4, "paiType": 1 },
        { "No": 51, "paiName": "四筒", "paiCode": "4p", "paiNo": 4, "paiType": 1 },
        { "No": 52, "paiName":"赤五筒","paiCode": "0p", "paiNo": 0, "paiType": 1 },
        { "No": 53, "paiName": "五筒", "paiCode": "5p", "paiNo": 5, "paiType": 1 },
        { "No": 54, "paiName": "五筒", "paiCode": "5p", "paiNo": 5, "paiType": 1 },
        { "No": 55, "paiName": "五筒", "paiCode": "5p", "paiNo": 5, "paiType": 1 },
        { "No": 56, "paiName": "六筒", "paiCode": "6p", "paiNo": 6, "paiType": 1 },
        { "No": 57, "paiName": "六筒", "paiCode": "6p", "paiNo": 6, "paiType": 1 },
        { "No": 58, "paiName": "六筒", "paiCode": "6p", "paiNo": 6, "paiType": 1 },
        { "No": 59, "paiName": "六筒", "paiCode": "6p", "paiNo": 6, "paiType": 1 },
        { "No": 60, "paiName": "七筒", "paiCode": "7p", "paiNo": 7, "paiType": 1 },
        { "No": 61, "paiName": "七筒", "paiCode": "7p", "paiNo": 7, "paiType": 1 },
        { "No": 62, "paiName": "七筒", "paiCode": "7p", "paiNo": 7, "paiType": 1 },
        { "No": 63, "paiName": "七筒", "paiCode": "7p", "paiNo": 7, "paiType": 1 },
        { "No": 64, "paiName": "八筒", "paiCode": "8p", "paiNo": 8, "paiType": 1 },
        { "No": 65, "paiName": "八筒", "paiCode": "8p", "paiNo": 8, "paiType": 1 },
        { "No": 66, "paiName": "八筒", "paiCode": "8p", "paiNo": 8, "paiType": 1 },
        { "No": 67, "paiName": "八筒", "paiCode": "8p", "paiNo": 8, "paiType": 1 },
        { "No": 68, "paiName": "九筒", "paiCode": "9p", "paiNo": 9, "paiType": 1 },
        { "No": 69, "paiName": "九筒", "paiCode": "9p", "paiNo": 9, "paiType": 1 },
        { "No": 70, "paiName": "九筒", "paiCode": "9p", "paiNo": 9, "paiType": 1 },
        { "No": 71, "paiName": "九筒", "paiCode": "9p", "paiNo": 9, "paiType": 1 },

        { "No": 72, "paiName": "一索", "paiCode": "1s", "paiNo": 1, "paiType": 2 },
        { "No": 73, "paiName": "一索", "paiCode": "1s", "paiNo": 1, "paiType": 2 },
        { "No": 74, "paiName": "一索", "paiCode": "1s", "paiNo": 1, "paiType": 2 },
        { "No": 75, "paiName": "一索", "paiCode": "1s", "paiNo": 1, "paiType": 2 },
        { "No": 76, "paiName": "二索", "paiCode": "2s", "paiNo": 2, "paiType": 2 },
        { "No": 77, "paiName": "二索", "paiCode": "2s", "paiNo": 2, "paiType": 2 },
        { "No": 78, "paiName": "二索", "paiCode": "2s", "paiNo": 2, "paiType": 2 },
        { "No": 79, "paiName": "二索", "paiCode": "2s", "paiNo": 2, "paiType": 2 },
        { "No": 80, "paiName": "三索", "paiCode": "3s", "paiNo": 3, "paiType": 2 },
        { "No": 81, "paiName": "三索", "paiCode": "3s", "paiNo": 3, "paiType": 2 },
        { "No": 82, "paiName": "三索", "paiCode": "3s", "paiNo": 3, "paiType": 2 },
        { "No": 83, "paiName": "三索", "paiCode": "3s", "paiNo": 3, "paiType": 2 },
        { "No": 84, "paiName": "四索", "paiCode": "4s", "paiNo": 4, "paiType": 2 },
        { "No": 85, "paiName": "四索", "paiCode": "4s", "paiNo": 4, "paiType": 2 },
        { "No": 86, "paiName": "四索", "paiCode": "4s", "paiNo": 4, "paiType": 2 },
        { "No": 87, "paiName": "四索", "paiCode": "4s", "paiNo": 4, "paiType": 2 },
        { "No": 88, "paiName":"赤五索","paiCode": "0s", "paiNo": 0, "paiType": 2 },
        { "No": 89, "paiName": "五索", "paiCode": "5s", "paiNo": 5, "paiType": 2 },
        { "No": 90, "paiName": "五索", "paiCode": "5s", "paiNo": 5, "paiType": 2 },
        { "No": 91, "paiName": "五索", "paiCode": "5s", "paiNo": 5, "paiType": 2 },
        { "No": 92, "paiName": "六索", "paiCode": "6s", "paiNo": 6, "paiType": 2 },
        { "No": 93, "paiName": "六索", "paiCode": "6s", "paiNo": 6, "paiType": 2 },
        { "No": 94, "paiName": "六索", "paiCode": "6s", "paiNo": 6, "paiType": 2 },
        { "No": 95, "paiName": "六索", "paiCode": "6s", "paiNo": 6, "paiType": 2 },
        { "No": 96, "paiName": "七索", "paiCode": "7s", "paiNo": 7, "paiType": 2 },
        { "No": 97, "paiName": "七索", "paiCode": "7s", "paiNo": 7, "paiType": 2 },
        { "No": 98, "paiName": "七索", "paiCode": "7s", "paiNo": 7, "paiType": 2 },
        { "No": 99, "paiName": "七索", "paiCode": "7s", "paiNo": 7, "paiType": 2 },
        { "No": 100,"paiName": "八索", "paiCode": "8s", "paiNo": 8, "paiType": 2 },
        { "No": 101,"paiName": "八索", "paiCode": "8s", "paiNo": 8, "paiType": 2 },
        { "No": 102,"paiName": "八索", "paiCode": "8s", "paiNo": 8, "paiType": 2 },
        { "No": 103,"paiName": "八索", "paiCode": "8s", "paiNo": 8, "paiType": 2 },
        { "No": 104,"paiName": "九索", "paiCode": "9s", "paiNo": 9, "paiType": 2 },
        { "No": 105,"paiName": "九索", "paiCode": "9s", "paiNo": 9, "paiType": 2 },
        { "No": 106,"paiName": "九索", "paiCode": "9s", "paiNo": 9, "paiType": 2 },
        { "No": 107,"paiName": "九索", "paiCode": "9s", "paiNo": 9, "paiType": 2 },

        { "No": 108, "paiName": "東", "paiCode": "1z", "paiNo": 1, "paiType": 3 },
        { "No": 109, "paiName": "東", "paiCode": "1z", "paiNo": 1, "paiType": 3 },
        { "No": 110, "paiName": "東", "paiCode": "1z", "paiNo": 1, "paiType": 3 },
        { "No": 111, "paiName": "東", "paiCode": "1z", "paiNo": 1, "paiType": 3 },
        { "No": 112, "paiName": "南", "paiCode": "2z", "paiNo": 2, "paiType": 3 },
        { "No": 113, "paiName": "南", "paiCode": "2z", "paiNo": 2, "paiType": 3 },
        { "No": 114, "paiName": "南", "paiCode": "2z", "paiNo": 2, "paiType": 3 },
        { "No": 115, "paiName": "南", "paiCode": "2z", "paiNo": 2, "paiType": 3 },
        { "No": 116, "paiName": "西", "paiCode": "3z", "paiNo": 3, "paiType": 3 },
        { "No": 117, "paiName": "西", "paiCode": "3z", "paiNo": 3, "paiType": 3 },
        { "No": 118, "paiName": "西", "paiCode": "3z", "paiNo": 3, "paiType": 3 },
        { "No": 119, "paiName": "西", "paiCode": "3z", "paiNo": 3, "paiType": 3 },
        { "No": 120, "paiName": "北", "paiCode": "4z", "paiNo": 4, "paiType": 3 },
        { "No": 121, "paiName": "北", "paiCode": "4z", "paiNo": 4, "paiType": 3 },
        { "No": 122, "paiName": "北", "paiCode": "4z", "paiNo": 4, "paiType": 3 },
        { "No": 123, "paiName": "北", "paiCode": "4z", "paiNo": 4, "paiType": 3 },
        { "No": 124, "paiName": "白", "paiCode": "5z", "paiNo": 5, "paiType": 3 },
        { "No": 125, "paiName": "白", "paiCode": "5z", "paiNo": 5, "paiType": 3 },
        { "No": 126, "paiName": "白", "paiCode": "5z", "paiNo": 5, "paiType": 3 },
        { "No": 127, "paiName": "白", "paiCode": "5z", "paiNo": 5, "paiType": 3 },
        { "No": 128, "paiName": "發", "paiCode": "6z", "paiNo": 6, "paiType": 3 },
        { "No": 129, "paiName": "發", "paiCode": "6z", "paiNo": 6, "paiType": 3 },
        { "No": 130, "paiName": "發", "paiCode": "6z", "paiNo": 6, "paiType": 3 },
        { "No": 131, "paiName": "發", "paiCode": "6z", "paiNo": 6, "paiType": 3 },
        { "No": 132, "paiName": "中", "paiCode": "7z", "paiNo": 7, "paiType": 3 },
        { "No": 133, "paiName": "中", "paiCode": "7z", "paiNo": 7, "paiType": 3 },
        { "No": 134, "paiName": "中", "paiCode": "7z", "paiNo": 7, "paiType": 3 },
        { "No": 135, "paiName": "中", "paiCode": "7z", "paiNo": 7, "paiType": 3 }
    ];
    return hoge;
}

function paiImg() {
    var hoge = [
        [
            { "No": 0, "paiName": "赤五萬", "src": "0m.png", "text": "0m" },
            { "No": 1, "paiName": "一萬", "src": "1m.png", "text": "1m" },
            { "No": 2, "paiName": "二萬", "src": "2m.png", "text": "2m" },
            { "No": 3, "paiName": "三萬", "src": "3m.png", "text": "3m" },
            { "No": 4, "paiName": "四萬", "src": "4m.png", "text": "4m" },
            { "No": 5, "paiName": "五萬", "src": "5m.png", "text": "5m" },
            { "No": 6, "paiName": "六萬", "src": "6m.png", "text": "6m" },
            { "No": 7, "paiName": "七萬", "src": "7m.png", "text": "7m" },
            { "No": 8, "paiName": "八萬", "src": "8m.png", "text": "8m" },
            { "No": 9, "paiName": "九萬", "src": "9m.png", "text": "9m" },
        ],
        [
            { "No": 0, "paiName": "赤五筒", "src": "0p.png", "text": "0p" },
            { "No": 1, "paiName": "一筒", "src": "1p.png", "text": "1p" },
            { "No": 2, "paiName": "二筒", "src": "2p.png", "text": "2p" },
            { "No": 3, "paiName": "三筒", "src": "3p.png", "text": "3p" },
            { "No": 4, "paiName": "四筒", "src": "4p.png", "text": "4p" },
            { "No": 5, "paiName": "五筒", "src": "5p.png", "text": "5p" },
            { "No": 6, "paiName": "六筒", "src": "6p.png", "text": "6p" },
            { "No": 7, "paiName": "七筒", "src": "7p.png", "text": "7p" },
            { "No": 8, "paiName": "八筒", "src": "8p.png", "text": "8p" },
            { "No": 9, "paiName": "九筒", "src": "9p.png", "text": "9p" },
        ],
        [
            { "No": 0, "paiName": "赤五索", "src": "0s.png", "text": "0s" },
            { "No": 1, "paiName": "一索", "src": "1s.png", "text": "1s" },
            { "No": 2, "paiName": "二索", "src": "2s.png", "text": "2s" },
            { "No": 3, "paiName": "三索", "src": "3s.png", "text": "3s" },
            { "No": 4, "paiName": "四索", "src": "4s.png", "text": "4s" },
            { "No": 5, "paiName": "五索", "src": "5s.png", "text": "5s" },
            { "No": 6, "paiName": "六索", "src": "6s.png", "text": "6s" },
            { "No": 7, "paiName": "七索", "src": "7s.png", "text": "7s" },
            { "No": 8, "paiName": "八索", "src": "8s.png", "text": "8s" },
            { "No": 9, "paiName": "九索", "src": "9s.png", "text": "9s" },
        ],
        [
            { "No": 0, "paiName": "裏", "src": "0z.png", "text": "0z" },
            { "No": 1, "paiName": "東", "src": "1z.png", "text": "1z" },
            { "No": 2, "paiName": "南", "src": "2z.png", "text": "2z" },
            { "No": 3, "paiName": "西", "src": "3z.png", "text": "3z" },
            { "No": 4, "paiName": "北", "src": "4z.png", "text": "4z" },
            { "No": 5, "paiName": "白", "src": "5z.png", "text": "5z" },
            { "No": 6, "paiName": "發", "src": "6z.png", "text": "6z" },
            { "No": 7, "paiName": "中", "src": "7z.png", "text": "7z" }
        ]
    ];
    return hoge;
}

function yukoupai_table() {
    var hoge = {
        "12m": [3], "12p": [3], "12s": [3],
        "23m": [1, 4], "23p": [1, 4], "23s": [1, 4],
        "34m": [2, 5], "34p": [2, 5], "34s": [2, 5],
        "45m": [3, 6], "45p": [3, 6], "45s": [3, 6],
        "56m": [4, 7], "56p": [4, 7], "56s": [4, 7],
        "67m": [5, 8], "67p": [5, 8], "67s": [5, 8],
        "78m": [6, 9], "78p": [6, 9], "78s": [6, 9],
        "89m": [7], "89p": [7], "89s": [7],
        "13m": [2], "13p": [2], "13s": [2],
        "24m": [3], "24p": [3], "24s": [3],
        "35m": [4], "35p": [4], "35s": [4],
        "46m": [5], "46p": [5], "46s": [5],
        "57m": [6], "57p": [6], "57s": [6],
        "68m": [7], "68p": [7], "68s": [7],
        "79m": [8], "79p": [8], "79s": [8],
        "11m": [1], "11p": [1], "11s": [1], "11z": [1],
        "22m": [2], "22p": [2], "22s": [2], "22z": [2],
        "33m": [3], "33p": [3], "33s": [3], "33z": [3],
        "44m": [4], "44p": [4], "44s": [4], "44z": [4],
        "55m": [5], "55p": [5], "55s": [5], "55z": [5],
        "66m": [6], "66p": [6], "66s": [6], "66z": [6],
        "77m": [7], "77p": [7], "77s": [7], "77z": [7],
        "88m": [8], "88p": [8], "88s": [8],
        "99m": [9], "99p": [9], "99s": [9],
        // くっつき受入の孤立牌
        "-1m": [1, 2, 3],
        "-2m": [1, 2, 3, 4],
        "-3m": [1, 2, 3, 4, 5],
        "-4m": [2, 3, 4, 5, 6],
        "-5m": [3, 4, 5, 6, 7],
        "-6m": [4, 5, 6, 7, 8],
        "-7m": [5, 6, 7, 8, 9],
        "-8m": [6, 7, 8, 9],
        "-9m": [7, 8, 9],
        "-1p": [1, 2, 3],
        "-2p": [1, 2, 3, 4],
        "-3p": [1, 2, 3, 4, 5],
        "-4p": [2, 3, 4, 5, 6],
        "-5p": [3, 4, 5, 6, 7],
        "-6p": [4, 5, 6, 7, 8],
        "-7p": [5, 6, 7, 8, 9],
        "-8p": [6, 7, 8, 9],
        "-9p": [7, 8, 9],
        "-1s": [1, 2, 3],
        "-2s": [1, 2, 3, 4],
        "-3s": [1, 2, 3, 4, 5],
        "-4s": [2, 3, 4, 5, 6],
        "-5s": [3, 4, 5, 6, 7],
        "-6s": [4, 5, 6, 7, 8],
        "-7s": [5, 6, 7, 8, 9],
        "-8s": [6, 7, 8, 9],
        "-9s": [7, 8, 9],
        "-1z": [1],
        "-2z": [2],
        "-3z": [3],
        "-4z": [4],
        "-5z": [5],
        "-6z": [6],
        "-7z": [7],
        // 対子受入の孤立牌
        "+1m": [1],
        "+2m": [2],
        "+3m": [3],
        "+4m": [4],
        "+5m": [5],
        "+6m": [6],
        "+7m": [7],
        "+8m": [8],
        "+9m": [9],
        "+1p": [1],
        "+2p": [2],
        "+3p": [3],
        "+4p": [4],
        "+5p": [5],
        "+6p": [6],
        "+7p": [7],
        "+8p": [8],
        "+9p": [9],
        "+1s": [1],
        "+2s": [2],
        "+3s": [3],
        "+4s": [4],
        "+5s": [5],
        "+6s": [6],
        "+7s": [7],
        "+8s": [8],
        "+9s": [9],
        "+1z": [1],
        "+2z": [2],
        "+3z": [3],
        "+4z": [4],
        "+5z": [5],
        "+6z": [6],
        "+7z": [7]
    };
    return hoge;
}

// function nakitatu_table() {
//     var hoge = {
//         "1": [[2, 3]],
//         "2": [[1, 3], [3, 4]],
//         "3": [[1, 2], [2, 4], [4, 5]],
//         "4": [[2, 3], [3, 5], [5, 6]],
//         "0": [[3, 4], [4, 6], [6, 7]],
//         "5": [[3, 4], [4, 6], [6, 7]],
//         "6": [[4, 5], [5, 7], [7, 8]],
//         "7": [[5, 6], [6, 8], [8, 9]],
//         "8": [[7, 9], [6, 7]],
//         "9": [[7, 8]]
//     }
//     return hoge;
// }

//============================================================================
//HTML：テキストで雑に並べる
//============================================================================
function settingHtml() {
    var hoge = [
        [
            ["ゲームタイプ"],
            ["<label for='gametype0'><input type='radio' id='gametype0' name='gametype' value='0'> 四麻</label><label for='gametype1'><input type='radio' id='gametype1' name='gametype' value='1'> 三麻</label>"],
        ],
        [
            ["以下を有効牌に含める"],
            ["<label for='kind0'><input type='checkbox' id='kind0' name='kind0'> 一般形</label><label for='kind1'><input type='checkbox' id='kind1' name='kind1'> 七対子</label><label for='kind2'><input type='checkbox' id='kind2' name='kind2'> 国士無双</label>"],
        ],
        [
            ["手牌の自動理牌"],
            ["<label for='ripai0'><input type='radio' id='ripai0' name='ripai' value='0'> する</label><label for='ripai1'><input type='radio' id='ripai1' name='ripai' value='1'> しない</label>"],
        ]

        // [
        //     ["有効牌一覧"],
        //     ["<label for='yukodisp1'><input type='radio' id='yukodisp1' name='yukodisp' value='1'> 表示する</label><label for='yukodisp0'><input type='radio' id='yukodisp0' name='yukodisp' value='0'> 表示しない</label>"],
        // ],
        // ["　<span class='settingname'>鳴きを考慮</span><br><br>"],
        // ["　　<label for='nakidisp1'><input type='radio' id='nakidisp1' name='nakidisp' value='1'> する</label>　　"],
        // ["<label for='nakidisp0'><input type='radio' id='nakidisp0' name='nakidisp' value='0'> しない</label>"],
        // ["<br><br>"],
        // ["　<span class='settingname2'>以下を鳴く牌に含める</span><br>"],
        // ["　　<label for='nakikind0' name='nakikind0'><input type='checkbox' id='nakikind0' name='nakikind0'> 萬子牌</label>　"],
        // ["<label for='nakikind1' name='nakikind1'><input type='checkbox' id='nakikind1' name='nakikind1'> 筒子牌</label>　"],
        // ["<label for='nakikind2' name='nakikind2'><input type='checkbox' id='nakikind2' name='nakikind2'> 索子牌</label><br>"],
        // ["　　<label for='nakikind3' name='nakikind3'><input type='checkbox' id='nakikind3' name='nakikind3'> 字牌</label>　"],
        // ["<label for='nakikind4' name='nakikind4'><input type='checkbox' id='nakikind4' name='nakikind4'> 2～8牌</label>　"],
        // ["<label for='nakikind5' name='nakikind5'><input type='checkbox' id='nakikind5' name='nakikind5'> 1,9牌</label>　"],
        // ["<div class='hr'></div>"],

        // ["　<span class='settingname'>受入良化牌</span> <span class='settingname2'>※処理重め</span><br><br>"],
        // ["　　<label for='ryokedisp1'><input type='radio' id='ryokedisp1' name='ryokedisp' value='1'> 表示する</label>　　"],
        // ["<label for='ryokedisp0'><input type='radio' id='ryokedisp0' name='ryokedisp' value='0'> 表示しない</label>"],
        // ["<br><br>"],
        // ["　<span class='settingname2'>全ての牌で受入良化をチェック </span><br>"],
        // ["　　<label for='pindisp1'><input type='radio' id='pindisp1' name='pindisp' value='1'> する</label>　　"],
        // ["<label for='pindisp0'><input type='radio' id='pindisp0' name='pindisp' value='0'> しない</label>"],
        // ["<br><br>"],
        // ["　<span class='settingname2'>有効牌と受入良化牌の表示順</span><br>"],
        // ["　　<label for='order1'><input type='radio' id='order1' name='order' value='1'> 分ける</label>　　　"],
        // ["<label for='order0'><input type='radio' id='order0' name='order' value='0'> 混ぜる</label>"],
        // ["<div class='hr'></div>"],
    ];
    return hoge;
}

function infoHtml() {
    var hoge = [
        [
            ["牌理ツールとは？"],
            [`
                <br>
                <p>
                    ――麻雀の打ち方を大体覚え、初心者の域は超えた。<br>
                    もっとあがれるようになりたい！と調べ始めたあなた。<br>
                    深い深い麻雀の沼へようこそ。<br>
                </p>
                <br>
                <p>
                    突然ですがこんな贅沢な手牌があったとします。何を切りますか？<br>
                    45567m556778p23s　ツモ9m<br>
                </p>
                <br>
                <p>
                    手拍子に9m切ると思ったあなた。打9mより打7pの方が受け入れが4枚多いことにお気づきですか？<br>
                    (点棒状況や一盃口、断么九も考えたら9m打でしょという方は真面目に読んでないでさっさと使ってください)<br>
                </p>
                <br>
                <p>
                    こんな辺鄙なところを訪れたあなたは既に知っているかもしれませんが、<br>
                    これが早くあがるために必要な「牌効率」です。<br>
                    牌理ツールとはこの早くあがるために必要な「牌効率」をより深く勉強できる補助ツールです。<br>
                </p>
                <br>
                <p>
                    実際に入力してみると以下のように表示されます。<br>
                    打7p　有効牌：5種19枚<br>
                    打9m　有効牌：4種15枚<br>
                    打5m　有効牌：3種12枚<br>
                    この1つ1つ枚数を間違えないように数えて比べる手間を一瞬で調べてくれるというわけです。<br>
                </p>
                <br>
                <p>
                    牌理ツールは他のサイトにも何個か既にありますが、当ツールは使いやすさを重視して作成していますので是非をご活用ください。<br>
                </p>
                <br>
            `]
        ],
        [
            ["使い方～手牌の作成方法～"],
            [`
                <br>
                <p>
                    このエリアで手牌の操作が可能です。<br>
                    <img src='./img/palette.png' class='infoPng'>
                </p>
                <br>
                <p>
                    <span class='settingName'>手牌を直接入力</span><br>
                    牌画像をタップすると、手牌に牌を追加できます。<br>
                    ゲームタイプを三麻にしているとマンズの2～8mはタップ不可能になります。<br>
                    赤牌は各種類1つまで手牌に含められます。<br>
                    <br>
                    手牌の牌画像をタップすると、手牌から削除することができます。
                </p>
                <br>
                <p>
                    <span class='settingName'>手牌をテキストで入力</span><br>
                    マンズ = m、ピンズ = p、ソーズ = s、字牌 = z<br>
                    として手牌をテキスト化したものが表示がされます。<br>
                    逆にテキストを入力して手牌を表示することも可能です。<br>
                    ※手牌画像はテキスト確定時に反映されます。<br>
                </p>
                <br>
                <p>
                    <span class='settingName'>手牌をランダムで作成</span><br>
                    [作成]ボタンをタップすると手牌がランダムで作成されます。<br>
                </p>
                <br>
                <p>
                    <span class='settingName'>現在の手牌を削除</span><br>
                    [取消]ボタンをタップすると現在の手牌を削除できます。<br>
                </p>
                <br>
            `]
        ],
        [
            ["使い方～有効牌画面～"],
            [`
                <br>
                <p>
                    手牌を入力すると自動で処理が開始され、シャンテン数と有効牌が表示されます。<br>
                    <img src='./img/mainArea.png' class='infoPng'>
                </p>
                <br>
                <p>
                    <span class='settingName'>シャンテン数について</span><br>
                    七対子、国士無双、それ以外の一般形の3種類のシャンテン数が表示されます。<br>
                    「-」と表示されている場合は、設定や手牌の枚数をご確認ください。<br>
                </p>
                <br>
                <p>
                    <span class='settingName'>有効牌について</span><br>
                    牌をツモった時、<span class='bline'>シャンテン数が進む牌だった時の枚数</span>が有効牌となっています。<br>
                    表示枚数は手牌で使用されている分は引かれています。<br>
                    赤牌は有効牌として表示されません。<br>
                    表示優先順は一番上から「<span class='bline'>有効牌枚数＞有効牌種数</span>」となっています。<br>
                    <br>
                    打牌の牌画像をタップすると、<span class='bline'>その牌を打牌してランダムで牌をツモ</span>ることができます。<br>
                    有効牌の牌画像をタップすると、<span class='bline'>打牌をしつつタップした牌をツモ</span>ることができます。<br>
                    <br>
                    手牌が0枚、3枚、6枚、9枚、12枚の時は処理されません。<br>
                    手牌が1枚、4枚、7枚、10枚、13枚は現在の手牌で有効牌が表示されます。<br>
                    手牌が2枚、5枚、8枚、11枚、14枚はシャンテン数が変わらない打牌ごとに有効牌を表示しています。<br>
                    <br>
                    ※注意<br>
                    ツモ牌は「<span class='bline attention'>手牌で4枚使用していない牌全てを均等確率でツモる</span>」仕組みとなっています。<br>
                    そのため1枚も所持していない牌と暗刻の牌は同じ確率でツモります。<br>
                    また理論上5連続で同じ牌をツモることも起こりえます。<br>
                    あくまで有効牌の枚数するための補助機能になりますのでご了承ください。<br>
                </p>
                <br>
                <p>
                    <span class='settingName'>手牌履歴について</span><br>
                    <img src='./img/history.png' class='infoPng'>
                    <br>
                    手牌を1回処理するごとに、処理した履歴が保存されます。<br>
                    保存件数は最大20件です。それ以上は古いものから削除されます。<br>
                    <br>
                    過去に処理した手牌を表示中に、新しく牌を追加などをして処理が実行されると、<br>
                    <span class='bline'>それ以降の新しい履歴は全て破棄</span>されますのでご注意ください<br>
                    ※ブラウザの戻る・進むボタンの挙動と同じと思っていただければ問題ありません。<br>
                </p>
                <br>
            `],
        ],
        [
            ["使い方～編集ウィンドウ～"],
            [`
                <br>
                <p>
                    表示や処理方法を変更できます。<br>
                    <img src='./img/setting.png' class='infoPng'><br>
                </p>
                <br>
                <p>
                    <span class='settingName'>ゲームタイプ</span><br>
                    四麻(四人打ち)、三麻(三人打ち)で使用牌を調整できます。<br>
                    三麻にするとのマンズの2～8牌が使用できなくなります。有効牌も対象外となります。<br>
                </p>
                <br>
                <p>
                    <span class='settingName'>以下を有効牌に含める</span><br>
                    一般形、七対子、国士無双を有効牌に含めるかを設定できます。<br>
                    鳴き手牌では七対子、国士無双をチェックしていても処理されません。<br>
                    全てチェックを外すと何も処理されなくなります。<br>
                </p>
                <br>
                <p>
                    <span class='settingName'>手牌の自動理牌</span><br>
                    手牌の並び順をツモ牌を除き、左から順に「マンズ＞ピンズ＞ソーズ＞字牌」と並びかえます。<br>
                    有効牌表示や打牌への影響はありません。<br>
                    自動理牌しない状態では自分で手牌の牌の位置を入れ替えることができます。<br>
                </p>
                <br>
            `]
        ],
        [
            ["使用するにあたって"],
            [`
                <br>
                <p>
                    この二次箱牌理ツール(以下「当ツール」とする)はREDが開発しています。
                </p>
                <br>
                <p>
                    <span class='settingName'>cookieの同意</span><br>
                    当サイト下ではcookieの同意を導入しており、当牌理ツールもcookieを使用しております。<br>
                    同意をしなくても使用自体は可能です。<br>
                    <br>
                    同意をした場合は編集画面の設定状態を保存することが出来ます。<br>
                    なおgoogleAnalyticsにアクセスログが収集されるため、どのくらいの人が利用しているか、<br>
                    どのような端末で利用されているかで今後開発する際の参考資料となりモチベに直結します。<br>
                </p>
                <br>
                <p>
                    <span class='settingName'>その他注意事項</span><br>
                    勝手な自作発言、当ツールの複製や譲渡、貸出、配布、<br>
                    また販売などの金銭を含むやりとりは禁止です。<br>
                    万が一公開停止を余儀なくされた場合は予告なく削除しますのでご了承ください。<br>
                </p>
                <br>
                <p>
                    当ツールを使用した動画や画像などを動画配信サービスやSNS、ブログに使用する際、<br>
                    特に許可は取らずに使用していただいて構いません。<br>
                    「#二次箱牌理ツール」とかつけていただけるとエゴサが捗ります。<br>
                </p>
                <br>
                <p>
                    もしこういう機能が欲しい！などがあれば実装予定リストに追加致しますので、<br>
                    二次元ゲイム箱庭諸島のdiscordやREDの𝕏アカウントへお気軽にご連絡ください。<br>
                </p>
                <br>
            `]
        ],
        [
            ["リンク"],
            [`
                <br>
                <p>
                    <a href='../privacy-policy.html' target='_blank'>プライバシーポリシー</a><br>
                    お固いやつですが重要なものです。私もよく読まなかったりしますが、可能であればご一読ください。<br>
                </p>
                <br>
                <p>
                    <a href='https://hako2d-mj.xii.jp/' target='_blank'>二次元ゲイム箱庭諸島</a><br>
                    当管理人が運営している大元の個人サイトです。<br>
                    箱庭諸島(cgiゲーム)はbotなし、また長期から短期開催まで幅広く運営しておりますので興味のある方はぜひご参加ください。<br>
                    興味のない方はこの機会に興味を持ってください。<br>
                    地道に育成をしたり放置ゲーが好きという方は特におすすめできます。<br>
                </p>
                <br>
                <p>
                    <a href='https://twitter.com/2jigenfbi0' target='_blank'>developed by RED</a><br>
                    当ツール作成者の𝕏です。<br>
                    不具合報告などは二次元ゲイム箱庭諸島内のdiscord、またはこの𝕏アカウントにメンションなどをしてご報告ください。<br>
                    ちなみに作成者をフォローするとあなたのフォロワー数を1増やすことができます。<br>
                </p>
                <br>
                <p>
                    <a href='https://naga.dmv.nico/naga_report/top/' target='_blank'>麻雀AI「NAGA」</a><br>
                    NAGAという麻雀AIを利用できる有料サービスです。<br>
                    天鳳特上卓十段を達成した実力で、天鳳のみサポート(カスタム牌譜なら実質他の麻雀サービスでも可)しています。<br>
                    様々な打牌タイプのNAGAが牌譜検討してくれ、自分にあったタイプを見つけることもできます。<br>
                    天鳳の個室にNAGAを呼び出して実際に対局したりすることも可能です。<br>
                </p>
                <br>
                <p>
                    <a href='https://mjai.ekyu.moe/ja.html' target='_blank'>Mahjong AI Utilities</a><br>
                    Mortalという麻雀AIが牌譜検討をしてくれるツールです。<br>
                    四麻半荘の段位戦ルール限定、UIも若干不便ではありますが、無料と思えない高レベルです。<br>
                    天鳳の牌譜がベースとなっていますが、雀魂、麻雀一番街、姫麻雀の牌譜でも自動で読み込むことがかのうです。<br>
                    天鳳の個室にMortalを呼び出して実際に対局したりすることも可能です。<br>
                </p>
                <br>
            `]
        ],
        [
            ["履歴"],
            [`
                <br>
                <p>
                    2020/06/29　思い立って着手開始<br>
                </p>
                <br>
                <p>
                    2020/07/20　v1.0.0公開<br>
                </p>
                <br>
                <p>
                    2021/01/23　v1.0.1公開<br>
                    ・タブにタイトル名がなかったので追加<br>
                    ・良形変化→受入良化に表記を変更<br>
                    ・ツイート時の手牌表示を厳密化(0mは赤5m、0zは東など)<br>
                    ・ツイート条件をツモ牌があるときのみに変更、あわせてツモ表示追加<br>
                </p>
                <br>
                <p>
                    2021/02/07　v1.1.0公開<br>
                    ・牌理処理を全体的に見直し<br>
                    ・三麻ルールに対応<br>
                    ・戻る・進むボタン追加<br>
                    ・チー・ポン可能な場合の実質受入枚数追加<br>
                    ・その他細かい調整<br>
                </p>
                <br>
                <p>
                    2021/04/22　v1.1.2公開<br>
                    ・鳴き考慮中に戻る進むボタンを押した際の表示不具合を修正<br>
                </p>
                <br>
                <p>
                    2022/03/19　v1.1.3公開<br>
                    ・cookieの同意ポップアップ追加<br>
                    ・(cookieを使用する場合)ページを開き直しても設定画面の内容が保持されるよう調整<br>
                    ・リンクサイトを拡充<br>
                </p>
                <br>
                <p>
                    2022/04/19　v1.1.4公開<br>
                    ・cookieを使用している際に一部設定の呼び出しが出来ていなかったのを修正<br>
                    ・手牌指定したURLから遷移した時、理牌しないだと処理出来なかったのを修正<br>
                </p>
                <br>
                <p>
                    2024/05/05　v1.2.0公開<br>
                    ・管理コスト削減のため一から作り直し<br>
                    ・受入良化牌、実質受入枚数(鳴きを考慮)の機能を削除<br>
                    ・URLに手牌パラメータを含めて遷移出来る機能を削除<br>
                    ・「ツイートする」ボタン削除<br>
                </p>
                <br>
            `]
        ],
    ];

    return hoge;
}