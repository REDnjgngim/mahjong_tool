'use strict';

//アガリ判定とシャンテン数を返す関数
function pairiCheck2(tablelist, ms, pais, pT, pN) {
    var kokusi = 13, seventoitu = 8, nakimentu = 0;
    var tempTehai = JSON.parse(JSON.stringify(tehai));//tehai配列のバックアップを取る
    if (pais < 13) nakimentu = Kanzen_nakimentu(tempTehai);
    var countsets = {
        "kanzen_shuntu": 0,
        "kanzen_kotu": 0,
        "kantu": 0,
        "shuntu": 0,
        "kotu": 0,
        "head": 0,
        "normal": 8, // 未使用
        "naki": nakimentu,
        "minsyanten": ms,
        // yはyukouhaiのy!! 有効牌算出用
        "ynormal": [],
        "ykokusi": { "head": 0 }
    };
    moveReddora(tempTehai);
    if (pais >= 13) { // 門前手
        // 国士無双の向聴数
        if (settings.kind2) kokusi = ykokusimuso_SyantenCheck(tempTehai, countsets);
        // チートイツの向聴数
        if (settings.kind1) seventoitu = yseventoitu_SyantenCheck(tempTehai, countsets);
    }
    // 一般手の向聴数
    if (settings.kind0) {
        // 前もって完全なシュンツ・コーツ・孤立牌を抜いておく
        yKanzenKoutu_Koritu_KantuCheck(tempTehai, countsets); // 完全に独立したコーツを抜き出して個数を返す関数呼び出し
        if (debug2) console.log("完全刻子数:", countsets.kanzen_kotu);
        ykanzenShuntuCheck(tempTehai, countsets); // 完全に独立したシュンツを抜き出して個数を返す関数呼び出し
        if (debug2) console.log("完全順子数:", countsets.kanzen_shuntu);
        // 雀頭抜き出し→コーツ抜き出し→シュンツ抜き出し→ターツ候補抜き出し
        // 引数のindentはconsole.logで確認する階層確認用デバッグ変数
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                // ヘッドを抜いてから探索開始
                if (tempTehai[paiType][paiNo] >= 2) {
                    if (debug2) console.log("頭:", paiImg[paiType][paiNo].paiName);
                    countsets.head++;
                    tempTehai[paiType][paiNo] -= 2;
                    ymentu_cut1(tempTehai, 0, 1, countsets, "");
                    tempTehai[paiType][paiNo] += 2;
                    countsets.head--;
                }
                if (paiNo > 7 && paiType == 3) break;
            }
        }
        //【雀頭が無い場合の処理】コーツ抜き出し→シュンツ抜き出し→ターツ候補抜き出し
        if (debug2) console.log("頭: なし");
        countsets.head = 0;
        ymentu_cut1(tempTehai, 0, 1, countsets, "");
    }
    // 有効牌を確認
    if (debug2) console.log(ms == countsets.normal, ms == seventoitu, ms == kokusi, kokusi);
    if (debug2) console.log(ms, countsets.normal, seventoitu, kokusi);
    yukohai_Check(tablelist, countsets, pT, pN, pais, ms >= countsets.normal, ms >= seventoitu, ms >= kokusi);
    // 最終的な結果
    return tablelist;
}
// =================================================================
// 国士無双の向聴数を計算
function ykokusimuso_SyantenCheck(tempTehai, countsets) {
    var head = 0;
    var syanten_suu = 13;
    for (var paiType = 0; paiType < 3; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo += 8) {
            if (tempTehai[paiType][paiNo]) syanten_suu--;
            if (tempTehai[paiType][paiNo] >= 2) {
                head = -1;
                countsets.ykokusi.head = 1;
            }
        }
    }
    for (var paiNo = 1; paiNo < 8; paiNo++) {
        if (tempTehai[3][paiNo]) syanten_suu--;
        if (tempTehai[3][paiNo] >= 2) {
            head = -1;
            countsets.ykokusi.head = 1;
        }
    }
    return syanten_suu + head;
}
// =================================================================
// 七対子の向聴数を計算(向聴数と同じだけど一応)
function yseventoitu_SyantenCheck(tempTehai, countsets) {
    var type_count = 0, toitu_count = 0;
    for (var paiType = 0; paiType < 3; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (tempTehai[paiType][paiNo]) type_count++;
            if (tempTehai[paiType][paiNo] >= 2) toitu_count++;
        }
    }
    for (var paiNo = 1; paiNo < 8; paiNo++) {
        if (tempTehai[3][paiNo]) type_count++;
        if (tempTehai[3][paiNo] >= 2) toitu_count++;
    }
    // 牌の種類も対子数も7以下の時は13から両方を引く、どっちかでも足りてれば普通に6から対子数を引く
    return type_count < 7 && toitu_count < 7 ? 13 - toitu_count - type_count : 6 - toitu_count;
}
//============================================================================
//完全コーツを抜き出して個数を返す関数
function yKanzenKoutu_Koritu_KantuCheck(tempTehai, countsets) {
    // 字牌
    for (var paiNo = 1; paiNo < 8; paiNo++) {
        if (tempTehai[3][paiNo] >= 3) {
            if (tempTehai[3][paiNo] == 4) countsets.kantu = 1;
            countsets.kanzen_kotu++;
            tempTehai[3][paiNo] -= 3;
        }
    }
    // 数牌
    for (var paiType = 0; paiType < 3; paiType++) {
        // 1
        if (tempTehai[paiType][1] >= 3 &&
            !tempTehai[paiType][2] &&
            !tempTehai[paiType][3]) {
            if (tempTehai[paiType][1] == 4) countsets.kantu = 1;
            countsets.kanzen_kotu++;
            tempTehai[paiType][1] -= 3;
        }
        // 2
        if (!tempTehai[paiType][1] &&
            tempTehai[paiType][2] >= 3 &&
            !tempTehai[paiType][3] &&
            !tempTehai[paiType][4]) {
            if (tempTehai[paiType][2] == 4) countsets.kantu = 1;
            countsets.kanzen_kotu++;
            tempTehai[paiType][2] -= 3;
        }
        // 3～7
        for (var paiNo = 3; paiNo <= 7; paiNo++) {
            if (!tempTehai[paiType][paiNo - 2] &&
                !tempTehai[paiType][paiNo - 1] &&
                tempTehai[paiType][paiNo] >= 3 &&
                !tempTehai[paiType][paiNo + 1] &&
                !tempTehai[paiType][paiNo + 2]) {
                if (tempTehai[paiType][paiNo] == 4) countsets.kantu = 1;
                countsets.kanzen_kotu++;
                tempTehai[paiType][paiNo] -= 3;
            }
        }
        // 8
        if (!tempTehai[paiType][6] &&
            tempTehai[paiType][7] >= 3 &&
            !tempTehai[paiType][8] == 3 &&
            !tempTehai[paiType][9]) {
            if (tempTehai[paiType][8] == 4) countsets.kantu = 1;
            countsets.kanzen_kotu++;
            tempTehai[paiType][8] -= 3;
        }
        // 9
        if (!tempTehai[paiType][7] &&
            !tempTehai[paiType][8] &&
            tempTehai[paiType][9] >= 3) {
            if (tempTehai[paiType][9] == 4) countsets.kantu = 1;
            countsets.kanzen_kotu++;
            tempTehai[paiType][9] -= 3;
        }
    }
}
//============================================================================
//完全順子を抜き出して個数を返す関数
function ykanzenShuntuCheck(tempTehai, countsets) {
    // 全て1枚ずつある時、2枚ずつある時で抽出
    for (var paiType = 0; paiType < 3; paiType++) {
        for (var pais = 4; pais > 0; pais--) { // 有効牌を正確に出すため減らすのは1つまで
            // 123▲▲
            // [tempTehai[paiType][1], tempTehai[paiType][2], tempTehai[paiType][3]].every(value => value == pais // ES2015のみ(アロー演算子がIE11非対応)
            if (tempTehai[paiType][1] == pais &&
                tempTehai[paiType][2] == pais &&
                tempTehai[paiType][3] == pais &&
                !tempTehai[paiType][4] &&
                !tempTehai[paiType][5]) {
                tempTehai[paiType][1] -= pais;
                tempTehai[paiType][2] -= pais;
                tempTehai[paiType][3] -= pais;
                countsets.kanzen_shuntu += pais;
            }
            // ▲234▲▲
            if (!tempTehai[paiType][1] &&
                tempTehai[paiType][2] == pais &&
                tempTehai[paiType][3] == pais &&
                tempTehai[paiType][4] == pais &&
                !tempTehai[paiType][5] &&
                !tempTehai[paiType][6]) {
                tempTehai[paiType][2] -= pais;
                tempTehai[paiType][3] -= pais;
                tempTehai[paiType][4] -= pais;
                countsets.kanzen_shuntu += pais;
            }
            // ▲▲345▲▲ ▲▲456▲▲ ▲▲567▲▲
            for (var paiNo = 3; paiNo <= 5; paiNo++) {
                if (!tempTehai[paiType][paiNo - 2] &&
                    !tempTehai[paiType][paiNo - 1] &&
                    tempTehai[paiType][paiNo] == pais &&
                    tempTehai[paiType][paiNo + 1] == pais &&
                    tempTehai[paiType][paiNo + 2] == pais &&
                    !tempTehai[paiType][paiNo + 3] &&
                    !tempTehai[paiType][paiNo + 4]){
                    tempTehai[paiType][paiNo] -= pais;
                    tempTehai[paiType][paiNo + 1] -= pais;
                    tempTehai[paiType][paiNo + 2] -= pais;
                    countsets.kanzen_shuntu += pais;
                }
            }
            // ▲▲678▲
            if (!tempTehai[paiType][4] &&
                !tempTehai[paiType][5] &&
                tempTehai[paiType][6] == pais &&
                tempTehai[paiType][7] == pais &&
                tempTehai[paiType][8] == pais &&
                !tempTehai[paiType][9]) {
                tempTehai[paiType][6] -= pais;
                tempTehai[paiType][7] -= pais;
                tempTehai[paiType][8] -= pais;
                countsets.kanzen_shuntu += pais;
            }
            // ▲▲789
            if (!tempTehai[paiType][5] &&
                !tempTehai[paiType][6] &&
                tempTehai[paiType][7] == pais &&
                tempTehai[paiType][8] == pais &&
                tempTehai[paiType][9] == pais) {
                tempTehai[paiType][7] -= pais;
                tempTehai[paiType][8] -= pais;
                tempTehai[paiType][9] -= pais;
                countsets.kanzen_shuntu += pais;
            }
        }
    }
}
//============================================================================
//メンツ抜き出し1【→コーツ抜き出し→シュンツ抜き出し】
function ymentu_cut1(tempTehai, T, N, countsets, indent) {
    var tatulist = [];
    // 字牌のコーツは完全コーツ処理で抜いているの数牌だけで良い
    for (var paiType = T; paiType < 3; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット
            //コーツ抜き出し
            if (tempTehai[paiType][paiNo] >= 3) {
                if (debug2) console.log(indent + "└通常刻子:", paiImg[paiType][paiNo].paiName);
                countsets.kotu++;
                tempTehai[paiType][paiNo] -= 3;
                ymentu_cut1(tempTehai, paiType, paiNo, countsets, indent + "　");
                tempTehai[paiType][paiNo] += 3;
                countsets.kotu--;
            }
            //シュンツ抜き出し
            if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 1] && tempTehai[paiType][paiNo + 2] && paiNo < 8) {
                if (debug2) console.log(indent + "└通常順子:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo + 1].paiName, paiImg[paiType][paiNo + 2].paiName);
                countsets.shuntu++;
                tempTehai[paiType][paiNo]--;
                tempTehai[paiType][paiNo + 1]--;
                tempTehai[paiType][paiNo + 2]--;
                ymentu_cut1(tempTehai, paiType, paiNo, countsets, indent + "　");
                tempTehai[paiType][paiNo]++;
                tempTehai[paiType][paiNo + 1]++;
                tempTehai[paiType][paiNo + 2]++;
                countsets.shuntu--;
            }
        }
    }
    ytaatu_cut(tempTehai, 0, 1, 0, tatulist, countsets, "");//ターツ抜きへ
}
//============================================================================
//ターツ抜き出し
function ytaatu_cut(tempTehai, T, N, tatu, tatulist, countsets, indent) {
    var mentu = countsets.kanzen_kotu + countsets.kotu + countsets.kanzen_shuntu + countsets.shuntu + countsets.naki;
    if (debug2) console.log(indent + "　└通過", mentu + tatu, T, N)
    // メンツとターツの合計は4まで
    if (mentu + tatu < 4) {
        for (var paiType = T; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット
                // トイツ抜き出し
                if (tempTehai[paiType][paiNo] == 2) {
                    if (debug2) console.log(indent + "　└対子:", paiImg[paiType][paiNo].paiName);
                    tatu++;
                    tempTehai[paiType][paiNo] -= 2;
                    tatulist.push([paiNo, paiNo, paiType]);
                    // countsets.tatu_list.push()
                    ytaatu_cut(tempTehai, paiType, paiNo, tatu, tatulist, countsets, indent + "　");
                    tempTehai[paiType][paiNo] += 2;
                    tatu--;
                    tatulist.pop();
                }
                if (paiType == 3) continue; // 字牌は対子だけ
                // リャンメン・ペンチャン抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 1] && paiNo < 9) {
                    if (debug2) console.log(indent + "　└両面/辺張:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo + 1].paiName);
                    tatu++;
                    tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo + 1]--;
                    let paiNo2 = paiNo + 1;
                    tatulist.push([paiNo, paiNo2, paiType]);
                    ytaatu_cut(tempTehai, paiType, paiNo, tatu, tatulist, countsets, indent + "　");
                    tempTehai[paiType][paiNo]++;
                    tempTehai[paiType][paiNo + 1]++;
                    tatu--;
                    tatulist.pop();
                }
                // カンチャン抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 2] && paiNo < 8) {
                    if (debug2) console.log(indent + "　└嵌張:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo + 2].paiName);
                    tatu++;
                    tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo + 2]--;
                    let paiNo2 = paiNo + 2;
                    tatulist.push([paiNo, paiNo2, paiType]);
                    ytaatu_cut(tempTehai, paiType, paiNo, tatu, tatulist, countsets, indent + "　");
                    tempTehai[paiType][paiNo]++;
                    tempTehai[paiType][paiNo + 2]++;
                    tatu--;
                    tatulist.pop();
                }
            }
        }
    }
    // 槓子がある場合は単騎待ちが5枚目を参照している場合があるので他の孤立牌がないかチェック
    var over_head = countsets.kantu ? kantu_only_check(tempTehai) : 0;
    // 向聴数を算出
    var syanten = 8 - mentu * 2 - tatu - countsets.head + over_head;
    if (debug2) console.log(indent + "　　└向聴数:", syanten, "面子:", mentu, "塔子:", tatu, "ヘッド:", countsets.head)
    // 向聴数が同じだったら切り取ったブロックをリスト化して有効牌算出で使う
    if (syanten < countsets.normal) countsets.normal = syanten;
    if (syanten == countsets.minsyanten) {
        let lastindex = tatulist.length;
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (paiNo == 3 && paiNo > 7) continue;
                if (tempTehai[paiType][paiNo] == 1 && tempTehai[paiType][paiNo] < 4) tatulist.push(["-", paiNo, paiType]);
            }
        }
        countsets.ynormal.push(
            {
                "mentu": mentu,
                "tatu": tatu,
                "head": countsets.head,
                "list": tatulist.concat()
            }
        );
        tatulist.splice(lastindex, tatulist.length - 1); // 追加した孤立牌を削除
    }
}

