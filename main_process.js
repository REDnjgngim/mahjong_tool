'use strict';

/*
この牌理ツールはタケオしゃん氏が公開している"麻雀小粒プログラミング"を元に作成しています。
https://mahjong.org/programming/
*/

//グローバル変数==============================================================
var yama = [];//牌山の配列：136牌
var paiData = paiData();
var paiImg = paiImg();
var yukohaitable = yukoupai_table();
var nakitatutable = nakitatu_table();
// var cc = 0, cc2 = 0;
//============================================================================
// 自動理牌で表示
function tehai_sort(pTlist, pNlist) {
    var redfive = 0;
    var paiTypelist = [], paiNolist = [];
    // 一度手牌の型に収める
    var tehai = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 萬子
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 筒子
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 索子
        [0, 0, 0, 0, 0, 0, 0, 0], // 字
    ];
    for (var i = 0; i < pTlist.length; i++){
        if (pTlist[i] == 3 && pNlist[i] == 0) continue; // ダミーは入れない
        tehai[pTlist[i]][pNlist[i]]++;
    }
    // 順番に配列を作り直す
    for (var paiType = 0; paiType < 4; paiType++) {
        for (var paiNo = 0; paiNo < paiImg[paiType].length; paiNo++) {
            if (tehai[3][0]) continue; // ダミーは入れない
            // フラグが立ってたら5を入れる前に赤を入れる
            if (redfive && paiNo == 5) { // 5番目のとき最初に赤を入れる
                paiTypelist.push(paiType);
                paiNolist.push(0);
                redfive = 0;
            }
            if (!tehai[paiType][paiNo]) continue; // なければ次
            // 赤5がある時はフラグを立てて一旦保留
            if (paiNo == 0) {
                redfive++;
                continue;
            }
            // 持ってる分だけ出力
            for (var cnt = 0; cnt < tehai[paiType][paiNo]; cnt++) {
                paiTypelist.push(paiType);
                paiNolist.push(paiNo);
            }
        }
    }
    return [paiTypelist, paiNolist];
}
//============================================================================
// paiTypeとpaiNoの配列リストから牌画像を一括変換
function paiimg_Output(t, n) {
    var paiga = "";
    for (var i = 0; i < t.length; i++) {
        var pailight = !gametype3pai(t[i], n[i]) ? '' : ' shadow';
        paiga += "<img class=\"paiimg pai" + t[i] + n[i] + pailight + "\" src=\"./pie_img/" + paiImg[t[i]][n[i]].src + "\">";
    }
    return paiga;
}
// =================================================================
// 元になる牌山を生成する関数【Mersenne Twister in JavaScriptを利用】
function makePaiYama() {
    var mt = new MersenneTwister();// Mersenne­Twister オブジェクトの初期化
    var i, j, k;
    // 元になる牌山を生成
    yama = [];
    for (i = 0; i < paiData.length; i++) {
        if (gametype3pai(paiData[i].paiType, paiData[i].paiNo)) continue;
        // yama[i] = paiData[i].No;
        yama.push(paiData[i].No);
    }
    // 出来た牌山をシャッフル
    for (i = yama.length - 1; i > 0; i--) {
        j = mt.nextInt(0, yama.length - 1); // 0 以上 135 未満の乱数（整数）を発生させる
        k = yama[i]; // 変数kに退避
        yama[i] = yama[j]; // 乱数で発生した番地の牌を代入する
        yama[j] = k; // 変数Kから戻す
    }
}
//==================================================================
// 牌山からルール通りに牌を手牌に収める
function tehai_Import() {
    var dice = Rand(12); // 任意のサイコロの目
    var index;
    var paiTypelist = [], paiNolist = [];
    // 1ブロック～3ブロックまで取り出す処理
    var playerspai = settings.gametype ? 16 : 12;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 4; j++) {
            index = dice * 2 + playerspai * i + j; // 親が取り出す牌の番地
            //index = (dice*2 + 4) + playerspai * i + j; // 南家が取り出す牌の番地
            //index = (dice*2 + 8) + playerspai * i + j; // 西家が取り出す牌の番地
            //index = (dice*2 + 12) + playerspai * i + j; // 北家が取り出す牌の番地
            // tehai[paiData[yama[index]].paiType][paiData[yama[index]].paiNo]++; // tehaiに直接入れるタイプ
            paiTypelist.push(paiData[yama[index]].paiType);
            paiNolist.push(paiData[yama[index]].paiNo);
        }
    }
    // 13牌目を取り出す処理
    index = dice * 2 + playerspai * 3; // 親が取り出す13牌目の番地
    // index = dice*2 + playerspai*3 + 1; // 南家がが取り出す13牌目の番地
    // index = dice*2 + playerspai*3 + 2; // 西家がが取り出す13牌目の番地
    // index = dice*2 + playerspai*3 + 3; // 北家がが取り出す13牌目の番地
    // tehai[paiData[yama[index]].paiType][paiData[yama[index]].paiNo]++; // tehaiに直接入れるタイプ
    paiTypelist.push(paiData[yama[index]].paiType);
    paiNolist.push(paiData[yama[index]].paiNo);
    // 14牌目を取り出す処理
    index = dice * 2 + playerspai * 3 + 4; // 親が取り出す14牌目の番地
    // tehai[paiData[yama[index]].paiType][paiData[yama[index]].paiNo]++; // tehaiに直接入れるタイプ
    paiTypelist.push(paiData[yama[index]].paiType);
    paiNolist.push(paiData[yama[index]].paiNo);
    return [paiTypelist, paiNolist];
}
//============================================================================
//アガリ判定とシャンテン数を返す関数
function pairiCheck(pais, ms, pT, pN, syantenonly) {
    var tempTehai = JSON.parse(JSON.stringify(tehai)); // tehai配列のバックアップを取る
    moveReddora(tempTehai);
    var params = {
        "syanten": {
            "normal": 8,
            "kokusi": 13,
            "toitu7": 8,
            "min": ms
        },
        "block": {
            "mentu": 0,
            "shuntu": 0,
            "kotu": 0,
            "kantu": 0,
            "tatu": 0,
            "head": 0,
            "naki": 0,
        },
        "partslist": [], // {mentu, tatu, head, list[paiNo, paiNo, PaiType]},{...},{...} ...
        "kokusihead": 0
    };
    if (pais >= 13) { // 門前手
        // 国士無双と七対子の向聴数
        if (settings.kind1 || settings.kind2) kokusi_toitu7_SyantenCheck(tempTehai, params);
    } else { // 鳴き手は国士無双、七対子は計算不要
        params.block.naki = Kanzen_nakimentu(tempTehai);
    }
    // 一般手の向聴数
    if (settings.kind0) {
        // 前もって干渉しない刻子・順子を抜いておく
        KanzenMentuCheck(tempTehai, params);
        if (debug2) console.log("完全メンツ数:", params.block.mentu);
        if (debug2) console.log("鳴きメンツ:", params.block.naki);
        // 雀頭抜き出し→コーツ抜き出し→シュンツ抜き出し→ターツ候補抜き出し
        // 引数のindentはconsole.logで確認する階層確認用デバッグ変数
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (gametype3pai(paiType, paiNo)) continue;
                // ヘッドを抜いてから探索開始
                if (tempTehai[paiType][paiNo] >= 2) {
                    if (debug2) console.log("頭:", paiImg[paiType][paiNo].paiName);
                    params.block.head += 1;
                    tempTehai[paiType][paiNo] -= 2;
                    mentu_cut1(tempTehai, 0, 1, params, "");
                    tempTehai[paiType][paiNo] += 2;
                    params.block.head -= 1;
                }
                if (paiNo > 7 && paiType == 3) break;
            }
        }
        //【雀頭が無い場合の処理】コーツ抜き出し→シュンツ抜き出し→ターツ候補抜き出し
        if (debug2) console.log("頭: なし");
        params.block.head = 0;
        mentu_cut1(tempTehai, 0, 1, params, "");
    }
    // 最終的な結果
    if (!settings.kind0 && !settings.kind1) {
        // 国士無双だけの場合は受入良化ソートでエラーが出るので、国士無双の最低シャンテン数より多くする
        params.syanten.normal = 14;
        params.syanten.toitu7 = 14;
    }

    if (!syantenonly) var tablelist = yukohai_Check(params, pT, pN, ms >= params.syanten.normal, ms >= params.syanten.toitu7, ms >= params.syanten.kokusi);
    return syantenonly ? [params.syanten.normal, params.syanten.toitu7, params.syanten.kokusi] : tablelist;
}
// =================================================================
// 国士無双、七対子の向聴数を計算
function kokusi_toitu7_SyantenCheck(tempTehai, params) {
    var kokusisyanten = 13; // 国士無双
    var type_count = 0, toitu_count = 0; // 七対子
    for (var paiType = 0; paiType < 4; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (gametype3pai(paiType, paiNo)) continue;
            if (tempTehai[paiType][paiNo]) {
                if (paiNo == 1 || paiNo == 9 || paiType == 3) kokusisyanten--; // 国士無双
                type_count++; // 七対子
            }
            if (tempTehai[paiType][paiNo] >= 2) {
                if (paiNo == 1 || paiNo == 9 || paiType == 3) params.kokusihead = 1; // 国士無双
                toitu_count++; // 七対子
            }
            if (paiType == 3 && paiNo >= 7) break;
        }
    }
    if (settings.kind2) params.syanten.kokusi = kokusisyanten - params.kokusihead;
    // 牌の種類も対子数も7以下の時は13から両方を引く、どっちかでも足りてれば普通に6から対子数を引く
    if (settings.kind1) params.syanten.toitu7 = type_count < 7 && toitu_count < 7 ? (13 - toitu_count - type_count) : (6 - toitu_count);
}
//============================================================================
//干渉しない刻子、順子を抜き出してメンツとして加算
function KanzenMentuCheck(tempTehai, params) {
    // 字牌　刻子のみ
    for (var paiNo = 1; paiNo < 8; paiNo++) {
        if (tempTehai[3][paiNo] >= 3) {
            params.block.mentu += 1;
            tempTehai[3][paiNo] -= 3;
            if (tempTehai[3][paiNo]) params.block.kantu++; // 槓子
        }
    }
    // 数牌
    for (var paiType = 0; paiType < 3; paiType++) {
        // 刻子----------------------------------
        // 1
        if (tempTehai[paiType][1] >= 3 && !tempTehai[paiType][2] && !tempTehai[paiType][3]) {
            params.block.mentu += 1;
            tempTehai[paiType][1] -= 3;
            if (tempTehai[paiType][1]) params.block.kantu++; // 槓子
        }
        // 9
        if (!tempTehai[paiType][7] && !tempTehai[paiType][8] && tempTehai[paiType][9] >= 3) {
            params.block.mentu += 1;
            tempTehai[paiType][9] -= 3;
            if (tempTehai[paiType][9]) params.block.kantu++; // 槓子
        }
        if (gametype3pai(paiType, 2)) continue;
        // 2
        if (!tempTehai[paiType][1] && tempTehai[paiType][2] >= 3 &&
            !tempTehai[paiType][3] && !tempTehai[paiType][4]) {
            params.block.mentu += 1;
            tempTehai[paiType][2] -= 3;
            if (tempTehai[paiType][2]) params.block.kantu++; // 槓子
        }
        // 3～7
        for (var paiNo = 3; paiNo <= 7; paiNo++) {
            if (!tempTehai[paiType][paiNo - 2] && !tempTehai[paiType][paiNo - 1] &&
                tempTehai[paiType][paiNo] >= 3 &&
                !tempTehai[paiType][paiNo + 1] && !tempTehai[paiType][paiNo + 2]) {
                params.block.mentu += 1;
                tempTehai[paiType][paiNo] -= 3;
                if (tempTehai[paiType][paiNo]) params.block.kantu++; // 槓子
            }
        }
        // 8
        if (!tempTehai[paiType][6] && !tempTehai[paiType][7] &&
            tempTehai[paiType][8] >= 3 && !tempTehai[paiType][9]) {
            params.block.mentu += 1;
            tempTehai[paiType][8] -= 3;
            if (tempTehai[paiType][8]) params.block.kantu++; // 槓子
        }

        // 順子----------------------------------
        for (var pais = 3; pais > 0; pais--) { // 有効牌を正確に出すため減らすのは1つまで
            if (tempTehai[paiType][1] == pais && tempTehai[paiType][2] == pais && tempTehai[paiType][3] == pais &&
                !tempTehai[paiType][4] && !tempTehai[paiType][5]) {
                tempTehai[paiType][1] -= pais;
                tempTehai[paiType][2] -= pais;
                tempTehai[paiType][3] -= pais;
                params.block.mentu += pais;
            }
            // ▲234▲▲
            if (tempTehai[paiType][2] == pais && tempTehai[paiType][3] == pais && tempTehai[paiType][4] == pais &&
                !tempTehai[paiType][1] && !tempTehai[paiType][5] && !tempTehai[paiType][6]) {
                tempTehai[paiType][2] -= pais;
                tempTehai[paiType][3] -= pais;
                tempTehai[paiType][4] -= pais;
                params.block.mentu += pais;
            }
            // ▲▲345▲▲ ▲▲456▲▲ ▲▲567▲▲
            for (var paiNo = 3; paiNo <= 5; paiNo++) {
                if (!tempTehai[paiType][paiNo - 2] && !tempTehai[paiType][paiNo - 1] &&
                    tempTehai[paiType][paiNo] == pais && tempTehai[paiType][paiNo + 1] == pais && tempTehai[paiType][paiNo + 2] == pais &&
                    !tempTehai[paiType][paiNo + 3] && !tempTehai[paiType][paiNo + 4]) {
                    tempTehai[paiType][paiNo] -= pais;
                    tempTehai[paiType][paiNo + 1] -= pais;
                    tempTehai[paiType][paiNo + 2] -= pais;
                    params.block.mentu += pais;
                }
            }
            // ▲▲678▲
            if (!tempTehai[paiType][4] && !tempTehai[paiType][5] && !tempTehai[paiType][9] &&
                tempTehai[paiType][6] == pais && tempTehai[paiType][7] == pais && tempTehai[paiType][8] == pais) {
                tempTehai[paiType][6] -= pais;
                tempTehai[paiType][7] -= pais;
                tempTehai[paiType][8] -= pais;
                params.block.mentu += pais;
            }
            // ▲▲789
            if (!tempTehai[paiType][5] && !tempTehai[paiType][6] &&
                tempTehai[paiType][7] == pais && tempTehai[paiType][8] == pais && tempTehai[paiType][9] == pais) {
                tempTehai[paiType][7] -= pais;
                tempTehai[paiType][8] -= pais;
                tempTehai[paiType][9] -= pais;
                params.block.mentu += pais;
            }
        }
    }
}
//============================================================================
//メンツ抜き出し1【→コーツ抜き出し→シュンツ抜き出し】
function mentu_cut1(tempTehai, T, N, params, indent) {
    var tatulist = [];
    // 字牌のコーツは完全コーツ処理で抜いているの数牌だけで良い
    for (var paiType = T; paiType < 3; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット
            if (gametype3pai(paiType, paiNo)) continue;
            //コーツ抜き出し
            if (tempTehai[paiType][paiNo] >= 3) {
                if(debug2) console.log(indent + "└通常刻子:", paiImg[paiType][paiNo].paiName);
                params.block.kotu++;
                tempTehai[paiType][paiNo] -= 3;
                if (tempTehai[paiType][paiNo]) params.block.kantu++; // 槓子
                mentu_cut1(tempTehai, paiType, paiNo, params, indent + "　");
                if (tempTehai[paiType][paiNo]) params.block.kantu--; // 槓子
                tempTehai[paiType][paiNo] += 3;
                params.block.kotu--;
            }
            //シュンツ抜き出し
            if (tempTehai[paiType][paiNo] &&
                tempTehai[paiType][paiNo + 1] &&
                tempTehai[paiType][paiNo + 2] && paiNo < 8) {
                if (debug2) console.log(indent + "└通常順子:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo+1].paiName, paiImg[paiType][paiNo+2].paiName);
                params.block.shuntu++;
                tempTehai[paiType][paiNo]--;
                tempTehai[paiType][paiNo + 1]--;
                tempTehai[paiType][paiNo + 2]--;
                mentu_cut1(tempTehai, paiType, paiNo, params, indent + "　");
                tempTehai[paiType][paiNo]++;
                tempTehai[paiType][paiNo + 1]++;
                tempTehai[paiType][paiNo + 2]++;
                params.block.shuntu--;
            }
        }
    }
    taatu_cut(tempTehai, 0, 1, tatulist, params, "");//ターツ抜きへ
}
//============================================================================
//ターツ抜き出し
function taatu_cut(tempTehai, T, N, tatulist, params, indent) {
    var summentu = params.block.mentu + params.block.kotu + params.block.shuntu + params.block.naki;
    if (debug2) console.log(indent + "　└通過:メンツ:", summentu, "合計ターツ", params.block.tatu, "処理再開:", paiImg[T][N].paiName);
    // メンツとターツの合計は4まで
    if (summentu + params.block.tatu < 4) {
        for (var paiType = T; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット
                if (gametype3pai(paiType, paiNo)) continue;
                // トイツ抜き出し
                // 槓子が対子として抜かれるのはヘッドで先に抜かれる場合。ターツとして成り立たないのでここで削除
                if (tempTehai[paiType][paiNo] == 2 && tehai[paiType][paiNo] < 4) {
                    if(debug2) console.log(indent + "　└対子:", paiImg[paiType][paiNo].paiName);
                    params.block.tatu += 1;
                    tempTehai[paiType][paiNo] -= 2;
                    tatulist.push([paiNo, paiNo, paiType]);
                    // params.params.block.tatu_list.push()
                    taatu_cut(tempTehai, paiType, paiNo, tatulist, params, indent + "　");
                    tempTehai[paiType][paiNo] += 2;
                    params.block.tatu -= 1;
                    tatulist.pop();
                }
                if (paiType == 3) continue; // 字牌は対子だけ
                // リャンメン・ペンチャン抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 1] && paiNo < 9) {
                    if(debug2) console.log(indent + "　└両面/辺張:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo + 1].paiName);
                    params.block.tatu += 1;
                    let paiNo1 = paiNo + 1;
                    tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo1]--;
                    tatulist.push([paiNo, paiNo1, paiType]);
                    taatu_cut(tempTehai, paiType, paiNo, tatulist, params, indent + "　");
                    tempTehai[paiType][paiNo]++;
                    tempTehai[paiType][paiNo1]++;
                    params.block.tatu -= 1;
                    tatulist.pop();
                }
                // カンチャン抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 2] && paiNo < 8) {
                    if(debug2) console.log(indent + "　└嵌張:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo + 2].paiName);
                    params.block.tatu += 1;
                    let paiNo2 = paiNo + 2;
                    tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo2]--;
                    tatulist.push([paiNo, paiNo2, paiType]);
                    taatu_cut(tempTehai, paiType, paiNo, tatulist, params, indent + "　");
                    tempTehai[paiType][paiNo]++;
                    tempTehai[paiType][paiNo2]++;
                    params.block.tatu -= 1;
                    tatulist.pop();
                }
            }
        }
    }

    // 槓子が含まれている場合は孤立牌が使えるか要確認
    var add_syanten = 0;
    if (summentu + params.block.tatu + params.block.head < 5 && params.block.kantu) {
        // 和了以外は孤立牌をチェック
        var add_syanten = 1, tatupin = 0, onlypin = 0;
        for (var paiType = 0; paiType < 4; paiType++) {
            if (tempTehai[paiType].indexOf(1) < 0) continue;
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                // if (gametype3pai(paiType, paiNo)) continue; // 処理時には手牌にないはずなのでカット
                if (!tempTehai[paiType][paiNo]) continue;
                if (add_syanten && !syanten_irregular(tehai, summentu + params.block.tatu, params.block.head, paiType, paiNo, indent)) {
                    tatupin++;
                } else {
                    onlypin++;
                }
            }
        }
        // 1つでも塔子に変化できる孤立牌があればシャンテン数はそのまま
        add_syanten = tatupin > 0 ? 0 : 1;
        if (onlypin == 3) add_syanten = 1; // 槓子が3つある場合のみイレギュラー対応
    }
    // 向聴数を算出
    // 残った孤立牌がヘッドに出来ない場合は+1、over_tatuが3つ揃うと塔子が作れないので+1
    var syanten = 8 - summentu * 2 - params.block.tatu - params.block.head + add_syanten;
    if (debug2) console.log(indent + "　　└向聴数:", syanten, "面子:", summentu, "塔子:", params.block.tatu, "ヘッド:", params.block.head, "余分孤立牌:", add_syanten);
    // 向聴数が少なかったら更新
    if (syanten < params.syanten.normal) params.syanten.normal = syanten;
    if (debug2) console.log(params);
    // 向聴数が同じだったら切り取ったブロックをリスト化して有効牌算出で使う
    if (syanten == params.syanten.min) {
        let lastindex = tatulist.length;
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (paiNo == 3 && paiNo > 7) break;
                if (tempTehai[paiType][paiNo] == 1) {
                    // 字牌かつ4枚目は以外は使える可能性あり
                    if (tempTehai[paiType][paiNo] == 4 && paiType == 3) continue;
                    tatulist.push(["-", paiNo, paiType]);
                }
            }
        }
        params.partslist.push(
            {
                "mentu": summentu,
                "tatu": params.block.tatu,
                "head": params.block.head,
                "list": tatulist.concat()
            }
        );
        tatulist.splice(lastindex, tatulist.length - 1); // 追加した孤立牌を削除
    }
}
// =================================================================
// 赤五があったら通常の五の位置に移動させる
function moveReddora(tempTehai) {
    for (var paiType = 0; paiType < 3; paiType++) {
        if (tempTehai[paiType][0]) {
            tempTehai[paiType][5]++; // 赤五の牌数を五の番地に追加
            tempTehai[paiType][0]--; // 番地0を初期化
        }
    }
}
// =================================================================
// 鳴き手などの枚数が少ない手牌は向聴数を減らす
function Kanzen_nakimentu(tempTehai) {
    var sum = 0;
    tempTehai.forEach(function (value, index, array) {
        array[index].forEach(function (value, index, array) {
            sum += Number(value);
        });
    });
    // 鳴いた部分は完全系の面子として返す
    return (4 - Math.floor(sum / 3));
}
// =================================================================
// 槓子が絡むとき、残った孤立牌がヘッド、対子、塔子候補になるかチェック
function syanten_irregular(t, blocks, head, kType, kNo, indent) {
    var exchange_paiType_to_txt = ["m", "p", "s", "z"];
    var yukopais = yukohaitable["-" + kNo + exchange_paiType_to_txt[kType]];
    for (var yukoNo = 0; yukoNo < yukopais.length; yukoNo++) {
        if (!head && blocks == 4) { // ヘッドはないがブロックは足りる
            // 自身以外のフォロー牌は不要
            if (yukopais[yukoNo] != kNo) continue;
            if (4 - t[kType][yukopais[yukoNo]] > 0) {
                return 0; // 槓子で使い切ってなければOK
            }
        } else if (head && blocks < 4) { // ヘッドはあるがブロックは足りない
            // 対子、塔子として欲しいので全てのフォロー牌が必要
            if (4 - t[kType][yukopais[yukoNo]] > 0) {
                return 0; // 槓子で使い切ってなければOK
            }
        } else if (!head && blocks < 4) { // ヘッドはないしブロックは足りない
            // 対子、塔子として欲しいので全てのフォロー牌が必要
            if (4 - t[kType][yukopais[yukoNo]] > 0) {
                return 0; // 槓子で使い切ってなければOK
            }
        } else { // ヘッドはあるしブロックも足りるので6つ目は必要なし
            // 孤立牌は不要(計算不要)
            return 0;
        }
    }
    return 1; // 使えないフラグON
}

