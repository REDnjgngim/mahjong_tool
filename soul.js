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
    "kind0": true,
    "kind1": true,
    "kind2": true,
    "yukodisp": true,
    "ryokedisp": true,
    "order": true,
    "ripai": true
};
var timedebug = 0;
var debug = 0;
var debug2 = 0;
//==============================================================================
// シャンテン数とか有効牌を処理するメイン関数

// 牌理処理セット
function main_process() {
    var startTime = new Date();
    // 計算用手牌を更新して枚数を取得
    $("#yukotable").empty();
    $('#syanten_area span').html("");
    $('#syanten_area span').removeClass();
    var pais = tehai_calc_reload();
    if (!pais || [3, 6, 9, 12].indexOf(pais) >= 0 ||
        (!settings.kind0 && !settings.kind1 && !settings.kind2)) return;
    var index = 0;
    // 向聴数をチェック
    var syantenlist = pairiCheck(pais);
    var usedpaitype = used_paitype(tehai);
    syanten_output(syantenlist, pais);
    // 有効牌チェック
    if (debug) console.log("有効牌=======================================");
    var tablelist = [[], {}];
    var min_syanten = Math.min(syantenlist[0], syantenlist[1], syantenlist[2]);
    // if ([2, 5, 8, 11, 14].includes(pais)) { // ES2015のみ(IE11非対応)
    // 打牌毎にチェック
    if ([2, 5, 8, 11, 14].indexOf(pais) >= 0) {
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 0; paiNo < 10; paiNo++) {
                // 赤は黒五がないときだけ打牌候補に入れる
                if (!tehai[paiType][paiNo] || (paiNo == 0 && tehai[paiType][5])) continue;
                if (debug) console.log("////////////////////打 " + paiImg[paiType][paiNo].paiName);
                tehai[paiType][paiNo]--;
                pairiCheck2(tablelist, min_syanten, pais, paiType, paiNo);
                if (tablelist[0][index] && settings.ryokedisp){
                    tablelist[0][index].ryokelist = nextmain_process(min_syanten, pais, usedpaitype, paiType, paiNo);
                    index++;
                }
                tehai[paiType][paiNo]++;
            }
        }
    } else { // 打牌候補がないので現在の手牌で有効牌を算出
        pairiCheck2(tablelist, min_syanten, pais, -1, -1);
        if (tablelist[0][index] && settings.ryokedisp) {
            tablelist[0][index].ryokelist = nextmain_process(min_syanten, pais, usedpaitype, "", "");
            index++;
        }
    }
    if (min_syanten >= 0) yukohai_output(tablelist);
    var endTime = new Date();
    if (timedebug) console.log('経過時間：' + (endTime.getTime() - startTime.getTime()) + 'ミリ秒');
}

// ==============================================================
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

// 良形手替わりになる可能性のあるツモ(孤立牌のくっつき牌)をリスト化する
function tumokohocheck() {
    var tempTehai = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var yukohaitable = yukoupai_table();
    for (var paiNo = 1; paiNo < 8; paiNo++) {
        if (!tehai[3][paiNo] || tempTehai[3][paiNo]) continue;
        tempTehai[3][paiNo]++;
    }
    for (var paiType = 0; paiType < 3; paiType++) {
        for (var paiNo = 0; paiNo < 10; paiNo++) {
            if (!tehai[paiType][paiNo]) continue;
            var list = yukohaitable["-" + paiNo];
            for (var i = 0; i < yukohaitable["-" + paiNo].length; i++) {
                if (tempTehai[paiType][list[i]]) continue;
                tempTehai[paiType][list[i]]++;
            }
        }
    }
    return tempTehai;
}

// 有効牌を表示
function yukohai_output(tablelist) {
    if (debug) console.log(tablelist);
    // 良形変化込でソートしつつ良形変化用の手牌フラグを作成
    tablelist_sort(tablelist);
    for (var id = 0; id < tablelist[0].length; id++){
        // 最初に良形手替わりになる牌を探す
        var yukopais = "", ryokepais = "";
        // 打牌のヘッダー
        var header = "<tr class='table_header'><td>打：" + "<img class='paiimg pai" + tablelist[0][id].css + "' src='./pie_img/" + tablelist[0][id].img + ".png'><br>有効牌：" + tablelist[0][id].typecount + "種" + tablelist[0][id].nocount + "枚";
        if (settings.ryokedisp) header += " / 良形変化：" + tablelist[0][id].ryoketypecount + "種" + tablelist[0][id].ryokenocount + "枚";
        $("#yukotable").append(header + "</td></tr>");
        if (!settings.yukodisp) continue;
        for (var paiType = 0; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (settings.order) {
                    // 有効牌画像を追加
                    if (tablelist[1][tablelist[0][id].index][paiType][paiNo]) yukopais += "<img class='paiimg pai" + paiType + paiNo + "' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                    if (!settings.ryokedisp) continue; // 良形変化牌表示しない
                    // 良形手替わり牌を追加
                    if (tablelist[0][id].ryoketehai[paiType][paiNo]) ryokepais += "<img class='paiimg pai" + paiType + paiNo + " ryoke' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                } else {
                    // 有効牌画像を追加
                    if (tablelist[1][tablelist[0][id].index][paiType][paiNo]) yukopais += "<img class='paiimg pai" + paiType + paiNo + "' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                    if (!settings.ryokedisp) continue; // 良形変化牌表示しない
                    // 良形手替わり牌を追加
                    if (tablelist[0][id].ryoketehai[paiType][paiNo]) yukopais += "<img class='paiimg pai" + paiType + paiNo + " ryoke' src='./pie_img/" + paiImg[paiType][paiNo].src + "'>";
                }
            }
        }
        if (ryokepais != "" && settings.ryokedisp && settings.order) {
            yukopais += "<br>" + ryokepais;
        }
        $("#yukotable").append("<tr class='table_data'><td>" + yukopais + "</td></tr>");
    }
}

