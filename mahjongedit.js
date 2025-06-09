'use strict';

var paiData = paiData();
var paiImg = paiImg();
// 手牌の配列：37種(0は赤、字はバッファ)
var tehai = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

const tehai_history_retention = 20; // 履歴保存数
var tehai_text = []; // テキスト式の手牌(配列)
var tehai_history = []; // 処理した手牌の履歴保存リスト
var historyIndex = 0; // 現在表示している手牌(添字)

// 詳細設定
var settings = {
    'gametype': 0, // 0 = 四麻, 1 = 三麻
    "kind0": true, "kind1": true, "kind2": true, // 0 = 一般手, 1 = 七対子, 2 = 国士無双
    "ripai": 0,  // 0 = 自動理牌, 1 = 理牌しない
};
var settingsReload = 0; // 設定が変更されたら1
var cookieAgree = false;

var MODE = 1; // 1 = 牌理編集、 2 = 局編集

//============================================================================

// 手牌更新
function tehaiReload(){
    // 最初にソート
    tehaiSort();
    // 手牌画像
    let paiImages = textToPaiImage_tehai(tehai_text);
    document.getElementById("paiTehai").innerHTML = paiImages;
    // テキスト形式の手牌
    document.getElementById("tehaiOutPutText").value = exchange_paigaToText(tehai_text);
    // 3の倍数の手牌は向聴数処理が正常にならないのでここで止める
    let error = irregular_check();
    if (error != "") {
        document.getElementById("mainArea").innerHTML = `<div id="syantenArea"><p>${error}</p></div>`;
        return;
    }
    // シャンテン数処理
    let [syanten, yukopaiList] = pairiCheck(tehai);
    // シャンテン数表示
    createHtml_tehaiSyanten(syanten);
    // 有効牌表示
    createHtml_tehaiYukopai(yukopaiList);
    // 更新したら現在の情報を履歴に追加
    tehai_history_write();
}

// 手牌の状況を保存
function tehai_history_write() {
    // 過去の手牌にいるときに処理したらそれより新しいものは全消し
    if (historyIndex < tehai_history.length - 1) {
        tehai_history.splice(historyIndex + 1);
    }

    // 結果のHTMLを丸ごと保存
    // sortableで保存情報を更新してるので注意
    tehai_history.push({
        "tehai": JSON.parse(JSON.stringify(tehai)),
        "tehai_text": [...tehai_text],
        "tehaiHTML": document.getElementById("paiTehai").innerHTML,
        "resultHTML": document.getElementById("mainArea").innerHTML,
        "tehaiInput": document.getElementById("tehaiOutPutText").value,
    });

    // 保存可能数を超えたら前から削除
    if (tehai_history.length > tehai_history_retention) {
        tehai_history.shift();
    }

    // index更新
    historyIndex = tehai_history.length - 1;
    historyButtonReload();
    historyRangeReload();
}

// 保存している手牌を表示
function tehaiComback(index) {
    // 一度リセットしてから過去の手牌をセット
    paiInitialize();

    tehai = JSON.parse(JSON.stringify(tehai_history[index].tehai));
    tehai_text = [...tehai_history[index].tehai_text];
    document.getElementById("paiTehai").innerHTML = tehai_history[index].tehaiHTML;
    document.getElementById("mainArea").innerHTML = tehai_history[index].resultHTML;
    document.getElementById("tehaiOutPutText").value = tehai_history[index].tehaiInput;

    historyIndex = index;

    historyButtonReload();
    historyRangeReload();
}

// 戻る進むボタンの表示判定
function historyButtonReload() {
    if(tehai_history.length < 2) return;

    // 戻るボタンのスタイルを設定
    if(historyIndex > 0){
        document.getElementById("historyButton_before").classList.remove("nonActive");
    }else{
        if(!document.getElementById("historyButton_before").classList.contains("nonActive")){
            document.getElementById("historyButton_before").classList.add("nonActive");
        }
    }

    // 進むボタンのスタイルを設定
    if(historyIndex < tehai_history.length - 1){
        document.getElementById("historyButton_after").classList.remove("nonActive");
    }else{
        if(!document.getElementById("historyButton_after").classList.contains("nonActive")){
            document.getElementById("historyButton_after").classList.add("nonActive");
        }
    }
}

