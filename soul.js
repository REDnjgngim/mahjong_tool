'use strict';

var Wno = 0; // ポップアップで開いている中身
var tehai = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]; // 手牌の配列：37種(0は赤、字はバッファ)
var tehai_txt = ""; // テキスト式の手牌
var settings = {
    'gametype': true,
    "kind0": true, "kind1": true, "kind2": true,
    "yukodisp": true,
    "nakidisp": false,
    "nakikind0": true, "nakikind1": true, "nakikind2": true, "nakikind3": true, "nakikind4": true, "nakikind5": true,
    "ryokedisp": true,
    "pindisp": true,
    "order": true,
    "ripai": true
};
var reload_flg = 0; // 何も設定を変更しない場合は無駄に処理しない
var tehai_history = [];
var history_index = 0; // 現在表示している手牌(添字)
// デバッグ用変数
var debug = 0;
var debug2 = 0;
//==============================================================================
// シャンテン数とか有効牌を処理するメイン関数

// 牌理処理セット
function main_process() {
    console.time('main');
    // 計算用手牌を更新して枚数を取得
    $("#yukotable").empty();
    $('#syanten_area span').html("");
    $('#syanten_area span').removeClass();
    var pais = tehai_calc_reload();
    if (irregular_check(pais)) return;
    // 向聴数をチェック
    var tablelist = [];
    var syantenlist = pairiCheck(pais, 13, -1, -1, true);
    syanten_output(syantenlist, pais);
    // 有効牌チェック
    if (debug) console.log("有効牌=======================================");
    var min_syanten = Math.min(syantenlist[0], syantenlist[1], syantenlist[2]);
    if(min_syanten >= 0){
        // 1. 打牌毎に有効牌をチェック
        // if ([2, 5, 8, 11, 14].includes(pais)) { // ES2015のみ(IE11非対応)
        if ([2, 5, 8, 11, 14].indexOf(pais) >= 0) {
            for (var paiType = 0; paiType < 4; paiType++) {
                for (var paiNo = 0; paiNo < 10; paiNo++) {
                    if (gametype3pai(paiType, paiNo)) continue;
                    // 赤は黒五がないときだけ打牌候補に入れる
                    if (!tehai[paiType][paiNo] || (paiNo == 0 && tehai[paiType][5])) continue;
                    if (debug) console.log("////////////////////打 " + paiImg[paiType][paiNo].paiName);
                    tehai[paiType][paiNo]--;
                    pais--;
                    // 戻り値は[params, 有効牌テーブル]
                    let yukoresult = pairiCheck(pais, min_syanten, paiType, paiNo, false);
                    if (yukoresult.length > 1){
                        tablelist.push(param_default());
                        let index = tablelist.length - 1;
                        tablelist[index].param = yukoresult[0];
                        tablelist[index].yukotable = yukoresult[1];
                        // イーシャンテン以下は鳴ける
                        if (syantenlist[0] > 0 && settings.nakidisp) {
                            let nakiresult = nakiyukoCheck(pais, tablelist, syantenlist[0], index);
                            tablelist[index].param.nakicount = nakiresult[0];
                            tablelist[index].nakitable = nakiresult[1];
                        }
                    }
                    pais++;
                    tehai[paiType][paiNo]++;
                    if (debug) console.log(tablelist);
                }
            }
        } else { // 打牌候補がないので現在の手牌で有効牌を算出
            let yukoresult = pairiCheck(pais, min_syanten, -1, -1, false);
            tablelist.push(param_default());
            let index = tablelist.length - 1;
            tablelist[index].param = yukoresult[0];
            tablelist[index].yukotable = yukoresult[1];
            if (syantenlist[0] > 0 && settings.nakidisp) {
                let nakiresult = nakiyukoCheck(pais, tablelist, syantenlist[0], index);
                tablelist[index].param.nakicount = nakiresult[0];
                tablelist[index].nakitable = nakiresult[1];
            }
            if (debug) console.log(tablelist);
        }
        // 多い順にソートを掛ける
        tablelist.sort(function (a, b) {
            // 有効牌枚数＞有効牌種枚数
            return b.param.nocount - a.param.nocount || b.param.typecount - a.param.typecount;
        });
        // 2. 有効牌毎に受入良化する牌をチェック(一番多い有効牌よりも増えたら対象)
        if (settings.ryokedisp) {
            if (debug) console.log("受入良化=====================================");
            // 現時点の手牌で最大のN種N牌をメモ
            var maxTypecount = tablelist[0].param.typecount, maxNocount = tablelist[0].param.nocount;
            for (let id = 0; id < tablelist.length; id++) {
                if (debug) console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\打 " + tablelist[id].param.img);
                // 戻り値は受入良化する[牌種, 枚数, テーブル]の3つ
                let ryokeresult = nextmain_process(tablelist, min_syanten, pais, id, maxTypecount, maxNocount);
                if (ryokeresult.length > 1) {
                    tablelist[id].param.ryoketypecount = ryokeresult[0];
                    tablelist[id].param.ryokenocount = ryokeresult[1];
                    tablelist[id].ryoketable = ryokeresult[2];
                }
                // 受入良化は聴牌でも鳴ける
                if (syantenlist[0] >= 0 && settings.nakidisp) {
                    let nakiresult = nakiryokeCheck(pais, tablelist, syantenlist[0], id, maxTypecount, maxNocount);
                    tablelist[id].param.ryokenakicount = nakiresult[0];
                    tablelist[id].ryokenakitable = nakiresult[1];
                }
            }
        }
        if (min_syanten >= 0) yukohai_output(tablelist, min_syanten);
    }
    console.timeEnd('main');
    tehai_history_write(min_syanten, syantenlist, tablelist, pais);
    reload_flg = 0;
}

// ==============================================================
// 今後牌理処理をする変数が増えるのに対応するため、最初に一括で変数を代入してエラーを防ぐ
function param_default() {
    var table = {};
    table.param = {};
    table.yukotable = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    table.nakitable = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    table.ryoketable = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    table.ryokenakitable = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    return table;
}

// 向聴数を反映
function syanten_output(s, pais) {
    let syanten;
    if (debug) console.log(s, pais);
    // 1:一般形, 2:七対子, 3:国士無双
    $('#syanten_area span:first-child').html("シャンテン数");
    syanten = s[0] > 0 ? s[0] : s[0] == 0 ? "聴牌" : "和了";
    if (settings.kind0) { // 一般形
        $('#normal_syanten').html("一般形:" + syanten + "　");
        // テンパイ、和了は色を変える
        $('#syanten_area span').removeClass();
        s[0] > 0 ? $('#normal_syanten').removeClass() :
        s[0] == 0 ? $('#normal_syanten').addClass("tenpai") : $('#normal_syanten').addClass("agari");
    } else {
        $('#normal_syanten').html("");
        $('#normal_syanten').removeClass();
    }
    // 一般形以外
    if (pais < 13) {
        $('#seventoitu_syanten').html("");
        $('#seventoitu_syanten').removeClass();
        $('#kokusi_syanten').html("");
        $('#kokusi_syanten').removeClass();
    } else {
        if (settings.kind1) { // 七対子
            syanten = s[1] > 0 ? s[1] : s[1] == 0 ? "聴牌" : "和了";
            $('#seventoitu_syanten').html("七対子:" + syanten + "　");
            s[1] > 0 ? $('#seventoitu_syanten').removeClass() :
            s[1] == 0 ? $('#seventoitu_syanten').addClass("tenpai") : $('#seventoitu_syanten').addClass("agari");
        } else {
            $('#seventoitu_syanten').html("");
            $('#seventoitu_syanten').removeClass();
        }
        if (settings.kind2) { // 国士無双
            syanten = s[2] > 0 ? s[2] : s[2] == 0 ? "聴牌" : "和了";
            $('#kokusi_syanten').html("国士:" + syanten + "　");
            s[2] > 0 ? $('#kokusi_syanten').removeClass() :
            s[2] == 0 ? $('#kokusi_syanten').addClass("tenpai") : $('#kokusi_syanten').addClass("agari");
        } else {
            $('#kokusi_syanten').html("");
            $('#kokusi_syanten').removeClass();
        }
    }
}