// =================================================================
// 有効牌チェック
function yukohai_Check(tablelist, countsets, pT, pN, pais, normal, seventoitu, kokusi) {
    var exchange_paiType_to_txt = ["m", "p", "s", "z"];
    var dapaiobj = pN == -1 && pT == -1 ? "d03" : "d" + pN + pT;
    var imgNo = pN == -1 && pT == -1 ? "0z" : pN + exchange_paiType_to_txt[pT];
    var yuko_status = { "index": dapaiobj, "img": imgNo, "css": "" + pT + pN, "typecount": 0, "nocount": 0, "ryokelist": []}; // ソート用
    var yukohaitable = yukoupai_table();
    var yukotehai = [ // 表示に必要な有効牌フラグ
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var tempTehai = JSON.parse(JSON.stringify(tehai));
    moveReddora(tempTehai);
    // 国士無双=====================================================
    if (kokusi && pais >= 13 && settings.kind2) {
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if ((paiType < 3 && paiNo > 1 && paiNo < 9) || (paiType == 3 && paiNo > 7)) continue;
                if (!tempTehai[paiType][paiNo] && !yukotehai[paiType][paiNo]) {
                    if (4 - tempTehai[paiType][paiNo] == 0) continue; // 4枚使い切ってるのでパス
                    // 持ってなくて追加してない時
                    yukotehai[paiType][paiNo]++;
                    yuko_status.typecount++;
                    yuko_status.nocount += 4;
                } else if (tempTehai[paiType][paiNo] && !yukotehai[paiType][paiNo] && !countsets.ykokusi.head) {
                    if (4 - tempTehai[paiType][paiNo] == 0) continue; // 4枚使い切ってるのでパス
                    // 持ってるけどヘッドがない時
                    yukotehai[paiType][paiNo]++;
                    yuko_status.typecount++;
                    yuko_status.nocount += 4 - tempTehai[paiType][paiNo];
                }
            }
        }
    }
    // 七対子
    if (seventoitu && pais >= 13 && settings.kind1) {
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (tempTehai[paiType][paiNo] == 1 && !yukotehai[paiType][paiNo]) {
                    if (4 - tempTehai[paiType][paiNo] == 0) continue; // 4枚使い切ってるのでパス
                    // 持ってなくて追加してない時
                    yukotehai[paiType][paiNo]++;
                    yuko_status.typecount++;
                    yuko_status.nocount += 4 - tempTehai[paiType][paiNo];
                }
            }
        }
    }
    // 一般手
    if (debug2) console.log(countsets.ynormal);
    if (settings.kind0){
        for (var i = 0; i < countsets.ynormal.length; i++){
            // シャンテン数が進むターツの関連牌
            let blocks = 4 == countsets.ynormal[i].mentu + countsets.ynormal[i].tatu; // 足りてたらtrue
            let head = countsets.ynormal[i].head; // あったら1、なかったら0
            for (var b = 0; b < countsets.ynormal[i].list.length; b++) {
                // let [paiNo1, paiNo2, paiType] = countsets.ynormal[i].list[b]; // ES2015のみ(IE11非対応)
                let paistatus = countsets.ynormal[i].list[b];
                let yukohaiNo = yukohaitable[paistatus[0] + "" + paistatus[1]];
                for (var y = 0; y < yukohaiNo.length; y++) {
                    if (!(paistatus[0] == '-')) { // 塔子
                        if (!yukotehai[paistatus[2]][yukohaiNo[y]]) {
                            if (4 - tempTehai[paistatus[2]][yukohaiNo[y]] == 0) continue; // 4枚使い切ってるのでパス
                            // 受け入れ牌が持ってなくて追加してない時
                            yukotehai[paistatus[2]][yukohaiNo[y]]++;
                            yuko_status.typecount++;
                            yuko_status.nocount += 4 - tempTehai[paistatus[2]][yukohaiNo[y]];
                        }
                    } else { // 孤立牌
                        if ((!blocks && yukohaiNo[y] != paistatus[1] && !yukotehai[paistatus[2]][yukohaiNo[y]] && paistatus[2] < 3) ||
                            (!head && yukohaiNo[y] == paistatus[1] && !yukotehai[paistatus[2]][yukohaiNo[y]])) {
                            if (4 - tempTehai[paistatus[2]][yukohaiNo[y]] == 0) continue; // 4枚使い切ってるのでパス
                            // 受け入れ牌が持ってなくて追加してない時
                            // ターツが足りてない時は字牌以外はくっつき牌、ヘッドがない時は自身の牌を追加する
                            yukotehai[paistatus[2]][yukohaiNo[y]]++;
                            yuko_status.typecount++;
                            yuko_status.nocount += 4 - tempTehai[paistatus[2]][yukohaiNo[y]];
                        }
                    }
                }
            }
        }
    }
    // 有効牌があれば追加する
    if (yuko_status.typecount) {
        tablelist[0].push(yuko_status);
        tablelist[1][dapaiobj] = yukotehai;
    }
}