// スライドバーの数値更新
function historyRangeReload() {
    document.getElementById("historyRange").max = tehai_history.length - 1;
    document.getElementById("historyRange").value = historyIndex;
}

// イベント発火関数 ============================================================================

document.addEventListener("click", function (e) {

    // 牌画を選択して追加
    if (e.target.matches("#allPaiList > .paiimg")) {
        if (tehai_text.length >= 14) return;
        // クラス名から牌の種類を取得
        let [paiTypeT, paiNo] = paiClass(e.target);
        tehaiCalc([`${paiNo}${paiTypeT}`]);
    }

    // 牌画を削除
    if (e.target.matches("#paiTehai .paiimg")) {
        // e.target.remove();
        let [paiTypeT, paiNo] = paiClass(e.target);
        let paiType = paiTypeToText(paiTypeT);
        tehai[paiType][paiNo]--;
        if(paiNo == 0) tehai[paiType][5]--;
        tehai_text.splice(tehai_text.indexOf(`${paiNo}${paiTypeT}`), 1);
        tehaiReload();
    }

    // 手牌リセットボタン
    if (e.target.matches("#reset_button")) {
        paiInitialize();
    }

    // 手牌自動作成ボタン
    if (e.target.matches("#tehai_make_button")) {
        paiInitialize();
        // ランダム生成した牌山から作成する
        let yama = makePaiYama();
        tehaiRemake(yama);
        tehaiReload();
    }

    // 打牌モード(有効牌画面内)
    if (e.target.matches("#yukopaiArea div:nth-of-type(2n+1) img")) {
        // 打牌を押したら何かしらをツモる
        if([2, 5, 8, 11, 14].includes(tehai_text.length)){
            // ツモをしている時のみ
            // e.target.remove();
            let [paiTypeT, paiNo] = paiClass(e.target);
            let paiType = paiTypeToText(paiTypeT);
            tehai[paiType][paiNo]--;
            if(paiNo == 0) tehai[paiType][5]--;
            tehai_text.splice(tehai_text.indexOf(`${paiNo}${paiTypeT}`), 1);
        }

        let yama = makePaiYama();
        do {
            let index = Math.floor(Math.random() * (yama.length - 1));
            let [paiType, paiNo] = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo];
            // ツモ条件を満たしていたらOK
            if(paiNo == 0 && (tehai[paiType][0] == 1 || tehai[paiType][5] == 4)) continue; // 赤5ツモのとき、既に使用済みか5が4枚あるとき
            if(tehai[paiType][paiNo] == 4) continue; // その牌が4枚あるとき
            if(notAvailable3GamePai(paiType, paiNo)) continue; // 三麻かつ2～8の萬子だったとき
            // ツモ条件を満たす
            let paiTypeT = paiTypeToText(paiType);
            tehaiCalc([`${paiNo}${paiTypeT}`]);
            break;
        } while (true);
    }

    // 打牌&有効牌ツモモード
    if (e.target.matches("#yukopaiArea div:nth-of-type(2n) img")) {
        // 有効牌を押したら打牌してツモる
        if([2, 5, 8, 11, 14].includes(tehai_text.length)){
            // ツモをしている時のみ
            let [paiTypeT, paiNo] = paiClass(e.target.parentElement.previousElementSibling.children[0]);
            let paiType = paiTypeToText(paiTypeT);
            tehai[paiType][paiNo]--;
            if(paiNo == 0) tehai[paiType][5]--;
            tehai_text.splice(tehai_text.indexOf(`${paiNo}${paiTypeT}`), 1);
        }

        // ツモ条件は有効牌なので満たしている
        let [paiTypeT, paiNo] = paiClass(e.target);
        tehaiCalc([`${paiNo}${paiTypeT}`]);
    }

    // 手牌履歴戻るボタン
    if (e.target.matches("#historyButton_before")) {
        if(historyIndex == 0) return;
        tehaiComback(historyIndex - 1);
    }

    // 手牌履歴進むボタン
    if (e.target.matches("#historyButton_after")) {
        if(historyIndex == tehai_history.length - 1) return;
        tehaiComback(historyIndex + 1);
    }

    // フッターの説明ボタン
    if (e.target.matches("#menuInfo")) {
        if(created_modalContent("info")) return;
        createHtml_menuInfo();
    }

    // フッターの編集ボタン
    if (e.target.matches("#menuSetting")) {
        if(created_modalContent("setting")) return;
        createHtml_settingInfo();
    }


});