// 有効牌を表示
function yukohai_output(tablelist, min_syanten) {
    if (debug) console.log(tablelist);
    // 受入良化や鳴き牌込みでソート
    if(settings.nakidisp){
        tablelist.sort(function (a, b) {
            // 有効牌枚数＞有効牌種枚数＞受入良化枚数＞受入良化牌種
            return (b.param.nocount + b.param.nakicount) - (a.param.nocount + a.param.nakicount) || b.param.typecount - a.param.typecount || (b.param.ryokenocount + b.param.ryokenakicount) - (a.param.ryokenocount + a.param.ryokenakicount) || b.param.ryoketypecount - a.param.ryoketypecount;
        });
    } else {
        tablelist.sort(function (a, b) {
            // 有効牌枚数＞有効牌種枚数＞受入良化枚数＞受入良化牌種
            return b.param.nocount - a.param.nocount || b.param.typecount - a.param.typecount || b.param.ryokenocount - a.param.ryokenocount || b.param.ryoketypecount - a.param.ryoketypecount;
        });
    }
    // 上から順にテーブルを作成
    for (var id = 0; id < tablelist.length; id++){
        let dapai = tablelist[id];
        // 最初に良形手替わりになる牌を探す
        var yukopais = "", ryokepais = "", header = "";
        if (min_syanten == 0) dapai.param.nakicount = 0; // 聴牌時の有効牌 = 和了
        // 打牌のヘッダー
        if (settings.nakidisp) {
            var header = "<tr class='table_header'><td>打：" + "<img class='paiimg pai" + dapai.param.css + "' src='./pie_img/" + dapai.param.img + ".png'><br>実質有効牌：" + dapai.param.typecount + "種" + dapai.param.nocount + "<span class='nakicount'>+" + dapai.param.nakicount + "</span>枚";
            if (settings.ryokedisp) header += " / 実質受入良化：" + dapai.param.ryoketypecount + "種" + dapai.param.ryokenocount + "<span class='nakicount'>+" + dapai.param.ryokenakicount + "</span>枚";
        } else {
            var header = "<tr class='table_header'><td>打：" + "<img class='paiimg pai" + dapai.param.css + "' src='./pie_img/" + dapai.param.img + ".png'><br>有効牌：" + dapai.param.typecount + "種" + dapai.param.nocount + "枚";
            if (settings.ryokedisp) header += " / 受入良化：" + dapai.param.ryoketypecount + "種" + dapai.param.ryokenocount + "枚";
        }
        $("#yukotable").append(header + "</td></tr>");
        if (!settings.yukodisp) continue;
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                yukopais += "<div class='paiset'>";
                if (settings.ryokedisp) ryokepais += "<div class='paiset'>";
                let yukonakicoef = "", ryokenakicoef = "";
                if (settings.order) {
                    // 有効牌画像を追加
                    if (settings.nakidisp && min_syanten > 0 && dapai.nakitable[paiType][paiNo] > 0) yukonakicoef = "<img class='nakipai' src='./img/pai" + dapai.nakitable[paiType][paiNo] + ".png'>";
                    if (dapai.yukotable[paiType][paiNo]) yukopais += yukonakicoef + "<img class='paiimg pai" + paiType + paiNo + "' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                    // 受入良化牌を追加
                    if (settings.ryokedisp && settings.nakidisp && dapai.ryokenakitable[paiType][paiNo] > 0) ryokenakicoef += "<img class='nakipai' src='./img/pai" + dapai.ryokenakitable[paiType][paiNo] + ".png'>";
                    if (settings.ryokedisp && dapai.ryoketable[paiType][paiNo]) ryokepais += ryokenakicoef + "<img class='paiimg pai" + paiType + paiNo + " shadow' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                } else {
                    // 有効牌画像を追加
                    if (settings.nakidisp && min_syanten > 0 && dapai.nakitable[paiType][paiNo] > 0) yukonakicoef = "<img class='nakipai' src='./img/pai" + dapai.nakitable[paiType][paiNo] + ".png'>";
                    if (dapai.yukotable[paiType][paiNo]) yukopais += yukonakicoef + "<img class='paiimg pai" + paiType + paiNo + "' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                    // 受入良化牌を追加
                    if (settings.ryokedisp && settings.nakidisp && dapai.ryokenakitable[paiType][paiNo] > 0) ryokenakicoef += "<img class='nakipai' src='./img/pai" + dapai.ryokenakitable[paiType][paiNo] + ".png'>";
                    // 受入良化牌もそのまま有効牌にくっつける
                    if (settings.ryokedisp && dapai.ryoketable[paiType][paiNo]) yukopais += ryokenakicoef + "<img class='paiimg pai" + paiType + paiNo + " shadow' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                }
                yukopais += "</div>";
                if (settings.ryokedisp) ryokepais += "</div>";
            }
        }
        if (ryokepais != "" && settings.ryokedisp && settings.order) {
            if (/img/.test(ryokepais)) yukopais += "<br>" + ryokepais;
        }
        $("#yukotable").append("<tr class='table_data'><td>" + yukopais + "</td></tr>");
    }
}