// もう一つ先の手牌も評価して良形変化となるかをチェックする
function nextmain_process(min_syanten, pais, usedpaitype, daType, daNo) {
    var list = [];
    // 有効牌確認後、ツモによって良形変化する牌があるかチェック
    for (var paiType = 0; paiType < 4; paiType++) {
        // その牌種が1つもない場合はせいぜい良くて単騎待ちで明白なので、処理軽減を優先してカットする
        if (debug) console.log("牌種", paiType, "使用可否", usedpaitype[paiType]);
        if (!usedpaitype[paiType]) continue;
        for (var paiNo = 1; paiNo < 10; paiNo++) {
            if (paiType == 3 && (paiNo > 7 || paiNo == 0)) continue;
            if ((paiType == daType && paiNo == daNo)) continue; // 打牌をまたツモるのは不要
            // ツモ候補がない場合は全部、ある場合は孤立単騎待ちの良形変化以外を全て抽出
            var tablelist = [[], {}];
            tehai[paiType][paiNo]++;
            if (debug) console.log("**********ツモ", paiImg[paiType][paiNo].paiName);
            for (var paiType2 = 0; paiType2 < 4; paiType2++) {
                for (var paiNo2 = 0; paiNo2 < 10; paiNo2++) {
                    // 赤は黒五がないときだけ打牌候補に入れる
                    if (!tehai[paiType2][paiNo2] || (paiNo == 0 && tehai[paiType2][5])) continue;
                    if (debug) console.log("/////1巡先 打 " + paiImg[paiType2][paiNo2].paiName);
                    tehai[paiType2][paiNo2]--;
                    pairiCheck2(tablelist, min_syanten, pais, paiType, paiNo);
                    tehai[paiType2][paiNo2]++;
                }
            }
            if (tablelist[0].length){
                tablelist[0].sort(function (a, b) {
                    return b.nocount - a.nocount || b.typecount - a.typecount;
                });
                // 種類が増える、もしくは枚数が増えた場合は
                list.push(tablelist[0].shift());
                if (debug) console.log(list[list.length-1]);
            }
            tehai[paiType][paiNo]--;
        }
    }
    return list;
}

// 良形手替わり牌も全部ひっくるめてソートを掛ける
function tablelist_sort(t) {
    t[0].sort(function (a, b) {
        // 有効牌枚数＞有効牌種枚数＞良形変化枚数＞良形変化牌種
        return b.nocount - a.nocount || b.typecount - a.typecount;
    });
    if (!settings.ryokedisp) return; // 表示しない
    var maxTypecount = t[0][0].typecount, maxNocount = t[0][0].nocount;
    for (var id = 0; id < t[0].length; id++) {
        // 最初に良形手替わりになる牌を探す
        var ryokeTypec = 0, ryokeNoc = 0;
        var ryoketehai = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        var tempTehai = JSON.parse(JSON.stringify(tehai)); // 赤牌なしにする
        moveReddora(tempTehai);
        // 良形変化の枚数チェック
        for (var pai = 0; pai < t[0][id].ryokelist.length; pai++) {
            let pais = t[0][id].ryokelist[pai].index.split("");
            if (debug) console.log("打:", t[0][id].img, "ツモ:", t[0][id].ryokelist[pai].img);
            if (debug) console.log("maxtype:", maxTypecount, "maxno:", maxNocount, "typecount:", t[0][id].ryokelist[pai].typecount, "nocount:", t[0][id].ryokelist[pai].nocount);
            if ((maxTypecount <= t[0][id].ryokelist[pai].typecount && maxNocount < t[0][id].ryokelist[pai].nocount) ||
                (maxTypecount < t[0][id].ryokelist[pai].typecount && maxNocount <= t[0][id].ryokelist[pai].nocount)) {
                // シャンテンが進む牌は有効牌なので却下、4枚使ってた場合も不要
                if ((!t[1][t[0][id].index][pais[2]][pais[1]]) && (4 - tempTehai[pais[2]][pais[1]] > 0)) {
                    ryokeTypec++;
                    ryokeNoc += 4 - tempTehai[pais[2]][pais[1]]; // 現在の手牌基準で枚数を引く
                    ryoketehai[pais[2]][pais[1]]++;
                }
            }
        }
        // 大元に設定
        t[0][id].ryoketypecount = ryokeTypec;
        t[0][id].ryokenocount = ryokeNoc;
        t[0][id].ryoketehai = ryoketehai;
    }
    // tablelist[0].sort((a, b) => b.nocount - a.nocount || b.typecount - a.typecount); // ES2015のみ(IE11非対応)
    t[0].sort(function (a, b) {
        // 有効牌枚数＞有効牌種枚数＞良形変化枚数＞良形変化牌種
        return b.nocount - a.nocount || b.typecount - a.typecount || b.ryokenocount - a.ryokenocount || b.ryoketypecount - a.ryoketypecount;
    });
}