document.addEventListener("change", function (e) {
    // テキスト入力が変化したら更新する
    if (e.target.matches("#tehaiOutPutText")) {
        tehai_text = [];
        tehai = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        tehaiCalc(exchange_textToPaiga(e.target.value));
    }

    // スライドバーが更新されたら手牌履歴を直接移動する
    if (e.target.matches("#historyRange")) {
        tehaiComback(Number.parseInt(e.target.value));
    }

    // 設定更新
    if (e.target.matches("#setting input")) {
        if(e.target.value == "on"){
            // チェックボックスはチェック状態を設定
            settings[e.target.name] = e.target.checked;
        }else{
            // ラジオボタンは値をそのまま設定
            settings[e.target.name] = Number.parseInt(e.target.value);
        }
        if (cookieAgree) {
            document.cookie = e.target.name + "=" + settings[e.target.name] + "; Max-Age=" + (60 * 60 * 24 * 1) + ";";
        }
        settingsReload = 1;
    }

    if(e.target.id == "trigger" && !e.target.checked && document.getElementById("setting")){
        // 編集ウィンドウが閉じられた時

        // 三麻に切り替え
        if(settings.gametype){
            // 所持手牌状況更新
            tehai_text = tehai_text.filter(pai => !["2m", "3m", "4m", "5m", "6m", "7m", "8m", "0m"].includes(pai));
            for(let paiNo = 0; paiNo <= 9; paiNo++){
                if(notAvailable3GamePai(0, paiNo)) tehai[0][paiNo] = 0;
            }
        }

        if(settingsReload){
            // 手牌パレット更新
            document.querySelectorAll("#allPaiList img:nth-of-type(-n+10)").forEach(function (img){
                let [paiTypeT, paiNo] = paiClass(img);
                if(notAvailable3GamePai(0, paiNo)){
                    // 三麻の2～8牌
                    if(!img.classList.contains("shadow")) img.classList.add("shadow");
                }else{
                    if(img.classList.contains("shadow")) img.classList.remove("shadow");
                }
            });
            // ソート処理更新
            SortableSet();
            // 手牌再処理
            tehaiReload();

            settingsReload = 0;
        }
    }
});

window.onload = function() {
    // 実行したい処理
    console.log("hogehoge");
    cookieSettings();
    createHtml_tehaiPalette();
    createHtml_tehaiPaletteSub();
    createHtml_tehaiArea();
    createHtml_historyStatus();
    SortableSet();
};

// HTML作成関数 ===========================================================================================

// シャンテン数表示エリア作成
function createHtml_tehaiSyanten(syanten){
    // 中身初期化
    document.getElementById("mainArea").innerHTML = "";

    let syantenArea = document.createElement("div");
    syantenArea.id = "syantenArea";

    let syantenStr = [];
    for(let i = 0; i < 3; i++){
        let str = syanten[0];
        if(syanten[i] == 0){
            str = `<span class="tenpai">聴牌</span>`;
        }else if(syanten[i] == -1){
            str = `<span class="hora">和了</span>`;
        }else{
            str = settings[`kind${i}`] ? `<span>${syanten[i]}</span>` : "<span> - </span>";
            if(i >= 1){
                if(tehai_text.length < 13) str = "<span> - </span>";
            }
        }
        syantenStr.push(str);
    }

    // 手牌画像一覧
    let content = `
        <p>シャンテン数</p>
        <p>一般手: ${syantenStr[0]}　　七対子: ${syantenStr[1]}　　国士無双: ${syantenStr[2]}</p>
    `;

    syantenArea.innerHTML = content;

    document.getElementById("mainArea").appendChild(syantenArea);
}

