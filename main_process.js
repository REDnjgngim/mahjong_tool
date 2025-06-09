'use strict';

/*
この牌理ツールはタケオしゃん氏が公開している"麻雀小粒プログラミング"を元に作成しています。
https://mahjong.org/programming/
*/

//グローバル変数==============================================================
var yama = new Array(135);//牌山の配列：136牌
var paiData = paiData();
var paiImg = paiImg();
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
        tehai[pTlist[i]][pNlist[i]]++;
    }
    // 順番に配列を作り直す
    for (var paiType = 0; paiType < 4; paiType++) {
        for (var paiNo = 0; paiNo < paiImg[paiType].length; paiNo++) {
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
        paiga += "<img class=\"paiimg pai" + t[i] + n[i] + "\" src=\"./pie_img/" + paiImg[t[i]][n[i]].src + "\">";
    }
    return paiga;
}
// =================================================================
// 元になる牌山を生成する関数【Mersenne Twister in JavaScriptを利用】
function makePaiYama() {
    var mt = new MersenneTwister();// Mersenne­Twister オブジェクトの初期化
    var i, j, k;
    // 元になる牌山を生成
    for (i = 0; i < 136; i++) {
        yama[i] = paiData[i].No;
    }
    // 出来た牌山をシャッフル
    for (i = 135; i > 0; i--) {
        j = mt.nextInt(0, 135); // 0 以上 135 未満の乱数（整数）を発生させる
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
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 4; j++) {
            index = dice * 2 + 16 * i + j; // 親が取り出す牌の番地
            //index = (dice*2 + 4) + 16 * i + j; // 南家が取り出す牌の番地
            //index = (dice*2 + 8) + 16 * i + j; // 西家が取り出す牌の番地
            //index = (dice*2 + 12) + 16 * i + j; // 北家が取り出す牌の番地
            // tehai[paiData[yama[index]].paiType][paiData[yama[index]].paiNo]++; // tehaiに直接入れるタイプ
            paiTypelist.push(paiData[yama[index]].paiType);
            paiNolist.push(paiData[yama[index]].paiNo);
        }
    }
    // 13牌目を取り出す処理
    index = dice * 2 + 16 * 3; // 親が取り出す13牌目の番地
    // index = dice*2 + 16*3 + 1; // 南家がが取り出す13牌目の番地
    // index = dice*2 + 16*3 + 2; // 西家がが取り出す13牌目の番地
    // index = dice*2 + 16*3 + 3; // 北家がが取り出す13牌目の番地
    // tehai[paiData[yama[index]].paiType][paiData[yama[index]].paiNo]++; // tehaiに直接入れるタイプ
    paiTypelist.push(paiData[yama[index]].paiType);
    paiNolist.push(paiData[yama[index]].paiNo);
    // 14牌目を取り出す処理
    index = dice * 2 + 16 * 3 + 4; // 親が取り出す14牌目の番地
    // tehai[paiData[yama[index]].paiType][paiData[yama[index]].paiNo]++; // tehaiに直接入れるタイプ
    paiTypelist.push(paiData[yama[index]].paiType);
    paiNolist.push(paiData[yama[index]].paiNo);
    return [paiTypelist, paiNolist];
}
//============================================================================
//アガリ判定とシャンテン数を返す関数
function pairiCheck(pais) {
    var kokusi = 13, seventoitu = 8, nakimentu = 0;
    var tempTehai = JSON.parse(JSON.stringify(tehai));//tehai配列のバックアップを取る
    moveReddora(tempTehai);
    if (pais >= 13) { // 門前手
        // 国士無双の向聴数
        if (settings.kind2) kokusi = kokusimuso_SyantenCheck(tempTehai);
        // チートイツの向聴数
        if (settings.kind1) seventoitu = seventoitu_SyantenCheck(tempTehai);
    } else { // 鳴き手は国士無双、七対子は計算不要
        nakimentu = Kanzen_nakimentu(tempTehai);
    }
    var countsets = {
        "kanzen_shuntu": 0,
        "kanzen_kotu": 0,
        "kantu": 0,
        "shuntu": 0,
        "kotu": 0,
        "head": 0,
        "normal": 8,
        "naki": nakimentu,
    };
    // 一般手の向聴数
    if (settings.kind0) {
        // 前もって完全なシュンツ・コーツ・孤立牌を抜いておく
        KanzenKoutu_Koritu_KantuCheck(tempTehai, countsets); // 完全に独立したコーツを抜き出して個数を返す関数呼び出し
        if (debug2) console.log("完全刻子数:", countsets.kanzen_kotu);
        kanzenShuntuCheck(tempTehai, countsets); // 完全に独立したシュンツを抜き出して個数を返す関数呼び出し
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
                    mentu_cut1(tempTehai, 0, 1, countsets, "");
                    tempTehai[paiType][paiNo] += 2;
                    countsets.head--;
                }
                if (paiNo > 7 && paiType == 3) break;
            }
        }
        //【雀頭が無い場合の処理】コーツ抜き出し→シュンツ抜き出し→ターツ候補抜き出し
        if (debug2) console.log("頭: なし");
        countsets.head = 0;
        mentu_cut1(tempTehai, 0, 1, countsets, "");
    }
    // 最終的な結果
    if (!settings.kind0 && !settings.kind1) {
        // 国士無双だけの場合は良形変化ソートでエラーが出るので、国士無双の最低シャンテン数より多くする
        countsets.normal = 14;
        seventoitu = 14;
    }
    return [countsets.normal, seventoitu, kokusi];
}
// =================================================================
// 国士無双の向聴数を計算
function kokusimuso_SyantenCheck(tempTehai, countsets) {
    var head = 0;
    var syanten_suu = 13;
    for (var paiType = 0; paiType < 3; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo += 8) {
            if (tempTehai[paiType][paiNo]) syanten_suu--;
            if (tempTehai[paiType][paiNo] >= 2) head = -1;
        }
    }
    for (var paiNo = 1; paiNo < 8; paiNo++) {
        if (tempTehai[3][paiNo]) syanten_suu--;
        if (tempTehai[paiType][paiNo] >= 2) head = -1;
    }
    return syanten_suu + head;
}
// =================================================================
// 七対子の向聴数を計算
function seventoitu_SyantenCheck(tempTehai, countsets) {
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
function KanzenKoutu_Koritu_KantuCheck(tempTehai, countsets) {
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
function kanzenShuntuCheck(tempTehai, countsets) {
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
                    !tempTehai[paiType][paiNo + 4]) {
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
function mentu_cut1(tempTehai, T, N, countsets, indent) {
    // 字牌のコーツは完全コーツ処理で抜いているの数牌だけで良い
    for (var paiType = T; paiType < 3; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット
            //コーツ抜き出し
            if (tempTehai[paiType][paiNo] >= 3) {
                if(debug2) console.log(indent + "└通常刻子:", paiImg[paiType][paiNo].paiName);
                countsets.kotu++;
                tempTehai[paiType][paiNo] -= 3;
                mentu_cut1(tempTehai, paiType, paiNo, countsets, indent + "　");
                tempTehai[paiType][paiNo] += 3;
                countsets.kotu--;
            }
            //シュンツ抜き出し
            if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 1] && tempTehai[paiType][paiNo + 2] && paiNo < 8) {
                if (debug2) console.log(indent + "└通常順子:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo+1].paiName, paiImg[paiType][paiNo+2].paiName);
                countsets.shuntu++;
                tempTehai[paiType][paiNo]--;
                tempTehai[paiType][paiNo + 1]--;
                tempTehai[paiType][paiNo + 2]--;
                mentu_cut1(tempTehai, paiType, paiNo, countsets, indent + "　");
                tempTehai[paiType][paiNo]++;
                tempTehai[paiType][paiNo + 1]++;
                tempTehai[paiType][paiNo + 2]++;
                countsets.shuntu--;
            }
        }
    }
    taatu_cut(tempTehai, 0, 1, 0, countsets, "");//ターツ抜きへ
}
//============================================================================
//ターツ抜き出し
function taatu_cut(tempTehai, T, N, tatu, countsets, indent) {
    var mentu = countsets.kanzen_kotu + countsets.kotu + countsets.kanzen_shuntu + countsets.shuntu + countsets.naki;
    if (debug2) console.log(indent + "　└通過", mentu + tatu, T, N)
    // メンツとターツの合計は4まで
    if (mentu + tatu < 4) {
        for (var paiType = T; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット
                // トイツ抜き出し
                if (tempTehai[paiType][paiNo] == 2) {
                    if(debug2) console.log(indent + "　└対子:", paiImg[paiType][paiNo].paiName);
                    tatu++;
                    tempTehai[paiType][paiNo] -= 2;
                    // countsets.tatu_list.push()
                    taatu_cut(tempTehai, paiType, paiNo, tatu, countsets, indent + "　");
                    tempTehai[paiType][paiNo] += 2;
                    tatu--;
                }
                if (paiType == 3) continue; // 字牌は対子だけ
                // リャンメン・ペンチャン抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 1] && paiNo < 9) {
                    if(debug2) console.log(indent + "　└両面/辺張:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo+1].paiName);
                    tatu++;
                    tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo + 1]--;
                    taatu_cut(tempTehai, paiType, paiNo, tatu, countsets, indent + "　");
                    tempTehai[paiType][paiNo]++;
                    tempTehai[paiType][paiNo + 1]++;
                    tatu--;
                }
                // カンチャン抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 2] && paiNo < 8) {
                    if(debug2) console.log(indent + "　└嵌張:", paiImg[paiType][paiNo].paiName, paiImg[paiType][paiNo+2].paiName);
                    tatu++;
                    tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo + 2]--;
                    taatu_cut(tempTehai, paiType, paiNo, tatu, countsets, indent + "　");
                    tempTehai[paiType][paiNo]++;
                    tempTehai[paiType][paiNo + 2]++;
                    tatu--;
                }
            }
        }
    }
    // 槓子がある場合は単騎待ちが5枚目を参照している場合があるので他の孤立牌がないかチェック
    var over_head = countsets.kantu && !countsets.head ? kantu_only_check(tempTehai) : 0;
    // 向聴数を算出
    var syanten = 8 - mentu * 2 - tatu - countsets.head + over_head;
    if (debug2) console.log(indent + "　　└向聴数:", syanten, "面子:", mentu, "塔子:", tatu, "ヘッド:", countsets.head)
    // 向聴数が少なかったら更新
    if (syanten < countsets.normal) countsets.normal = syanten;
}
// =================================================================
// 赤五があったら通常の五の位置に移動させる
function moveReddora(tempTehai) {
    for (var paiType = 0; paiType < 3; paiType++) {
        if (tempTehai[paiType][0]) {
            tempTehai[paiType][5] += tempTehai[paiType][0]; // 赤五の牌数を五の番地に追加
            tempTehai[paiType][0] = 0; // 番地0を初期化
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
// 残った孤立牌を元の手牌と比較する
function kantu_only_check(tempTehai) {
    var flg = 0; // 孤立牌がない時は0のまま返す
    for (var paiType = 0; paiType < 4; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (!tempTehai[paiType][paiNo]) continue;
            flg = 1;
            if (debug2) console.log("ヘッドチェック:", paiImg[paiType][paiNo].paiName)
            if (tehai[paiType][paiNo] < 4) return 0;// ヘッド候補になるので終了
        }
    }
    if(debug2) console.log("ヘッドなし")
    return flg; // 孤立牌が全部槓子でヘッド候補がないので向聴数を1戻す
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
//============================================================================
//以下は未使用
//============================================================================
//アガリ判定とシャンテン数を返す関数
function c_syantenCheck() { // C#サイトから導入してみた総当り向聴数関数
    var kokusi, seventoitu, normal;
    var tempTehai = new Array(37);//preTempTehai配列のクローン
    tempTehai = tehai.concat();//tehai配列のバックアップを取る
    // 国士無双の向聴数
    kokusi = kokusimuso_SyantenCheck(tempTehai);
    // チートイツの向聴数
    seventoitu = seventoitu_SyantenCheck(tempTehai);
    // 一般手の向聴数
    // 面子、塔子、対子の組み合わせを抽出
    var resultList = [];
    cc = 0;
    for (var paiType = 0; paiType < 4; paiType++) {
        resultList[paiType] = CreateHaiBlockReursive(tempTehai[paiType], paiType == 3, 0, 0, 0);
    }
    console.log(resultList);
    // 最小の向聴数になる組み合わせを総当りで算出
    normal = normal_SyantenCheck(resultList, tempTehai);
    // 12334455667789m 処理チェック用
    console.log(cc)
    console.log(cc2)
    return [kokusi, seventoitu, normal];//最終的な結果
}
// =================================================================
// 一般手の向聴数を計算
// 面子、塔子、対子の組み合わせを抽出(=処理重め)
function CreateHaiBlockReursive(tehai, jihai, mentu, tatu, toitu) {
    cc++;
    // console.log(jihai, mentu, tatu, toitu)
    var resultList = new Array();
    for (var paiType = 0; paiType < tehai.length; paiType++) {
        var count = tehai[paiType];

        // 雀頭・対子チェック
        if (count >= 2) {
            var copytehai = tehai.concat();
            copytehai[paiType] -= 2;
            resultList = resultList.concat(
                CreateHaiBlockReursive(copytehai, jihai, mentu, tatu, toitu + 1)
            );
        }

        // 刻子チェック
        if (count >= 3) {
            var copytehai = tehai.concat();
            copytehai[paiType] -= 3;
            resultList = resultList.concat(
                CreateHaiBlockReursive(copytehai, jihai, mentu + 1, tatu, toitu)
            );
        }

        // 字牌はここまで
        if (jihai) continue;

        // 順子の処理
        if (paiType < tehai.length - 2 // 8,9は必要なし
            && count >= 1 && tehai[paiType + 1] >= 1 && tehai[paiType + 2] >= 1) {
            var copytehai = tehai.concat();
            copytehai[paiType]--;
            copytehai[paiType + 1]--;
            copytehai[paiType + 2]--;
            // 再帰呼び出し
            resultList = resultList.concat(
                CreateHaiBlockReursive(copytehai, jihai, mentu + 1, tatu, toitu)
            );
        }

        // 嵌張の処理
        if (paiType < tehai.length - 2 // 8,9は必要なし
            && count >= 1 && tehai[paiType + 2] >= 1) {
            var copytehai = tehai.concat();
            copytehai[paiType]--;
            copytehai[paiType + 2]--;
            // 再帰呼び出し
            resultList = resultList.concat(
                CreateHaiBlockReursive(copytehai, jihai, mentu, tatu + 1, toitu)
            );
        }

        // 辺張・両面の処理
        if (paiType < tehai.length - 1 // 9は必要なし
            && count >= 1 && tehai[paiType + 1] >= 1) {
            var copytehai = tehai.concat();
            copytehai[paiType]--;
            copytehai[paiType + 1]--;
            // 再帰呼び出し
            resultList = resultList.concat(
                CreateHaiBlockReursive(copytehai, jihai, mentu, tatu + 1, toitu)
            );
        }
    }
    // 分解できたら結果を記憶
    if (mentu + tatu + toitu > 0) {
        resultList.push([mentu, tatu, toitu]);
    }
    // 分解結果を返却
    return resultList;
}
// 最小の向聴数になる組み合わせを総当りで算出(=処理重め)
function normal_SyantenCheck(resultList, tehai) {
    // 萬子・筒子・索子・字牌でブロックを総当りで調べ上げる
    // console.log(resultList)

    // 字牌の種類と数をカウントしておく
    var zihaiTypesCount = 0, zihaiCount = 0;
    for (var paiNo = 1; paiNo < tehai[3].length; paiNo++) {
        if (tehai[3][paiNo]) {
            zihaiCount += tehai[3][paiNo];
            zihaiTypesCount++;
        }
    }

    // 最小の向聴数を総当り
    var minShanten = 8;
    cc2 = 0;
    for (var m = 0; m < resultList[0].length + 1; m++) {
        for (var p = 0; p < resultList[1].length + 1; p++) {
            for (var s = 0; s < resultList[2].length + 1; s++) {
                for (var z = 0; z < resultList[3].length + 1; z++) {
                    cc2++;
                    var mentu = 0, tatu = 0, toitu = 0, hasJanto = false;
                    // mが0以上なら萬子から面子・搭子・対子の数を取得し加算
                    if (m > 0) {
                        mentu += resultList[0][m - 1][0];
                        tatu += resultList[0][m - 1][1];
                        toitu += resultList[0][m - 1][2];
                    }
                    // pが0以上なら筒子から面子・搭子・対子の数を取得し加算
                    if (p > 0) {
                        mentu += resultList[1][p - 1][0];
                        tatu += resultList[1][p - 1][1];
                        toitu += resultList[1][p - 1][2];
                    }
                    // sが0以上なら索子から面子・搭子・対子の数を取得し加算
                    if (s > 0) {
                        mentu += resultList[2][s - 1][0];
                        tatu += resultList[2][s - 1][1];
                        toitu += resultList[2][s - 1][2];
                    }
                    // zが0以上なら字牌から面子・搭子・対子の数を取得し加算
                    if (z > 0) {
                        mentu += resultList[3][z - 1][0];
                        tatu += resultList[3][z - 1][1];
                        toitu += resultList[3][z - 1][2];
                    }
                    // 対子があるなら1つを雀頭にし、対子の数から1つ減らし搭子に加算
                    if (toitu > 0) {
                        hasJanto = true;
                        tatu += toitu - 1;
                    }
                    // 面子と搭子は合わせて4つまで。それより多いなら面子の余りを搭子に
                    if (mentu + tatu > 4) tatu = 4 - mentu;

                    // 雀頭を取れていたら向聴数から減算できる
                    var janto = (hasJanto ? 1 : 0);

                    // 向聴数を計算
                    var shanten = 8 - mentu * 2 - tatu - janto;

                    // もしも手牌が全て字牌だったら向聴数を悪化させる
                    if (zihaiCount == 14 && zihaiTypesCount < 5) shanten += 5 - zihaiTypesCount;

                    // 最小の向聴数ならそれを記憶
                    if (minShanten > shanten) minShanten = shanten;

                    // 最小の向聴数が-1（和了り）ならそれ以降処理不要
                    if (minShanten == -1) return minShanten;
                }
            }
        }
    }
    // 最小の向聴数を返却する
    return minShanten;
}