// ==============================================================
// もう一つ先の手牌も評価して受入良化となるかをチェックする
function nextmain_process(tablelist, ms, pais, idx, mtc, mnc) {
    // var list = [[], []]; // [[良形有効牌], [鳴き有効牌]]
    var yukohaitable = yukoupai_table();
    // 受入良化牌の枚数は元の手牌基準のため、最初に一時保管する
    var tempTehai = JSON.parse(JSON.stringify(tehai));
    moveReddora(tempTehai);
    var ryoketable = [ //　表示フラグ
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var types = 0, counts = 0;
    // 打牌で必要な値をセット
    var dapai = tablelist[idx].param.index.split("")// dapai[2] = paiType, dapai[1] = paiNo
    var yukopai = tablelist[idx].yukotable;
    if (tablelist[idx].param.index != "d03") tehai[dapai[2]][dapai[1]]--;
    pais--;
    // 手牌N打→Nツモ
    for (var paiType = 0; paiType < 4; paiType++) {
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            // ツモできるか色々チェック
            if (gametype3pai(paiType, paiNo)) continue; // 三麻は萬子2～8牌を使用できない
            if ((paiType == dapai[2] && paiNo == dapai[1])) continue; // 初手手牌の打牌をまたツモるのは不要
            if (yukopai[paiType][paiNo] > 0) continue; // 有効牌なので受入良化牌になりえない
            if (tehai[paiType][paiNo] == 4) continue; // 4枚使い切ってるので判定不可
            if (paiType == 3 && paiNo > 7) continue;
            if (followpai_check(paiType, paiNo, yukohaitable)) continue;
            // ------------
            tehai[paiType][paiNo]++; // 任意の牌Nをツモ
            pais++;
            if (debug) console.log("**********ツモ", paiImg[paiType][paiNo].paiName);
            next_tumo: for (var paiType2 = 0; paiType2 < 4; paiType2++) {
                for (var paiNo2 = 0; paiNo2 < 10; paiNo2++) {
                    // 赤は黒五がないときだけ打牌候補に入れる
                    if (!tehai[paiType2][paiNo2] || (paiNo == 0 && tehai[paiType2][5])) continue;
                    if ((paiType2 == paiType && paiNo2 == paiNo)) continue; // 一手先手牌のツモをまた打牌する必要なし
                    if (debug) console.log("/////1巡先 打 " + paiImg[paiType2][paiNo2].paiName);
                    tehai[paiType2][paiNo2]--;
                    pais--;
                    let result = pairiCheck(pais, ms, paiType2, paiNo2, false); // 向聴が進む打牌があればチャンス
                    pais++;
                    tehai[paiType2][paiNo2]++;
                    if (result.length > 1) { // 一手先手牌もシャンテン数が進む有効牌がある
                        // 初手手牌より一手先手牌のほうが有効牌種数、または有効枚数が多かったら受入良化牌として使える
                        if ((mtc <= result[0].typecount && mnc < result[0].nocount) ||
                            (mtc < result[0].typecount && mnc <= result[0].nocount)) {
                            types++;
                            counts += 4 - tempTehai[paiType][paiNo]; // 初手手牌基準で枚数を加算
                            ryoketable[paiType][paiNo] = (4 - tempTehai[paiType][paiNo]); // 表示フラグ(一応元の値をそのまま突っ込む)
                            break next_tumo; // これ以上同じツモを調べる必要はなし
                        }
                    }
                }
            }
            pais--;
            tehai[paiType][paiNo]--;
        }
    }
    pais++;
    if (tablelist[idx].param.index != "d03") tehai[dapai[2]][dapai[1]]++;
    return [types, counts, ryoketable];
}

// 有効牌で向聴数が減るかチェック、向聴数が減ったら鳴きの対象になる
function nakiyukoCheck(p, t, ms, idx) {
    var nakitable = [ // チー = 2、ポン = 4)
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var counts = 0;
    var dapai = t[idx];
    for (var paiType = 0; paiType < 4; paiType++) {
        var redflg = 0;
        if (tehai[paiType][0]) {
            // 赤牌は一時的に移動
            redflg = 1;
            tehai[paiType][0]--;
            tehai[paiType][5]++;
        }
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (!dapai.yukotable[paiType][paiNo]) continue; // 有効牌か確認
            if (nakikindcheck(paiType, paiNo)) continue;
            var capture_syanten = [];
            let nakiadd = 0;
            if (debug) console.log("鳴き有効牌", paiImg[paiType][paiNo].paiName);
            // 鳴ける対子があるか確認
            if ((tehai[paiType][paiNo] == 2 || tehai[paiType][paiNo] == 3)) { // ポン材があるとき
                if (debug) console.log("対子：", paiImg[paiType][paiNo].paiName);
                tehai[paiType][paiNo] -= 2;
                p -= 2;
                // 特定ブロックを除いてシャンテン数のみ計算
                capture_syanten = pairiCheck(p, 8, -1, -1, true);
                if (capture_syanten[0] < ms) { // 通常手のシャンテンでのみ判定
                    nakitable[paiType][paiNo] = 4;
                    counts += dapai.yukotable[paiType][paiNo] * 3;
                    // t[0][idx].nocount += t[1][dapai][paiType][paiNo] * 3;
                    nakiadd = 1;
                }
                tehai[paiType][paiNo] += 2;
                p += 2;
            }
            // ポン材で先に追加してたら塔子では判定しない(塔子を拾うようにする場合はここでカットしないように)
            if (nakiadd || paiType == 3 || !settings.gametype) continue;
            // 鳴ける塔子があるかチェック
            var tatulist = nakitatutable[paiNo];
            for (var i = 0; i < tatulist.length; i++) {
                let tl = tatulist[i];
                if (tehai[paiType][tl[0]] && tehai[paiType][tl[1]]) {
                    if (debug) console.log("塔子：", paiImg[paiType][tl[0]].paiName, paiImg[paiType][tl[1]].paiName);
                    tehai[paiType][tl[0]]--;
                    tehai[paiType][tl[1]]--;
                    p -= 2;
                    // 特定ブロックを除いてシャンテン数のみ計算
                    capture_syanten = pairiCheck(p, 8, -1, -1, true);
                    if (capture_syanten[0] < ms) { // 通常手のシャンテンでのみ判定
                        nakitable[paiType][paiNo] = 2;
                        counts += dapai.yukotable[paiType][paiNo];
                        // t[0][idx].nocount += t[1][dapai][paiType][paiNo];
                        nakiadd = 1;
                    }
                    tehai[paiType][tl[0]]++;
                    tehai[paiType][tl[1]]++;
                    p += 2;
                    // チー材で追加したら塔子のループから抜ける
                    if (nakiadd) break;
                }
            }
        }
        if (redflg) {
            tehai[paiType][0]++;
            tehai[paiType][5]--;
        }
    }
    return [counts, nakitable];
}