// 有効牌数表示エリア作成
function createHtml_tehaiYukopai(yukopaiList){
    let yukopaiCountList = yukopaiCount(yukopaiList, tehai);

    // ソート
    yukopaiCountList.sort((a, b) => {
        const order = { 'm': 1, 'p': 2, 's': 3, 'z': 4 };
        const typeA = order[a.dapai.slice(-1)];
        const typeB = order[b.dapai.slice(-1)];
        const noA = a.dapai.slice(0, 1);
        const noB = b.dapai.slice(0, 1);
        // 有効枚数が多い → 有効種類が多い → mpsz → 打牌の数字が小さい順
        return b.count - a.count || b.type - a.type || typeA - typeB || noA - noB;
    });

    // HTML構築
    let yukopaiContent = "";
    for (let index in yukopaiCountList) {
        let info = yukopaiCountList[index];

        // ヘッダー作成
        // 赤牌1枚だけ持ってる場合は打牌を赤表示にする
        let [paiNo, paiTypeT] = info.dapai.split("");
        let paiType = paiTypeToText(paiTypeT);
        if(paiNo == 5 && tehai[paiType][0] && tehai[paiType][paiNo] == 1) info.dapai = `0${paiTypeT}`;

        let dapaiImg = textToPaiImage([info.dapai]);
        let yukopaiHeader = `
            <div>
                打：${dapaiImg}　有効牌：${info.type}種${info.count}枚
            </div>
        `;

        // ボディ作成
        let paiList = textToPaiImage(info.imgList);
        let yukopaiBody = `
            <div>
                ${paiList}
            </div>
        `;
        yukopaiContent += yukopaiHeader + yukopaiBody;
    }

    let yukopaiArea = document.createElement("div");
    yukopaiArea.id = "yukopaiArea";
    yukopaiArea.innerHTML = yukopaiContent;

    document.getElementById("mainArea").appendChild(yukopaiArea);
}

// 手牌表示エリア作成
function createHtml_tehaiArea(){
    let paitehai = document.createElement("div");
    paitehai.id = "paiTehai";
    document.getElementById("subArea").appendChild(paitehai);
}

// 手牌パレット
function createHtml_tehaiPalette(){
    let allPailist = document.createElement("div");
    let container = document.createElement("div");
    allPailist.id = "allPaiList";

    let paiList = "";
    paiList += textToPaiImage([`1m`, `2m`, `3m`, `4m`, `5m`, `6m`, `7m`, `8m`, `9m`, `0m`]) + "<br>";
    paiList += textToPaiImage([`1p`, `2p`, `3p`, `4p`, `5p`, `6p`, `7p`, `8p`, `9p`, `0p`]) + "<br>";
    paiList += textToPaiImage([`1s`, `2s`, `3s`, `4s`, `5s`, `6s`, `7s`, `8s`, `9s`, `0s`]) + "<br>";
    paiList += textToPaiImage([`1z`, `2z`, `3z`, `4z`, `5z`, `6z`, `7z`]) + "\n";

    allPailist.innerHTML = `${paiList}`;
    container.appendChild(allPailist);

    document.getElementById("subArea").appendChild(container);
}