// 有効牌チェック
function yukohai_Check(params, pT, pN, normalflg, toitu7flg, kokusiflg) {
    var tablelist = [];
    var exchange_paiType_to_txt = ["m", "p", "s", "z"];
    var dapaiobj = pN == -1 && pT == -1 ? "d03" : "d" + pN + pT;
    var imgNo = pN == -1 && pT == -1 ? "0z" : pN + exchange_paiType_to_txt[pT];
    var yuko_status = {
        "index": dapaiobj,
        "img": imgNo,
        "css": "" + pT + pN,
        "typecount": 0,
        "nocount": 0,
        "nakicount": 0,
        "ryoketypecount": 0,
        "ryokenocount": 0,
        "ryokenakicount": 0,
        "ryokelist": []
    }; // ソート用
    var yukotehai = [ // 表示に必要な有効牌フラグ
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var tempTehai = JSON.parse(JSON.stringify(tehai));
    moveReddora(tempTehai);
    var all_type = 0; // ほぼ全ての牌で向聴が進む
    // 国士無双=====================================================
    if (kokusiflg && settings.kind2) {
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if ((paiType < 3 && paiNo > 1 && paiNo < 9) || (paiType == 3 && paiNo > 7)) continue;
                if (!tempTehai[paiType][paiNo] && !yukotehai[paiType][paiNo]) {
                    // 持ってなくて追加してない時
                    yukotehai[paiType][paiNo] += 4;
                    yuko_status.typecount++;
                    yuko_status.nocount += 4;
                } else if (tempTehai[paiType][paiNo] && !yukotehai[paiType][paiNo] && !params.kokusihead) {
                    // 持ってるけどヘッドがない時
                    yukotehai[paiType][paiNo] += 4 - tempTehai[paiType][paiNo];
                    yuko_status.typecount++;
                    yuko_status.nocount += 4 - tempTehai[paiType][paiNo];
                }
            }
        }
    }
    // 七対子=====================================================
    if (toitu7flg && settings.kind1) {
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (gametype3pai(paiType, paiNo)) continue;
                if (tempTehai[paiType][paiNo] == 1 && !yukotehai[paiType][paiNo]) {
                    // 持ってなくて追加してない時
                    yukotehai[paiType][paiNo] += 4 - tempTehai[paiType][paiNo];
                    yuko_status.typecount++;
                    yuko_status.nocount += 4 - tempTehai[paiType][paiNo];
                }
            }
        }
        if (!yuko_status.typecount) {
            if (debug2) console.log("七対子:全種必要");
            all_type++;
        }
    }
    // 一般手=====================================================
    if (debug2) console.log(params.partslist);
    if (normalflg && settings.kind0) {
        if (debug2) console.log("一般手有効牌チェック============================");
        if (debug2) console.log(params.partslist);
        for (var i = 0; i < params.partslist.length; i++) {
            // 最低向聴になる形で切り抜けた手牌構成
            // ブロックの数
            let blocks = params.partslist[i].mentu + params.partslist[i].tatu;
            // ヘッドの数
            let head = params.partslist[i].head;
            // 以下のフラグは有効牌追加状況関係なく成立すれば建てる(七対子等で先に有効牌として計上されている可能性があるので)
            let tatu_flg = 0; // ターツに変化できる孤立牌があれば1
            let toitu_flg = 0; // ヘッドに変化できる孤立牌があれば1
            let mentu_flg = 0; // メンツに変化できる孤立牌があれば1
            let kantu_flg = 0; // 槓子で使ってる4枚目の牌
            if (debug2) console.log("【ブロック数:", blocks, "ヘッド有無:", head, "】");
            // 有効牌となるターツ、孤立牌を片っ端から当てはめていく
            for (var b = 0; b < params.partslist[i].list.length; b++) {
                // let [paiNo1, paiNo2, paiType] = params.partslist[i].list[b]; // ES2015のみ(IE11非対応)
                let paistatus = params.partslist[i].list[b];
                // 組み合わせから向聴数が減る有効牌一覧を取得
                let yukopais = yukohaitable[paistatus[0] + "" + paistatus[1] + exchange_paiType_to_txt[paistatus[2]]];
                if (debug2) console.log("有効牌の元:", paistatus[0] + "" +  paistatus[1] + exchange_paiType_to_txt[paistatus[2]]);
                if (!syanten_irregular(tempTehai, blocks, head, paistatus[2], paistatus[1], "") == 0) {
                    // if (debug2) console.log("孤立→未使用追加");
                    kantu_flg++; // 槓子牌なので何も使用できない
                    continue;
                }
                for (var yukoNo = 0; yukoNo < yukopais.length; yukoNo++) {
                    if (gametype3pai(paistatus[2], yukopais[yukoNo])) continue;
                    if (!(paistatus[0] == '-')) { // 塔子
                        if (paistatus[0] == paistatus[1]) { // 対子
                            // if (!head && blocks == 4) continue; // ヘッド候補を消してまで5ブロックにする必要なし
                            if (!yukotehai[paistatus[2]][yukopais[yukoNo]]) {
                                // 有効牌として使用可能
                                yukotehai[paistatus[2]][yukopais[yukoNo]] += 4 - tempTehai[paistatus[2]][yukopais[yukoNo]];
                                // 受け入れ牌をまだ追加してない
                                yuko_status.typecount++;
                                yuko_status.nocount += 4 - tempTehai[paistatus[2]][yukopais[yukoNo]];
                            }
                            mentu_flg++;
                        } else {
                            if (!yukotehai[paistatus[2]][yukopais[yukoNo]]) {
                                // 有効牌として使用可能
                                yukotehai[paistatus[2]][yukopais[yukoNo]] += 4 - tempTehai[paistatus[2]][yukopais[yukoNo]];
                                // 受け入れ牌をまだ追加してない
                                yuko_status.typecount++;
                                yuko_status.nocount += 4 - tempTehai[paistatus[2]][yukopais[yukoNo]];
                            }
                            if　(blocks < 4) mentu_flg++; // 塔子はブロックが少ないときでないと意味がない
                        }
                    } else { // 孤立牌
                        // 自身以外のフォロー牌は不要
                        if (!head && blocks == 4 && yukopais[yukoNo] != paistatus[1]) continue;
                        if (head && blocks == 4) continue; // ヘッドはあるしブロックも足りるので6つ目の塔子は必要なし
                        if (debug2) console.log("有効牌候補:", yukopais[yukoNo]);
                        if (4 - tempTehai[paistatus[2]][yukopais[yukoNo]] > 0) {
                            // 最後の1枚でなければ向聴が進む
                            if (!yukotehai[paistatus[2]][yukopais[yukoNo]]) {
                                // 有効牌として使用可能
                                yuko_status.typecount++;
                                yuko_status.nocount += 4 - tempTehai[paistatus[2]][yukopais[yukoNo]];
                                yukotehai[paistatus[2]][yukopais[yukoNo]] += 4 - tempTehai[paistatus[2]][yukopais[yukoNo]];
                            }
                        }
                        if (yukopais[yukoNo] == paistatus[1]) toitu_flg++;
                        if (yukopais[yukoNo] != paistatus[1]) tatu_flg++;
                        if (debug2 && yukopais[yukoNo] == paistatus[1]) console.log("孤立→対子追加");
                        if (debug2 && yukopais[yukoNo] != paistatus[1]) console.log("孤立→塔子追加");
                    }
                }
            }
            // 1. ヘッドなしかつブロックが足りるけどヘッドに出来る孤立牌候補もなし
            // 2. ヘッドありかつブロックが足りないけど塔子候補なし
            // 3. ヘッドなしかつブロックも足りないかつ3つも使えない孤立牌があるとき(槓子3つ)
            if (debug2) console.log("メンツ候補:", mentu_flg, "対子候補", toitu_flg, "塔子候補", tatu_flg);
            if(((head + toitu_flg) == 0 && blocks == 4) ||
                (head && (blocks + mentu_flg + tatu_flg + toitu_flg) < 4) ||
                ((head + toitu_flg) == 0 && (blocks + mentu_flg + tatu_flg + toitu_flg) < 4) ||
                kantu_flg == 3) {
                if (debug2) console.log("一般手:全種必要");
                all_type++;
            }
        }
    }
    if (debug2) console.log("全種追加フラグ", all_type);
    if (all_type) { // その打牌は向聴が減るけど全部のブロックパターンで全種必要なときだけ
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (gametype3pai(paiType, paiNo)) continue;
                if ((tempTehai[paiType][paiNo] == 4) || (paiType == 3 && paiNo > 7) || yukotehai[paiType][paiNo]) continue;
                if ((4 - tempTehai[paiType][paiNo] > 1 && normalflg) ||
                    (!tempTehai[paiType][paiNo] && toitu7flg)) {
                    yukotehai[paiType][paiNo] += 4 - tempTehai[paiType][paiNo];
                    yuko_status.typecount++;
                    yuko_status.nocount += 4 - tempTehai[paiType][paiNo];
                }
            }
        }
    }
    // 有効牌があれば追加する
    if (yuko_status.typecount) {
        tablelist[0] = yuko_status;
        tablelist[1] = yukotehai;
    }
    return tablelist;
}

// =================================================================
// 0～maxまでの乱数を作る汎用関数
function Rand(max) {
    var random = Math.floor(Math.random() * (max + 1));
    return random;
}
// 配列の合計
function sum(arr) {
    return arr.reduce(function (prev, current, i, arr) {
        return prev + current;
    });
};

// 三麻は2～8mを対象にしない
function gametype3pai(t, n) {
    // 萬子中張牌なら1
    return !settings.gametype && t == 0 && !(n == 1 || n == 9) ? 1 : 0;
}

// その牌は鳴き対象に含めない
function nakikindcheck(t, n) {
    if (!settings.nakikind0 && t == 0) return true;
    if (!settings.nakikind1 && t == 1) return true;
    if (!settings.nakikind2 && t == 2) return true;
    if (!settings.nakikind3 && t == 3) return true;
    if (!settings.nakikind4 && 2 <= n && n <= 8) return true;
    if (!settings.nakikind5 && (1 == n || 9 == n)) return true;
    return false;

}

// every用関数　その牌の所持数が0か
function emptypai(element, index, array) {
    return element == 0;
}