// 受入良化牌で有効牌が増えるかチェック、有効牌が増えたら鳴きの対象になる
function nakiryokeCheck(p, t, ms, idx, mtc, mnc) {
    var nakitable = [ // チー = 2、ポン = 4)
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var counts = 0;
    var ryokepai = t[idx].ryoketable;
    var dapai = t[idx].param.index.split("")// dapai[2] = paiType, dapai[1] = paiNo
    if (t[idx].param.index != "d03") tehai[dapai[2]][dapai[1]]--;
    p--;
    for (var paiType = 0; paiType < 4; paiType++) {
        var redflg = 0;
        if (tehai[paiType][0]) {
            // 赤牌は一時的に移動
            redflg = 1;
            tehai[paiType][0]--;
            tehai[paiType][5]++;
        }
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (!ryokepai[paiType][paiNo]) continue; // 受入良化牌か確認
            if (nakikindcheck(paiType, paiNo)) continue;
            let nakiadd = 0;
            if (debug) console.log("鳴き受入良化牌", paiImg[paiType][paiNo].paiName);
            // 鳴ける対子があるか確認
            if (tehai[paiType][paiNo] == 2 || tehai[paiType][paiNo] == 3) { // ポン材があるとき
                if (debug) console.log("対子：", paiImg[paiType][paiNo].paiName);
                tehai[paiType][paiNo] -= 2;
                p -= 2;
                // 特定ブロックを除いてシャンテン数のみ計算
                let result = pairiCheck(p, ms, -1, -1, false);
                if (result.length > 1) { // 同向聴数以上になればある
                    if ((mtc <= result[0].typecount && mnc < result[0].nocount) ||
                        (mtc < result[0].typecount && mnc <= result[0].nocount)) {
                        nakitable[paiType][paiNo] = 4;
                        counts += ryokepai[paiType][paiNo] * 3;
                        nakiadd = 1;
                    }
                }
                tehai[paiType][paiNo] += 2;
                p += 2;
            }
            // ポン材で先に追加してたら塔子では判定しない(塔子を拾うようにする場合はここでカットしないように)
            if (nakiadd || paiType == 3 || !settings.gametype) continue;
            // 鳴ける塔子があるかチェック
            var tatulist = nakitatutable[paiNo];
            for (var i = 0; i < tatulist.length; i++) {
                let tl = tatulist[i];
                if (tehai[paiType][tl[0]] && tehai[paiType][tl[1]]) {
                    if (debug) console.log("塔子：", paiImg[paiType][tl[0]].paiName, paiImg[paiType][tl[1]].paiName);
                    tehai[paiType][tl[0]]--;
                    tehai[paiType][tl[1]]--;
                    p -= 2;
                    // 特定ブロックを除いてシャンテン数のみ計算
                    let result = pairiCheck(p, ms, -1, -1, false);
                    if (result.length > 1) { // 同向聴数以上になればある
                        if ((mtc <= result[0].typecount && mnc < result[0].nocount) ||
                            (mtc < result[0].typecount && mnc <= result[0].nocount)) {
                            nakitable[paiType][paiNo] = 2;
                            counts += ryokepai[paiType][paiNo];
                            nakiadd = 1;
                        }
                    }
                    tehai[paiType][tl[0]]++;
                    tehai[paiType][tl[1]]++;
                    p += 2;
                    // チー材で追加したら塔子のループから抜ける
                    if (nakiadd) break;
                }
            }
        }
        if (redflg) {
            tehai[paiType][0]++;
            tehai[paiType][5]--;
        }
    }
    p++;
    if (t[idx].param.index != "d03") tehai[dapai[2]][dapai[1]]++;
    return [counts, nakitable];
}

// 関連する牌だけ処理したい場合はここで先に確認
function followpai_check(tumopT, tumopN, yukohaitable) {
    if (settings.pindisp) return 0; // 全て表示する場合は強制的に全てOK
    var exchange_paiType_to_txt = ["m", "p", "s", "z"];
    for (var paiType = 0; paiType < 3; paiType++) {
        if (!(tehai[tumopT].indexOf(1) >= 0 || tehai[tumopT].indexOf(1) >= 0 ||
            tehai[tumopT].indexOf(2) >= 0 || tehai[tumopT].indexOf(3) >= 0)) {
            // 関連牌を持ってないので省略
            continue;
        }
        let yukohais = yukohaitable["-" + tumopN + exchange_paiType_to_txt[tumopT]];
        if (debug) console.log("ツモ牌: -" + tumopN + exchange_paiType_to_txt[tumopT]);
        if (debug) console.log(yukohais);
        for (var yukoNo = 0; yukoNo < yukohais.length; yukoNo++) {
            // ツモに影響のある牌が手牌にあるので処理開始
            if (tehai[tumopT][yukohais[yukoNo]] >= 1) return 0;
        }
    }
    return 1;
}

// ==============================================================
// 手牌を更新し終わったらその処理結果を一時保持しておく
function tehai_history_write(ms, sl, tl, p) {
    // 過去の手牌にいるときに処理したらそれより新しいものは全消し
    if (history_index > 0) {
        tehai_history.splice(0, history_index);
        history_index = 0;
    }
    // 牌画テキストを整形
    var paiList = exchange_txt_to_paiga(tehai_txt);
    paiList = tehai_sort(paiList[0], paiList[1]);
    var txt = exchange_paiga_to_txt(paiList[0], paiList[1]);
    tehai_history.unshift({
        "min_syanten": ms,
        "syantenlist": sl,
        "tablelist": tl,
        "tehai": tehai,
        "tehai_txt": txt,
        "pais": p
    });
    // 保存可能数を超えたら後ろから削除
    if (tehai_history.length > 20) {
        tehai_history.pop();
    }
    history_button_reload();
}

// 戻る進むボタンの表示判定
function history_button_reload() {
    // 戻るボタン
    if (tehai_history.length >= 2 && history_index + 1 != tehai_history.length) {
        // 2個以上あって一番古い手牌でなければアクティブ
        $("#before_button").css("filter", "grayscale(0)");
        $("#before_button").css("cursor", "pointer");
    } else {
        $("#before_button").css("filter", "grayscale(100)");
        $("#before_button").css("cursor", "default");
    }
    // 進むボタン
    if (history_index != 0) {
        // 最新の手牌でなければアクティブ
        $("#after_button").css("filter", "grayscale(0)");
        $("#after_button").css("cursor", "pointer");
    } else {
        $("#after_button").css("filter", "grayscale(100)");
        $("#after_button").css("cursor", "default");
    }
}

// 保存している手牌を表示
function tehaimobe(move) {
    if (0 <= history_index + move && history_index + move < tehai_history.length) {
        // 過去の手牌を代入
        var t = tehai_history[history_index + move];
        history_index += move;
        $("#yukotable").empty();
        $('#syanten_area span').html("");
        $('#syanten_area span').removeClass();
        // 手牌状況を復活
        tehai = [];
        tehai = JSON.parse(JSON.stringify(t.tehai));
        // 手牌表示を復活
        tehai_txt = t.tehai_txt;
        $("#tehaitxt").val(tehai_txt);
        var paiList = exchange_txt_to_paiga(tehai_txt);
        paiList = tehai_sort(paiList[0], paiList[1]);
        $("#paiTehai").empty();
        $("#paiTehai").append(paiimg_Output(paiList[0], paiList[1]));
        // シャンテン数を再表示
        syanten_output(t.syantenlist, t.pais);
        // 有効牌を再表示
        if (t.min_syanten >= 0) yukohai_output(t.tablelist, t.min_syanten);
        history_button_reload();
    }
}

// 設定が変更されたら都度更新する
$(document).on("click", "form input", function () {
    setings_reload($(this).attr("name"), 1);
    reload_flg = 1;
});

// ==============================================================
// ポップアップウィンドウ表示
function popup_window(flg) {
    // 0 = 非表示, 1 = 手牌入力画面
    // if ($("#popup") && flg == Wno) return;
    $("#popup, #longpopup").remove();
    $("#close_button").remove();
    $("#menu div p").removeClass("open");
    if (flg == 0 || flg == Wno) {
        // if (Wno != 3 && settings.ripai) tehai_reload();
        if (reload_flg) main_process();
        Wno = 0;
        if (debug) console.log(settings);
        return;
    }
    if (flg == 1) { // 手牌入力画面
        $("#main").append("<div id='popup'><div class='scroll_area'></div></div>");
        $("#popup").append("<img id='close_button' src='./img/close.png' onclick='popup_window(0)'>");
        close_button_size();
        paiinput_Display();
        // 現在の手牌で配列を生成
        // var [paiTypelist, paiNolist] = exchange_paiga_array(); // ES2015のみ(IE11非対応)
        var paiList = exchange_paiga_array();
        // 手牌がない時は空欄で終わり
        var txt = !paiList[0].length ? "" : exchange_paiga_to_txt(paiList[0], paiList[1]);
        $("#tehaitxt").val(txt);
        $("#tehai_setting p").addClass("open");
    } else if (flg == 2){ // 設定画面
        $("#main").append("<div id='longpopup'><div class='scroll_area'></div></div>");
        $("#longpopup").append("<img id='close_button' src='./img/close.png' onclick='popup_window(0)'>");
        close_button_size();
        settings_Display();
        $("#setting p").addClass("open");
    } else if (flg == 3) { // その他画面
        $("#main").append("<div id='longpopup'><div class='scroll_area'></div></div>");
        $("#longpopup").append("<img id='close_button' src='./img/close.png' onclick='popup_window(0)'>");
        close_button_size();
        other_Display();
        $("#other p").addClass("open");
    }
    Wno = flg;
}