// 手牌テキスト入力・手牌関連ボタン
function createHtml_tehaiPaletteSub(){
    let paiEditButtons = document.createElement("div");
    paiEditButtons.id = "paiEditButtons";

    // 手牌画像一覧
    let content = `
        <div>
            <img src="./img/reset.png" id="reset_button">
        </div>
        <div>
            <img src="./img/tehai_make.png" id="tehai_make_button">
        </div>
        <div>
            <p>テキスト形式</p>
            <input type="text" id="tehaiOutPutText" placeholder="22567m067p567s33z"></div>
        </div>
    `;

    paiEditButtons.innerHTML = content;

    document.querySelector("#subArea > div").appendChild(paiEditButtons);
}

// 手牌の履歴更新
function createHtml_historyStatus(){

    // 手牌画像一覧
    let content = `
    <div>
        <img id="historyButton_before" src="./img/history_button.png" class="nonActive">
    </div>
    <div>
        <input type="range" id="historyRange" min="0" max="0">
    </div>
    <div>
        <img id="historyButton_after" src="./img/history_button.png" class="nonActive">
    </div>
    `;

    document.getElementById("history").innerHTML = content;
}

// 説明画面
function createHtml_menuInfo(){

    let content = "";
    let infoHtmlList = infoHtml();
    for (let g = 0; g < infoHtmlList.length; g++) {
        content += `
        <label for="menuGroup${g}">${infoHtmlList[g][0]}</label>
        <input id="menuGroup${g}" type="checkbox">
        <div class='InfoGroup'>
            <div>
                ${infoHtmlList[g][1]}
            </div>
        </div>
        `;
    }
    // 手牌画像一覧
    let infoContent = document.createElement("div");
    infoContent.id = "info";
    infoContent.innerHTML = `
        <p>説明</p>
        ${content}
    `;
    document.getElementById("modal_content").appendChild(infoContent);
}

// 各種設定する画面を構築
function createHtml_settingInfo() {
    let content = "";
    let settingHtmlList = settingHtml();
    for (let g = 0; g < settingHtmlList.length; g++) {
        let str = "";
        for (let i = 0; i < settingHtmlList[g].length; i++) {
            if(settingHtmlList[g][i] == ""){
                str += "<br>";
            }else{
                str += `<p>${settingHtmlList[g][i]}</p>`;
            }
        }
        content += `
        <div class='settingGroup'>
            ${str}
        </div>
        `;
    }
    // 編集画面
    // 手牌画像一覧
    let settingContent = document.createElement("div");
    settingContent.id = "setting";
    settingContent.innerHTML = `
        <p>牌理モード</p>
        <p>各設定項目の詳細については<br>「説明」→「使い方～設定画面～」をご覧ください</p>
        ${content}
    `;

    document.getElementById("modal_content").appendChild(settingContent);

    // HTMLに格納した直後に設定を反映
    for(let key in settings){
        let input = document.querySelector(`#setting input[name=${key}]`);
        if(input.value == "on"){
            // チェックボックス
            document.getElementById(`${key}`).checked = settings[key];
        }else{
            // ラジオボタン
            document.getElementById(`${key}${settings[key]}`).checked = true;
        }
    }
}

// モーダルウィンドウ内に作成したものは表示非表示のみ切り替えだけにする
function created_modalContent(content){
    let UnnecessaryCreateElement = 0;
    document.querySelectorAll(`#modal_content > div`).forEach(function(elm){
        if(elm.id == content){
            elm.style.display = "block";
            UnnecessaryCreateElement = 1;
        }else{
            elm.style.display = "none";
        }
    });
    return UnnecessaryCreateElement;
}

// 汎用関数 ===================================================================================================

// 0～maxまでの乱数を作る汎用関数
function Rand(max) {
    var random = Math.floor(Math.random() * (max + 1));
    return random;
}

// paiTypeの番号と文字を入れ替える
function paiTypeToText(type){
    let arr = {
        "m": "0", "p": "1", "s": "2", "z": "3"
    };
    if(/\d/.test(type)){
        // 数字の場合はキーとバリューを入れ替え
        arr = Object.fromEntries(Object.entries(arr).map(([key, value]) => [value, key]))
    }
    return arr[type];
}