// ==============================================================
// ポップアップウィンドウ表示
function popup_window(flg) {
    // 0 = 非表示, 1 = 手牌入力画面
    // if ($("#popup") && flg == Wno) return;
    $("#popup, #longpopup").remove();
    $("#close_button").remove();
    $("#menu div p").removeClass("open");
    if (flg == 0 || flg == Wno) {
        if (Wno == 2 && settings.ripai) tehai_reload();
        main_process();
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
    // [paiTypelist, paiNolist] = exchange_txt_to_paiga(t_txt); // ES2015のみ(IE11非対応)
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
    if (pai[1] == 0) {
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
                var index = Rand(135);
                // var [paiType, paiNo] = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo]; // ES2015のみ(IE11非対応)
                var pai = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo];
                // ツモ条件を満たしていたらOK
                if (!((pai[1] == 0 && tehai[pai[0]][0] == 1 || tehai[pai[0]][5] == 4) ||
                    (pai[1] == 5 && Number(pai[0]) < 3 && tehai[pai[0]][0] + tehai[pai[0]][5] == 4) ||
                    (tehai[pai[0]][pai[1]] == 4))
                ) {
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

// 有効牌、良形変化牌を直接選択したら打牌しつつその牌をツモる
$(document).on("click", "#yukohai_area tr:nth-of-type(2n) img", function () {
    // ポップアップが表示されている時はただ消す
    var pais = tehai_calc_reload();
    makePaiYama(); // 手牌作成しないと山ができないので仕方なくここでも呼ぶ
    // if ([2, 5, 8, 11, 14].includes(pais)) { // ES2015のみ(IE11非対応)
    if ([3, 6, 9, 12].indexOf(pais) == -1) {
        var exchange_paiType_to_txt = ["m", "p", "s", "z"];
        // 打牌
        if ([2, 5, 8, 11, 14].indexOf(pais) >= 0) { // 上に表示されてる牌で打牌
            // 気持ち悪いけど有効牌/良形手替わり牌をクリックしたらimg<td<tr-tr>td>img.classと移動して打牌を取得する
            let pai_class = $(this).parent().parent().prev().children().children().attr("class").split(" ");
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
function twitter_post() { // 23457m2455p2467s6p335m1145p223577s1p
    // 改行「%0D%0A」半角スペース「%2C」左鉤括弧「%E3%80%8C」右鉤括弧「%E3%80%8D」
    if (tehai_txt == "") {
        alert("手牌が入力されている場合のみ投稿できます");
        return;
    }
    var link = "%0D%0Ahttps://hako2d-mj.xii.jp/mahjong_tool/soul.html?" + tehai_txt + "%0D%0A";
    var text = "何を切る？%0D%0A%E3%80%8C" + tehai_txt + "%E3%80%8D";
    var hash = "麻雀%2C何切る%2C雀魂";
    var url = "https://twitter.com/share?";
    url += "url=" + link;
    url += "&text=" + text;
    url += "&hashtags=" + hash;
    window.open(url, "post_twitter");
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
        if (elmName == "ripai" || elmName == "yukodisp"){
            settings[elmName] ? $("#" + name1).parent().addClass("check") : $("#" + name1).parent().removeClass("check");
            settings[elmName] ? $("#" + name0).parent().removeClass("check") : $("#" + name0).parent().addClass("check");
        } else { // 良形変化牌は操作が連鎖しているので別途処理
            settings[elmName] ? $("#" + name1).parent().addClass("check") : $("#" + name1).parent().removeClass("check");
            settings[elmName] ? $("#" + name0).parent().removeClass("check") : $("#" + name0).parent().addClass("check");
            // 良形変化牌を表示しない時は有効牌と分けるかのチェックボックスを無効にする
            if (settings.ryokedisp) { // 有効
                $("form input[name=order]").prop("disabled", false);
                settings.order ? $("#order1").parent().addClass("check") : $("#order0").parent().addClass("check");
            } else { // 無効
                $("form input[name=order]").prop("disabled", true);
                // 選択できないので文字色も非アクティブ
                settings.order ? $("#order1").parent().removeClass("check") : $("#order0").parent().removeClass("check");
            }
        }
    }
    if (debug) console.log(settings);
}

// 設定が変更されたら都度更新する
$(document).on("click", "form input", function () {
    setings_reload($(this).attr("name"), 1);
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
    return [sum(t[0]) >= 1, sum(t[1]) >= 1, sum(t[2]) >= 1, sum(t[3]) >= 1];
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