// ポップアップのクローズボタンはサイズ調整したいので別関数
function close_button_size() {
    var close_button = -$("#close_button").width() / 2.2;
    $("#close_button").css("top", close_button + "px");
    $("#close_button").css("right", close_button + "px");
}

// ==============================================================
// 手牌入力画面を構築
function paiinput_Display() {
    // 手牌画像一覧
    var list = "<div id=\"all_pailist\"><div id='twitter_button' onclick='twitter_post()'>ツイートする</div><br>・手牌を直接入力<br><br>";
    for (var paiNo = 0; paiNo < 3; paiNo++){
        list += "　" + paiimg_Output([paiNo, paiNo, paiNo, paiNo, paiNo, paiNo, paiNo, paiNo, paiNo, paiNo], [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
        list += "<br>";
    }
    list += "　" + paiimg_Output([3, 3, 3, 3, 3, 3, 3], [1, 2, 3, 4, 5, 6, 7]);
    list += "<img src=\"./img/reset.png\" id=\"reset_button\">";
    list += "<br>";
    list += "</div><br>";
    // 手牌テキスト入力
    list += "<div>";
    // 入力例
    list += "<div id=\"tehai_ex\">・手牌をテキストで入力(自動反映)<br>入力例：22567m067p567s33z <br>"
    list += "出力時：" + paiimg_Output([0,0,0,0,0,1,1,1,2,2,2,3,3], [2,2,5,6,7,0,6,7,5,6,7,3,3]);
    list += "</div><br>";
    list += "<input type=\"text\" id=\"tehaitxt\" placeholder=\"22567m067p567s33z\"></div><br>";
    // 手牌をランダム入力
    list += "<div>・手牌をランダムで作成<br><br>";
    list += "<img src=\"./img/tehai_make.png\" id=\"tehai_make_button\">";
    list += "</div><br>";
    $("#popup > .scroll_area").append(list);
}

// 牌テキストと牌画をリアルタイムで反映させる
$(document).on('input', '#tehaitxt', function () {
    tehai_txt = $('#tehaitxt').val();
    // var [paiTypelist, paiNolist] = exchange_txt_to_paiga(tehai_txt); // ES2015のみ(IE11非対応)
    var pailist = exchange_txt_to_paiga(tehai_txt);
    // 牌画を反映させる
    $("#paiTehai").empty();
    if (pailist[0].length && pailist[1].length) {
        // 後ろから順にリスト化してるので先頭から出力するために配列を逆にする
        $("#paiTehai").append(paiimg_Output(pailist[0].reverse(), pailist[1].reverse()));
    }
})
    // input入力からフォーカスアウトしたら自動理牌する
    .on('focusout', '#tehaitxt', function () {
        tehai_reload();
        // 1m1m1m1m1mってされると1度では消えないので強引に処理して更新する
        $('#tehaitxt').val($('#tehaitxt').val().replace(/([0-9])\1{4,}/g, "$1$1$1$1"));
        $('#tehaitxt').val($('#tehaitxt').val().replace(/(0|5)(5){3,}/g, "$1$2$2$2"));
        tehai_reload();
    });

//牌テキストと牌画を自動理牌して更新(テキストを牌画に反映)
function tehai_reload() {
    // 自動理牌の配列を生成
    var pais = tehai_calc_reload(); // 所持手牌の更新は必ずする
    if (!settings.ripai) return;
    var txt_to_paiType = { m: 0, p: 1, s: 2, z: 3 };
    var t_txt = tehai_txt;
    // if ([2, 5, 8, 11, 14].includes(pais)) { // ES2015のみ(IE11非対応)
    if ([2, 5, 8, 11, 14].indexOf(pais) >= 0) {
        // ツモは右端固定にするため別処理
        t_txt = tehai_txt.slice(0, -2);
        // var [tumoNo, tumoType] = tehai_txt.slice(-2).split(""); // ES2015のみ(IE11非対応)
        var tumo = tehai_txt.slice(-2).split("");
        if (!t_txt.match(/[mpsz]$/)) t_txt += tumo[1]; // 連番だった場合はpaiTypeをつけ直す
    }
    // var [paiTypelist, paiNolist] = exchange_txt_to_paiga(t_txt); // ES2015のみ(IE11非対応)
    var paiList = exchange_txt_to_paiga(t_txt);
    paiList = tehai_sort(paiList[0], paiList[1]);
    $("#paiTehai").empty();
    if (paiList[0].length && paiList[1].length) {
        // ソートしてるのでそのまま画像を出力
        $("#paiTehai").append(paiimg_Output(paiList[0], paiList[1]));
        // テキストも整形して出力
        var txt = exchange_paiga_to_txt(paiList[0], paiList[1]);
        $("#tehaitxt").val(txt);
        tehai_txt = txt;
        // ツモを最後に追加
        // if ([2, 5, 8, 11, 14].includes(pais)) { // ES2015のみ(IE11非対応)
        if ([2, 5, 8, 11, 14].indexOf(pais) >= 0) {
            $("#paiTehai").append("<img class=\"paiimg pai" + txt_to_paiType[tumo[1]] + tumo[0] + "\" src=\"./pie_img/" + paiImg[txt_to_paiType[tumo[1]]][tumo[0]].src + "\">");
            $("#tehaitxt").val(txt + tumo[0] + tumo[1]);
            tehai_txt = txt + tumo[0] + tumo[1];
        }
        reload_flg = 1;
    }
}

// 牌画を選択して追加
$(document).on("click", "#popup .scroll_area div:not(#tehai_ex) > .paiimg", function () {
    var exchange_paiType_to_txt = ["m", "p", "s", "z"];
    if ($("#paiTehai img").length >= 14) return;
    // クラス名から牌の種類を取得
    // var [paiType, paiNo] = pai_class(this); // ES2015のみ(IE11非対応)
    var pai = pai_class(this);
    // 牌の個数があってるかチェック
    if (gametype3pai(pai[0], pai[1])) {
        return;
    } else if (pai[1] == 0) {
        // 既に赤牌が入力されていないかチェック
        if (tehai[pai[0]][0] == 1 || tehai[pai[0]][5] == 4) return;
    } else if (pai[1] == 5 && Number(pai[0]) < 3) {
        // 通常の五の場合は既に赤牌込で4個になっていないかチェック
        if (tehai[pai[0]][0] + tehai[pai[0]][5] == 4) return;
    } else{
        // その他は同じ牌が4個以上ないかチェック
        if (tehai[pai[0]][pai[1]] >= 4) return;
    }
    // 問題ないので追加して自動理牌
    $("#tehaitxt").val($("#tehaitxt").val() + pai[1] + exchange_paiType_to_txt[Number(pai[0])]);
    tehai_txt += pai[1] + exchange_paiType_to_txt[Number(pai[0])];
    $("#paiTehai").append("<img class=\"paiimg pai" + pai[0] + pai[1] + "\" src=\"./pie_img/" + paiImg[pai[0]][pai[1]].src + "\">");
    tehai_reload();
});

// 手牌リセットボタン
$(document).on("click", "#reset_button", function () {
    $("#tehaitxt").val("");
    tehai_txt = "";
    $("#paiTehai").empty();
    tehai = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    reload_flg = 1;
});

// 手牌自動作成ボタン
$(document).on("click", "#tehai_make_button", function () {
    // ランダム生成した牌山から作成する
    makePaiYama();
    // var [paiTypelist, paiNolist] = tehai_Import(); // ES2015のみ(IE11非対応)
    // [paiTypelist, paiNolist] = tehai_sort(paiTypelist, paiNolist); // ES2015のみ(IE11非対応)
    var pailist = tehai_Import();
    pailist = tehai_sort(pailist[0], pailist[1]);
    // 牌画を出力
    $("#paiTehai").empty();
    $("#paiTehai").append(paiimg_Output(pailist[0], pailist[1]));
    // 牌テキストを出力
    var txt = exchange_paiga_to_txt(pailist[0], pailist[1]);
    $("#tehaitxt").val(txt);
    tehai_txt = txt;
    tehai_calc_reload();
    reload_flg = 1;
});

// 手牌の牌画を選択して削除、有効牌の打牌を選択して手を進める
$(document).on("click", "#paiTehai .paiimg, #yukohai_area tr:nth-of-type(2n+1) img", function () {
    // ポップアップが表示されている時はただ消す
    if ($("#popup").length){
        // 牌画を削除
        $(this).remove();
        // var [paiType, paiNo] = pai_class(this); // ES2015のみ(IE11非対応)
        var pai = pai_class(this);
        tehai[pai[0]][pai[1]]--;
        // 牌テキストを削除
        // 牌画削除の手牌で配列を生成
        // var [paiTypelist, paiNolist] = exchange_paiga_array(); // ES2015のみ(IE11非対応)
        var paiList = exchange_paiga_array();
        // 手牌がない時は空欄で終わり
        var txt = !paiList[0].length ? "" : exchange_paiga_to_txt(paiList[0], paiList[1]);
        $("#tehaitxt").val(txt);
        tehai_txt = txt;
        reload_flg = 1;
    } else if (!$("#popup").length) {
        var pais = tehai_calc_reload();
        makePaiYama(); // 手牌作成しないと山ができないので仕方なくここでも呼ぶ
        // if ([2, 5, 8, 11, 14].includes(pais)) { // ES2015のみ(IE11非対応)
        if ([2, 5, 8, 11, 14].indexOf(pais) >= 0) {
            var exchange_paiType_to_txt = ["m", "p", "s", "z"];
            // 打牌
            let pai_class = $(this).attr("class").split(" ");
            $("#paiTehai ." + pai_class[1])[0].remove();
            // 牌テキストを削除
            // 牌画削除の手牌で配列を生成
            // var [paiTypelist, paiNolist] = exchange_paiga_array(); // ES2015のみ(IE11非対応)
            var paiList = exchange_paiga_array();
            // 手牌がない時は空欄で終わり
            var txt = !paiList[0].length ? "" : exchange_paiga_to_txt(paiList[0], paiList[1]);
            $("#tehaitxt").val(txt);
            tehai_txt = txt;
            // ポップアップが表示されていないときは何切る中なので手を進める
            let flg = 0;
            do {
                var index = Rand(yama.length - 1);
                // var [paiType, paiNo] = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo]; // ES2015のみ(IE11非対応)
                var pai = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo];
                // ツモ条件を満たしていたらOK
                if (!((pai[1] == 0 && tehai[pai[0]][0] == 1 || tehai[pai[0]][5] == 4) || // 赤5ツモのとき、既に使用済みか5が4枚あるとき
                    (pai[1] == 5 && Number(pai[0]) < 3 && tehai[pai[0]][0] + tehai[pai[0]][5] == 4) || // 黒5ツモのとき、赤と合わせて4枚あるとき
                    (tehai[pai[0]][pai[1]] == 4) || // その牌が4枚あるとき
                    (gametype3pai(pai[0], pai[1])))) { // 三麻かつ2～8の萬子だったとき
                    flg = 1;
                }
            } while (flg == 0);
            // ツモ
            $("#tehaitxt").val($("#tehaitxt").val() + pai[1] + exchange_paiType_to_txt[Number(pai[0])]);
            tehai_txt = tehai_txt + pai[1] + exchange_paiType_to_txt[Number(pai[0])];
            $("#paiTehai").append("<img class=\"paiimg pai" + pai[0] + pai[1] + "\" src=\"./pie_img/" + paiImg[pai[0]][pai[1]].src + "\">");
            tehai_reload();
            // 新しい手牌で何切るチェック
            main_process();
        } else {
            alert("打牌機能は手牌が2枚,5枚,8枚,11枚,14枚のみ使用できます");
        }
    }
});

// 有効牌、受入良化牌を直接選択したら打牌しつつその牌をツモる
$(document).on("click", "#yukohai_area tr:nth-of-type(2n) img", function () {
    // ポップアップが表示されている時はただ消す
    var pais = tehai_calc_reload();
    makePaiYama(); // 手牌作成しないと山ができないので仕方なくここでも呼ぶ
    // if ([2, 5, 8, 11, 14].includes(pais)) { // ES2015のみ(IE11非対応)
    if ([3, 6, 9, 12].indexOf(pais) == -1) {
        var exchange_paiType_to_txt = ["m", "p", "s", "z"];
        // 打牌
        if ([2, 5, 8, 11, 14].indexOf(pais) >= 0) { // 上に表示されてる牌で打牌
            // 気持ち悪いけど有効牌/良形手替わり牌をクリックしたらimg<div<td<tr-tr>td>img.classと移動して打牌を取得する
            let pai_class = $(this).parent().parent().parent().prev().children().children().attr("class").split(" ");
            $("#paiTehai ." + pai_class[1])[0].remove();
            // 牌テキストを削除
            // 牌画削除の手牌で配列を生成
            // var [paiTypelist, paiNolist] = exchange_paiga_array(); // ES2015のみ(IE11非対応)
            var paiList = exchange_paiga_array();
            // 手牌がない時は空欄で終わり
            var txt = !paiList[0].length ? "" : exchange_paiga_to_txt(paiList[0], paiList[1]);
            $("#tehaitxt").val(txt);
            tehai_txt = txt;
        }
        // 有効牌、良形手替わりでツモをする
        let pai_class = $(this).attr("class").split(" ");
        if(pai_class != "pai-1-1"){ // 裏は自分でツモってください
            let pai = pai_class[1].match(/(\d)(\d)/);
            // ツモ
            $("#tehaitxt").val($("#tehaitxt").val() + pai[2] + exchange_paiType_to_txt[Number(pai[1])]);
            tehai_txt = tehai_txt + pai[2] + exchange_paiType_to_txt[Number(pai[1])];
            $("#paiTehai").append("<img class=\"paiimg pai" + pai[0] + "\" src=\"./pie_img/" + paiImg[pai[1]][pai[2]].src + "\">");
            tehai_reload();
            // 新しい手牌で何切るチェック
            main_process();
        }
    } else {
        alert("手牌が3枚,6枚,9枚,12枚の時は使用できません");
    }
});

// 手牌をTwitterに共有するボタン
// Twitterに何切るを簡易投稿
function twitter_post() {
    // 改行「%0D%0A」半角スペース「%2C」左鉤括弧「%E3%80%8C」右鉤括弧「%E3%80%8D」
    var tweet_tehai = exchange_txt_to_tweet(tehai_txt);
    if (tehai_txt == "") {
        alert("手牌が入力されている場合のみ投稿できます");
        return;
    } else if (pairi_gametype_check()) {
        alert("三麻は萬子の2～8牌を取り除いてる場合のみ投稿できます");
        return;
    } else if (tweet_tehai == "NG") {
        alert("手牌が2枚、5枚、8枚、11枚、14枚の場合のみ投稿できます");
        return;
    }
    var link = "%0D%0Ahttps://hako2d-mj.xii.jp/mahjong_tool/soul.html?" + tehai_txt + "%0D%0A";
    var text = "何を切る？%0D%0A%E3%80%8C" + tweet_tehai + "%E3%80%8D";
    var hash = "麻雀%2C何切る%2C雀魂%2C二次箱牌理ツール";
    var url = "https://twitter.com/share?";
    url += "url=" + link;
    url += "&text=" + text;
    url += "&hashtags=" + hash;
    window.open(url, "post_twitter");
}

// ツイート用にわかりやすく表示を変換
function exchange_txt_to_tweet(tehai_txt) {
    var pailist = exchange_txt_to_paiga(tehai_txt);
    var paiType_to_txt = ["m", "p", "s", ""]; // 字牌は漢字に変換済みなので必要なし
    var no_to_jihai = ["無", "東", "南", "西", "北", "白", "発", "中"];
    var txt = "";
    var t = pailist[0].reverse(), n = pailist[1].reverse();
    var paiType = t[0];
    for (var i = 0; i < t.length - 1; i++) {
        // 種類が切り替わったら1つ前の記号を入れる
        if (paiType != t[i]) {
            txt += paiType_to_txt[t[i - 1]];
            paiType = t[i];
        }
        if (paiType == 3) {
            txt += no_to_jihai[n[i]];
        } else {
            txt += n[i] != 0 ? n[i] : "赤5";
        }
    }
    if ([2, 5, 8, 11, 14].indexOf(t.length) < 0) return "NG";
    // 最後の記号を付け足す
    var last_paiType = t[t.length - 1];
    // 赤5 -> 字牌 -> それ以外
    txt += " ツモ";
    txt += n[i] == 0 ? "赤5" : t[t.length - 1] == 3 ? no_to_jihai[n[n.length - 1]] : n[n.length - 1];
    txt += paiType_to_txt[last_paiType];
    return txt;
}

// ==============================================================
// 各種設定する画面を構築
function settings_Display() {
    var list = "<p>設定</p>";
    var html_list = setting_html();
    for (var i = 0; i < html_list.length; i++){
        list += html_list[i];
    }
    // 設定状態をHTMLに反映
    $("#longpopup > .scroll_area").append(list);
    for (let key in settings) {
        setings_reload(key, 0);
    }
}

// 変更された設定を更新(画面開いたタイミングも含む)
function setings_reload(elmName, flg) {
    if (/kind\d/.test(elmName)) {
        if (!flg) { // ポップアップ表示時
            settings[elmName] ? $("#" + elmName).prop("checked", true) : $("#" + elmName).prop("checked", false);
        }
        settings[elmName] = $("#" + elmName).prop("checked");
        settings[elmName] ? $("#" + elmName).parent().addClass("check") : $("#" + elmName).parent().removeClass("check");
    } else {
        let name1 = elmName + "1", name0 = elmName + "0";
        if (!flg) { // ポップアップ表示時
            settings[elmName] ? $("#" + name1).prop("checked", true) : $("#" + name1).prop("checked", false);
            settings[elmName] ? $("#" + name0).prop("checked", false) : $("#" + name0).prop("checked", true);
        }
        settings[elmName] = Number($("#" + name1).prop("checked"));
        // 文字色等更新
        if (elmName == "ryokedisp") {
            // 受入良化牌は連動型
            settings[elmName] ? $("#" + name1).parent().addClass("check") : $("#" + name1).parent().removeClass("check");
            settings[elmName] ? $("#" + name0).parent().removeClass("check") : $("#" + name0).parent().addClass("check");
            // 受入良化牌を表示しない時は有効牌と分けるかのチェックボックスを無効にする
            if (settings.ryokedisp) { // 有効
                $("form input[name=order]").prop("disabled", false);
                $("form input[name=pindisp]").prop("disabled", false);
                settings.order ? $("#order1").parent().addClass("check") : $("#order0").parent().addClass("check");
                settings.pindisp ? $("#pindisp1").parent().addClass("check") : $("#pindisp0").parent().addClass("check");
            } else { // 無効
                $("form input[name=order]").prop("disabled", true);
                $("form input[name=pindisp]").prop("disabled", true);
                // 選択できないので文字色も非アクティブ
                settings.order ? $("#order1").parent().removeClass("check") : $("#order0").parent().removeClass("check");
                settings.pindisp ? $("#pindisp1").parent().removeClass("check") : $("#pindisp0").parent().removeClass("check");
            }
        } else if (elmName == "nakidisp") {
            // 鳴き牌は連動型
            settings[elmName] ? $("#" + name1).parent().addClass("check") : $("#" + name1).parent().removeClass("check");
            settings[elmName] ? $("#" + name0).parent().removeClass("check") : $("#" + name0).parent().addClass("check");
            // 受入良化牌を表示しない時は有効牌と分けるかのチェックボックスを無効にする
            if (settings.nakidisp) { // 有効
                $("form input[name*=nakikind]").prop("disabled", false);
                $("form input[name*=nakikind]").each(function (i, elem) {
                    let type = elem.name;
                    if (settings[type]) $("#" + type).parent().addClass("check");
                });
            } else { // 無効
                // 選択できないので文字色も非アクティブ
                $("form input[name*=nakikind]").prop("disabled", true);
                $("form input[name*=nakikind]").each(function (i, elem) {
                    let type = elem.name;
                    if (settings[type]) $("#" + type).parent().removeClass("check");
                });
            }
        } else {
            settings[elmName] ? $("#" + name1).parent().addClass("check") : $("#" + name1).parent().removeClass("check");
            settings[elmName] ? $("#" + name0).parent().removeClass("check") : $("#" + name0).parent().addClass("check");
        }
    }
    if (debug) console.log(settings);
}

// 設定が変更されたら都度更新する
$(document).on("click", "form input", function () {
    setings_reload($(this).attr("name"), 1);
    reload_flg = 1;
});

// ==============================================================
// その他諸々の画面を構築
function other_Display() {
    var list = "<p>その他</p>";
    var html_list = other_html();
    for (var g = 0; g < html_list.length; g++) {
        list += "<div class='other_header'>" + html_list[g][0] + "</div>"; // ヘッダー
        list += "<div class='other_body'>";
        for (var i = 1; i < html_list[g].length; i++) {
            list += html_list[g][i];
            list += "<br>";
        }
        list += "</div>";
    }
    $("#longpopup > .scroll_area").append(list);
}

// ヘッダーをクリックしたらスライドイン表示をする(告知と同じ)
$(document).on("click", "#longpopup div.other_header", function () {
    if ($(this).next("div").css("opacity") == 0){
        $(this).next("div").slideToggle(100); // スライドインとアウト同時に出来る関数
        $(this).next("div").animate({
                //ここがアニメーションの指定
                "opacity": "1",
            },
            100, // ミリ秒
            'linear',
            function () {
                $(this).prev().children("img").attr("src", "./img/nowopen.png");
            }
        );
    } else {
        $(this).next("div").animate({
            //ここがアニメーションの指定
            "opacity": "0",
            },
            100, // ミリ秒
            'linear',
            function () {
                $(this).prev().children("img").attr("src", "./img/nowclose.png");
            }
        );
        $(this).next("div").slideToggle(100);
    }

});

// 三麻の手牌になってるか確認
function pairi_gametype_check() {
    if (!settings.gametype) {
        // 三麻のとき、赤5か2～8牌があったら処理しない
        for (var paiNo = 0; paiNo < 10; paiNo++) {
            if (paiNo == 1 || paiNo == 9) continue;
            if (tehai[0][paiNo] > 0) {
                return 1;
            }
        }
    }
    return 0;
}

// 処理する前に設定や手牌が問題ないか確認
function irregular_check(pais) {
    if (pairi_gametype_check()) {
        $('#normal_syanten').html("三麻では萬子の2～8牌を<br>含んでいる手牌を処理できません。");
        return 1;
    } else if ([3, 6, 9, 12].indexOf(pais) >= 0) {
        $('#normal_syanten').html("手牌が3枚、6枚、9枚、12枚<br>の場合は処理できません。");
        return 1;
    } else if (!settings.kind0 && !settings.kind1 && !settings.kind2) {
        $('#normal_syanten').html("有効牌の設定を見直してください");
        return 1;
    } else if (pais <= 12 && !settings.kind0) {
        $('#normal_syanten').html("鳴き手牌は一般形のみ処理できます");
        return 1;
    } else if (!pais) {
        $('#syanten_area span:first-child').html("<br>二次箱牌理ツール");
        return 1;
    }
}

// ==============================================================
// 牌テキストを牌画出力配列に変換
function exchange_txt_to_paiga(t_txt) {
    // 牌テキストを取得
    var tehai_array = t_txt.split("");
    var txt_to_paiType = { m: 0, p: 1, s: 2, z: 3 };
    var paiType, paiTypelist = [], paiNolist = [];
    for (var i = tehai_array.length - 1; i >= 0; i--) {
        // if (["m", "p", "s", "z"].includes(tehai_array[i])) { // ES2015のみ(IE11非対応)
        if (["m", "p", "s", "z"].indexOf(tehai_array[i]) >= 0) {
            paiType = txt_to_paiType[tehai_array[i]]; // 記号をindexに変換
            continue;
        }
        // 牌画データを生成
        if (!paiType && paiType != 0) continue;
        paiTypelist.push(paiType);
        paiNolist.push(Number(tehai_array[i]));
        // 14枚以上は勝手に切る
        if (paiTypelist.length >= 14) break;
    }
    return [paiTypelist, paiNolist];
}

// 牌画出力配列を牌テキストに変換
function exchange_paiga_to_txt(t, n) {
    var paiType_to_txt = ["m", "p", "s", "z"];
    var txt = "";
    var paiType = t[0];
    for (var i = 0; i < t.length; i++) {
        // 種類が切り替わったら1つ前の記号を入れる
        if (paiType != t[i]) {
            txt += paiType_to_txt[t[i - 1]];
            paiType = t[i];
        }
        txt += n[i];
    }
    // 最後の記号を付け足す
    txt += paiType_to_txt[t[t.length - 1]];
    return txt;
}

// 現在の手牌を牌画出力配列に変換
function exchange_paiga_array() {
    var paiTypelist = [], paiNolist = [];
    $("#paiTehai .paiimg").each(function () {
        // let [paiType, paiNo] = pai_class(this); // ES2015のみ(IE11非対応)
        let pais = pai_class(this);
        paiTypelist.push(pais[0]);
        paiNolist.push(pais[1]);
    });
    return [paiTypelist, paiNolist];
}

// 牌画から手牌の計算用配列を更新
function tehai_calc_reload() {
    var pais = 0;
    tehai = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    $("#paiTehai .paiimg").each(function () {
        // let [paiType, paiNo] = pai_class(this); // ES2015のみ(IE11非対応)
        let pai = pai_class(this);
        tehai[pai[0]][pai[1]]++;
        pais++;
    });
    return pais; // 手牌の枚数を返す
}

// 牌画から牌種を取得
function pai_class(elm) {
    // var [hoge, paiType, paiNo] = $(elm).attr("class").match(/(\d)(\d)/); // ES2015のみ(IE11非対応)
    var pais = $(elm).attr("class").match(/(\d)(\d)/);
    return [pais[1], pais[2]];
}

// 良形手替わりの処理軽減用に1枚も使ってない色の数牌は判定しない
function used_paitype(t) {
    // return [sum(t[0]) >= 1, sum(t[1]) >= 1, sum(t[2]) >= 1, sum(t[3]) >= 1];
    return [1, 1, 1, 1];
}

// ==============================================================
// ウィンドウサイズ・フォントサイズ調整
function window_orientationchange() {
    var w, h;
    if ($(window).innerHeight() >= $(window).innerWidth()) {
        h = $(window).innerHeight();
        w = $(window).innerWidth();
        vertical_display(h, w)
    } else {
        h = $(window).innerWidth();
        w = $(window).innerHeight();
        wide_display(h, w)
    }
    // 共通処理
    close_button_size();
}

// ウィンドウサイズ・フォントサイズ調整
function window_load() {
    var h = $(window).innerHeight();
    var w = $(window).innerWidth();
    $(window).innerHeight() >= $(window).innerWidth() ? vertical_display(h, w) : wide_display(h, w);
    // 共通処理
    close_button_size();
    // 手牌指定で飛んできたら即見れるようにする
    var param = location.search;
    if (param != "") {
        tehai_txt = param.slice(1);
        tehai_reload();
        main_process();
    }
}

//　縦向きの調整
function vertical_display(h, w) {
    $("#main").height("80%");
    $("#main").width("100%");
    $("#yukohai_area").height("90%");
    $("#paiTehai").height("10%");
    $("#paiTehai").width("100%");
    $("#menu").height("10%");
    $("#menu").width("100%");
    $("#menu").css("flex-flow", "");
    $("#menu .menu_button").height("100%");
}

//　横向きの調整
function wide_display(h, w) {
    $("#main").height("75%");
    $("#main").width("90%");
    $("#yukohai_area").height("90%");
    $("#paiTehai").height("25%");
    $("#paiTehai").width("90%");
    $("#menu").height("100%");
    $("#menu").width("10%");
    $("#menu").css("flex-flow", "column");
    $("#menu .menu_button").height("33.33%");
}

$(window).on('orientationchange resize', function () { // 画面回転
        window_orientationchange();
});

$(document).on("contextmenu", "img", function () {
    return false;
});