// 牌画から牌種を取得
function paiClass(elm) {
    var [hoge, paiNo, paiTypeT] = elm.className.match(/pai(\d)(.)/);
    return [paiTypeT, paiNo];
}

// cookieを格納
function cookieSettings() {
    // cookieを連想配列にする
    let cookiesArray = document.cookie.split('; ');
    for (let c of cookiesArray) {
        let cArray = c.split('=');
        if (/(_ga|_gid)/.test(cArray[0])) continue;
        if (cArray[0] == "") continue;
        if (/cookieAgree/.test(cArray[0])) {
            if (cArray[1] == "true") document.cookie = "cookieAgree=true; Path=/; Max-Age=" + (60 * 60 * 24 * 365) + ";";
            cookieAgree = cArray[1] == "true" ? true : false;
            continue;
        }
        settings[cArray[0]] = (cArray[1] == 1 || cArray[1] == "true") ? 1 : 0;
    }
};

// 三麻は2～8mを対象にしない
function notAvailable3GamePai(paiType, paiNo) {
    if(!settings.gametype) return 0;
    // 三麻で萬子の中張牌なら1
    return paiType == 0 && !(1 == paiNo || paiNo == 9) ? 1 : 0;
}

// 共通関数 ===================================================================================================

// 手牌関係のデータを初期化
function paiInitialize(){
    document.getElementById("tehaiOutPutText").value = "";
    document.getElementById("paiTehai").innerHTML = "";
    tehai_text = [];
    tehai = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
}

// 手牌変更時の手牌再計算
function tehaiCalc(tehai_text_arr){
    let addPai = 0;
    for(let i = 0; i < tehai_text_arr.length; i++){
        // クラス名から牌の種類を取得
        let [paiNo, paiTypeT] = tehai_text_arr[i].split("");
        let paiType = paiTypeToText(paiTypeT);
        // 三麻で使用出来ない牌はカット
        if (notAvailable3GamePai(paiType, paiNo)) continue;
        // 同じ牌が4個以上はカット
        if(tehai[paiType][paiNo] >= 4) continue;
        // 問題ないので手牌に追加
        if(paiNo == 0){
            // 黒5が4枚使用済みか、赤牌使用済みなら入れない
            if(tehai[paiType][5] >= 4) continue;
            if(tehai[paiType][0] == 1) continue;
            tehai[paiType][0]++;
            tehai[paiType][5]++;
        }else{
            tehai[paiType][paiNo]++;
        }
        tehai_text.push(`${paiNo}${paiTypeT}`);
        addPai++;
    }
    // 牌が追加できたときだけ更新する
    if(addPai) tehaiReload();
}

// 手牌の枚数を含めて含めた有効牌を返す
function yukopaiCount(yukopaiList, tempTehai){
    let yukopaiCountList = [];
    for (let dapai in yukopaiList) {
        yukopaiCountList.push(yukopaiInitialize());
        // 打牌をセット
        let index = yukopaiCountList.length - 1;
        yukopaiCountList[index].dapai = dapai;

        for (let paiType = 0; paiType < 4; paiType++) {
            for (let paiNo = 0; paiNo < 10; paiNo++) {
                if(!yukopaiList[dapai][paiType][paiNo] || 4 - tempTehai[paiType][paiNo] == 0) continue;
                // 有効牌リストにある、かつ槓子じゃない手
                yukopaiCountList[index].imgList.push(`${paiNo}${paiTypeToText(paiType)}`);
                yukopaiCountList[index].count += 4 - tempTehai[paiType][paiNo];
                yukopaiCountList[index].type += 1;
            }
        }
        // if (yukopaiCountList[index].count == 0) yukopaiCountList.pop();
    }
    return yukopaiCountList;
}

// 自動理牌で表示(ツモ牌はソートの除外にする)
function tehaiSort() {
    let lastElement = '';
    if ([2, 5, 8, 11, 14].includes(tehai_text.length)) {
        lastElement = tehai_text.pop(); // 一番後ろの要素を取り除き、後で追加する
    }

    if(!settings.ripai) tehai_text.sort((a, b) => {
        const order = { 'm': 1, 'p': 2, 's': 3, 'z': 4 };
        const typeA = order[a.slice(-1)];
        const typeB = order[b.slice(-1)];
        if (typeA !== typeB) {
            return typeA - typeB;
        }
        // 赤牌(0)は4と5の間に来るよう値を調整
        const numA = a[0] === '0' ? 4.5 : parseInt(a);
        const numB = b[0] === '0' ? 4.5 : parseInt(b);
        return numA - numB;
    });

    // ソートされた配列に最後の要素を追加
    if (lastElement) {
        tehai_text.push(lastElement);
    }
}

// "1m","2m"...のリストから牌画に変換
function textToPaiImage(tehaiList) {
    let paiga = "";
    for (let i = 0; i < tehaiList.length; i++) {
        let [paiNo, paiTypeT] = tehaiList[i].split("");
        let paiType = paiTypeToText(paiTypeT);
        let paishadow = notAvailable3GamePai(paiType, paiNo) ? ' shadow' : '';
        paiga += `<img class="paiimg pai${paiNo}${paiTypeT}${paishadow}" src="./pie_img/${paiImg[paiType][paiNo].src}">`;
    }
    return paiga;
}

// "1m","2m"...のリストから牌画に変換
function textToPaiImage_tehai(tehaiList) {
    let paiga = "";
    for (let i = 0; i < tehaiList.length; i++) {
        let [paiNo, paiTypeT] = tehaiList[i].split("");
        let paiType = paiTypeToText(paiTypeT);
        let paishadow = notAvailable3GamePai(paiType, paiNo) ? ' shadow' : '';
        paiga += `<li><img class="paiimg pai${paiNo}${paiTypeT}${paishadow}" src="./pie_img/${paiImg[paiType][paiNo].src}"></li>`;
    }
    return paiga;
}

// 牌画出力配列を牌テキストに変換
function exchange_paigaToText(tehai_text) {
    let compacted = tehai_text.reduce((acc, val) => {
        let last = acc[acc.length - 1];
        if (last && last.slice(-1) === val.slice(-1)) {
            acc[acc.length - 1] = last.slice(0, -1) + val;
        } else {
            acc.push(val);
        }
        return acc;
    }, []).join('');
    return compacted;
}

// 牌画出力配列を牌テキストに変換
function exchange_textToPaiga(input_tehai_text) {
    let pattern = /(\d+)([mpsz])/g;
    let match;
    let arr = [];

    while ((match = pattern.exec(input_tehai_text)) != null) {
        let paiNos = match[1];
        let paiTypeT = match[2];
        for (let paiNo of paiNos) { // 1桁ずつに分解してセットする
            if(paiTypeT != "z"){
                if(!(0 <= paiNo && paiNo <= 9)) continue;
            }else{
                if(!(1 <= paiNo && paiNo <= 7)) continue;
            }
            arr.push(paiNo + paiTypeT);
            if(arr.length >= 14) break;
        }
    }
    return arr;
}

// 有効牌の表示に処理に必要な初期データ
function yukopaiInitialize() {
    let table = {};
    table.dapai = "";
    table.type = 0;
    table.count = 0;
    table.imgList = [];
    return table;
}

// 処理する前に設定や手牌が問題ないか確認
function irregular_check() {
    if (!settings.kind0 && !settings.kind1 && !settings.kind2) {
        return "全ての有効牌設定が外れています。";
    } else if (tehai_text.length <= 12 && !settings.kind0) {
        return "鳴き手牌は一般手のみ使用できます";
    } else if ([0, 3, 6, 9, 12].includes(tehai_text.length)) {
        return "手牌が0枚、3枚、6枚、9枚、12枚<br>の場合は使用できません。";
    }
    return "";
}


// 元になる牌山を生成する関数【Mersenne Twister in JavaScriptを利用】
function makePaiYama() {
    var mt = new MersenneTwister();// Mersenne­Twister オブジェクトの初期化
    var i, j, k;
    // 元になる牌山を生成
    let yama = [];
    for (i = 0; i < paiData.length; i++) {
        if (notAvailable3GamePai(paiData[i].paiType, paiData[i].paiNo)) continue;
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
    return yama;
}

// 牌山からルール通りに牌を手牌に収める
function tehaiRemake(yama) {
    let dice = Rand(12); // 任意のサイコロの目
    let index;
    // 1ブロック～3ブロックまで取り出す処理
    // let playerspai = settings.gametype ? 16 : 12;
    let playerspai = 16;
    let paiType, paiNo;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            index = dice * 2 + playerspai * i + j; // 親が取り出す牌の番地
            //index = (dice*2 + 4) + playerspai * i + j; // 南家が取り出す牌の番地
            //index = (dice*2 + 8) + playerspai * i + j; // 西家が取り出す牌の番地
            //index = (dice*2 + 12) + playerspai * i + j; // 北家が取り出す牌の番地
            [paiType, paiNo] = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo];
            tehai[paiType][paiNo]++; // tehaiに直接入れるタイプ
            if(paiNo == 0) tehai[paiType][5]++; // 赤牌は通常も入れる
            tehai_text.push(`${paiNo}${paiTypeToText(paiType)}`);
        }
    }
    // 13牌目を取り出す処理
    index = dice * 2 + playerspai * 3; // 親が取り出す13牌目の番地
    // index = dice*2 + playerspai*3 + 1; // 南家がが取り出す13牌目の番地
    // index = dice*2 + playerspai*3 + 2; // 西家がが取り出す13牌目の番地
    // index = dice*2 + playerspai*3 + 3; // 北家がが取り出す13牌目の番地
    [paiType, paiNo] = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo];
    tehai[paiType][paiNo]++; // tehaiに直接入れるタイプ
    if(paiNo == 0) tehai[paiType][5]++; // 赤牌は通常も入れる
    tehai_text.push(`${paiNo}${paiTypeToText(paiType)}`);
    // 14牌目を取り出す処理
    index = dice * 2 + playerspai * 3 + 4; // 親が取り出す14牌目の番地
    [paiType, paiNo] = [paiData[yama[index]].paiType, paiData[yama[index]].paiNo];
    tehai[paiType][paiNo]++; // tehaiに直接入れるタイプ
    if(paiNo == 0) tehai[paiType][5]++; // 赤牌は通常も入れる
    tehai_text.push(`${paiNo}${paiTypeToText(paiType)}`);
}

// 自動理牌しない場合の入れ替え機能
function SortableSet() {
    let sortFlg = settings.ripai == 0 ? true : false;
    let el = document.getElementById('paiTehai');
    if (window.sortable) {
        window.sortable.destroy();
    }
    window.sortable = Sortable.create(el, {
        animation: 100,
        delay: 100,
        axis: "x", // スクロール方向固定
        ghostClass : 'ghost',
        chosenClass: "chosen",
        disabled: sortFlg,
        onSort: tehai_textResort
    });

    function tehai_textResort(){
        let array = [];
        // 手牌配列の更新、手牌表示、テキスト形式を更新する
        document.querySelectorAll("#paiTehai li img").forEach(img => {
            let [paiTypeT, paiNo] = paiClass(img);
            array.push(`${paiNo}${paiTypeT}`);
        });
        tehai_text = [...array];
        document.getElementById("tehaiOutPutText").value = exchange_paigaToText(tehai_text);

        // 現在いる位置の手牌は履歴も更新する
        tehai_history[historyIndex].tehai_text = [...array];
        tehai_history[historyIndex].tehaiHTML = document.getElementById("paiTehai").innerHTML;
        tehai_history[historyIndex].tehaiInput = document.getElementById("tehaiOutPutText").value;
    }
}
