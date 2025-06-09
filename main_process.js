'use strict';

/*
この牌理ツールはタケオしゃん氏が公開している"麻雀小粒プログラミング"を元に作成しています。
https://mahjong.org/programming/
*/

// ============================================================================
//アガリ判定と向聴数を返す関数
// ============================================================================

//アガリ判定と向聴数と有効牌を返す関数
function pairiCheck(tehai) {
	console.time('main');
    let tempTehai = JSON.parse(JSON.stringify(tehai)); // tehai配列のバックアップを取る

	let params = {
        "minSyanten": {
            "normal": 8, "toitu7": 8, "kokusi": 13
        },
		"syanten": {
            "normal": 8, "toitu7": 8, "kokusi": 13
        },
        "block": {
            "shuntu": [], "kotu": [], "head": [], "hoge": 0,
            "taatu": [], "surplus": [], "dapai": [], "naki": 0,
        },
		"tehaiPais": 0,
		"baseTehai": JSON.parse(JSON.stringify(tehai)), // 最後の孤立牌で槓子判定する際に使用する用のtehai
		"blockList": []
    };

	// 鳴き面子チェック、手牌枚数チェック
	[params.block.naki, params.tehaiPais] = KanzenNakimentu_tehaiCount(tempTehai);

	// 七対子の向聴数チェック
	if(settings.kind1 && params.tehaiPais >= 13) toitu7SyantenCheck(tempTehai, params);
	// 国士無双の向聴数チェック
	if(settings.kind2 && params.tehaiPais >= 13) kokusiSyantenCheck(tempTehai, params);

	if(settings.kind0){
		// 孤立面子・孤立牌チェック
		// KanzenKorituCheck(tempTehai, params); // シャンテン数だけなら問題ないが、有効牌も含めると4444m4444s777zで7zの打牌候補が出てこないので省略
		// 雀頭抜き出し→刻子抜き出し→順子抜き出し→塔子候補抜き出し→余剰牌処理
		for (var paiType = 0; paiType < 4; paiType++) {
			for (var paiNo = 1; paiNo < 10; paiNo++) {
				// ヘッドを抜いてから探索開始
				if (tempTehai[paiType][paiNo] >= 2) {
					params.block.head.push(`${paiNo}${paiNo}${paiType_to_text(paiType)}`);
					tempTehai[paiType][paiNo] -= 2;
					mentu_cut(tempTehai, 0, 1, params);
					tempTehai[paiType][paiNo] += 2;
					params.block.head.pop();
				}
				if (paiNo > 7 && paiType == 3) break;
			}
		}
		// (雀頭無し)→コーツ抜き出し→シュンツ抜き出し→ターツ候補抜き出し→余剰牌処理
		mentu_cut(tempTehai, 0, 1, params);
	}

	// 有効牌を計算
	let yukopaiList = yukopaiCheck(params, params.tehaiPais);

	// 結果
	console.timeEnd('main');
	return [[params.minSyanten.normal, params.minSyanten.toitu7, params.minSyanten.kokusi], yukopaiList];
}
// ============================================================================
//面子抜き出し【刻子抜き出し→順子抜き出し】
function mentu_cut(tempTehai, T, N, params) {
    // 字牌の刻子は完全刻子処理で抜いているの数牌だけで良い
    for (let paiType = T; paiType < 4; paiType++) {
		for (let paiNo = 1; paiNo < 10; paiNo++) {
			if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット

            //刻子抜き出し
            if (tempTehai[paiType][paiNo] >= 3) {
				// 刻子
				params.block.kotu.push(`${paiNo}${paiNo}${paiNo}${paiType_to_text(paiType)}`);
				tempTehai[paiType][paiNo] -= 3;
				mentu_cut(tempTehai, paiType, paiNo, params);
				tempTehai[paiType][paiNo] += 3;
				params.block.kotu.pop();
            }
			if(paiNo >= 8 || paiType == 3) continue; // 789まで

            //順子抜き出し
            if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 1] && tempTehai[paiType][paiNo + 2]) {
				params.block.shuntu.push(`${paiNo}${paiNo + 1}${paiNo + 2}${paiType_to_text(paiType)}`);
				tempTehai[paiType][paiNo]--;
				tempTehai[paiType][paiNo + 1]--;
				tempTehai[paiType][paiNo + 2]--;
				mentu_cut(tempTehai, paiType, paiNo, params);
				tempTehai[paiType][paiNo + 2]++;
				tempTehai[paiType][paiNo + 1]++;
				tempTehai[paiType][paiNo]++;
				params.block.shuntu.pop();
            }
        }
    }
    taatu_cut(tempTehai, 0, 1, params);//塔子抜きへ
}

// ============================================================================
//塔子抜き出し
function taatu_cut(tempTehai, T, N, params) {
    let sumMentu = params.block.kotu.length + params.block.shuntu.length + params.block.naki;
	let sumTaatu = params.block.taatu.length;

    // 面子と塔子の合計は4まで
    if (sumMentu + sumTaatu < 4) {
        for (var paiType = T; paiType < 4; paiType++) {
            for (var paiNo = 1; paiNo < 10; paiNo++) {
                if (paiType < T && paiNo < N) continue; // 既にチェックした牌種はカット

                // 対子抜き出し
                if (tempTehai[paiType][paiNo] == 2) {
					// 対子
					// 槓子の時、すでに頭として切り出してたら塔子として使えない
					if(!params.block.head.includes(`${paiNo}${paiNo}${paiType_to_text(paiType)}`)){
						params.block.taatu.push(`${paiNo}${paiNo}${paiType_to_text(paiType)}`);
						tempTehai[paiType][paiNo] -= 2;
						taatu_cut(tempTehai, paiType, paiNo, params);
						tempTehai[paiType][paiNo] += 2;
						params.block.taatu.pop();
					}
                }
                if (paiType == 3 || paiNo == 9) continue; // 字牌は対子だけ、塔子は89まで

                // 両面・辺張抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 1]) {
					params.block.taatu.push(`${paiNo}${paiNo + 1}${paiType_to_text(paiType)}`);
					tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo + 1]--;
					taatu_cut(tempTehai, paiType, paiNo, params);
					tempTehai[paiType][paiNo]++;
                    tempTehai[paiType][paiNo + 1]++;
					params.block.taatu.pop();
                }
				if (paiNo >= 8) continue; // 嵌張は79まで

                // 嵌張抜き出し
                if (tempTehai[paiType][paiNo] && tempTehai[paiType][paiNo + 2] && paiNo < 8) {
					params.block.taatu.push(`${paiNo}${paiNo + 2}${paiType_to_text(paiType)}`);
					tempTehai[paiType][paiNo]--;
                    tempTehai[paiType][paiNo + 2]--;
					taatu_cut(tempTehai, paiType, paiNo, params);
                    tempTehai[paiType][paiNo + 2]++;
					tempTehai[paiType][paiNo]++;
					params.block.taatu.pop();
                }
            }
        }
    }
	surplus_cut(tempTehai, params, sumMentu, sumTaatu) // 最終処理へ
}

// ============================================================================
// 残った牌を処理して向聴数やブロックを調整する
function surplus_cut(tempTehai, params, sumMentu, sumTaatu){
	// 残りの牌は有効牌として使えるなら格納(塔子過剰で2枚残ってる場合もある)
	for (let paiType = 0; paiType < 4; paiType++) {
		for (let paiNo = 1; paiNo < 10; paiNo++) {
			if (notAvailable3GamePai(paiType, paiNo)) continue;
			if (!tempTehai[paiType][paiNo]) continue;

			if(sumMentu + sumTaatu >= 4 && params.block.head.length){
				// 頭があり4ブロックあるときは孤立牌は有効牌がないので打牌候補としてのみ格納
				params.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
			}else if(sumMentu + sumTaatu >= 4 && !params.block.head.length){
				// 頭がないが4ブロック以上あるとき、対子になる形しか有効牌がない
				if(params.baseTehai[paiType][paiNo] < 4){
					// 槓子以外は孤立牌として格納
					params.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
				}
				params.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
			}else{
				// 4ブロックない時はくっつきも有効牌となる
				params.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
				if(paiType == 3 || (settings.gametype && (paiNo == 1 || paiNo == 9))){
					// 字牌、もしくは三麻の19牌なので対子になる形しか有効牌がない
					if(params.baseTehai[paiType][paiNo] < 3){
						// 槓子以外は孤立牌として格納
						params.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
					}
				}else{
					// 数牌はくっつきも有効牌
					params.block.surplus.push(`-${paiNo}${paiType_to_text(paiType)}`);
				}
			}
		}
	}

	// 向聴数計算
	let syanten = 8 - (sumMentu * 2) - sumTaatu - params.block.head.length;

	if(sumMentu + sumTaatu + params.block.head.length + params.block.surplus.length < 5){
		// 和了りに必要なブロックを確保できてないので向聴数を1戻す
		syanten++;
	}

	if (syanten < params.minSyanten.normal) params.minSyanten.normal = syanten;
	params.syanten.normal = syanten;

	if([params.minSyanten.normal, params.minSyanten.toitu7, params.minSyanten.kokusi].some(minSyanten => syanten <= minSyanten)){
		let sumBlock = sumMentu + sumTaatu + params.block.head.length;
		// ブロック数が不足してる時、かつ孤立牌を1ブロックと数えても5ブロックまでしかならない時は、孤立牌を切る=ブロック不足=向聴数が落ちるので打牌候補から削る
		if(sumBlock < 5 && (5 - sumBlock) >= params.block.surplus.length){
			if([2, 5, 8, 11, 14].includes(params.tehaiPais)){
				// シャンテン数が落ちる孤立牌を除いて、-+を削除して整える
				let surplusArr = params.block.surplus.slice(-2).map(surplus => surplus.slice(-2));
				// その孤立牌を含む打牌候補を削る
				params.block.dapai = params.block.dapai.filter(dapai => !surplusArr.includes(dapai));
			}
			// ブロックが不足かつ孤立牌がないときは、何をツモっても向聴数が進むことになる
			// if(!params.block.surplus.length) params.block.surplus.push("-9z");
			if(!params.block.surplus.length){
				for (let paiType = 0; paiType < 4; paiType++) {
					for (let paiNo = 1; paiNo < 10; paiNo++) {
						if (notAvailable3GamePai(paiType, paiNo)) continue;
						if (paiType == 3 && paiNo >= 8) continue;
						if(!params.block.head.length){
							// ヘッドが無いときは対子未満なら孤立牌になりえる
							if(params.baseTehai[paiType][paiNo] < 3) params.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
						}else{
							// ヘッドあればくっつけばOK
							params.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
						}
					}
				}
			}
		}

		// 有効牌用に格納
		params.blockList.push([JSON.parse(JSON.stringify(params.syanten)), JSON.parse(JSON.stringify(params.block))]);
	}

	// 格納した孤立牌・打牌を削除
	params.block.surplus.splice(0);
	params.block.dapai.splice(0);
}

// ============================================================================
//干渉しない刻子、順子を抜き出して面子として加算
// function KanzenKorituCheck(tempTehai, params) {
//     // 字牌
//     for (let paiNo = 1; paiNo < 8; paiNo++) {
// 		if(tempTehai[3][paiNo] >= 3){
// 			// 刻子
// 			params.block.kotu.push(`${paiNo}${paiNo}${paiNo}${paiType_to_text(3)}`);
// 			tempTehai[3][paiNo] -= 3;
// 		}
//     }

//     // 数牌
//     for (let paiType = 0; paiType < 3; paiType++) {
// 		// 順子----------------------------------
//         // 1
//         if (tempTehai[paiType][1] &&
// 			!tempTehai[paiType][2] && !tempTehai[paiType][3]
// 		) {
// 			if(tempTehai[paiType][1] >= 3){
// 				params.block.kotu.push(`111${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][1] -= 3;
// 			}
//         }
//         // 9
//         if (tempTehai[paiType][9] &&
// 			!tempTehai[paiType][7] && !tempTehai[paiType][8]) {
// 			if(tempTehai[paiType][9] >= 3){
// 				params.block.kotu.push(`999${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][9] -= 3;
// 			}
//         }
//         // 2
//         if (tempTehai[paiType][2] &&
//             !tempTehai[paiType][1] && !tempTehai[paiType][3] && !tempTehai[paiType][4]) {
// 			if(tempTehai[paiType][2] >= 3){
// 				params.block.kotu.push(`222${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][2] -= 3;
// 			}
//         }
// 		// 8
//         if (tempTehai[paiType][8] &&
//             !tempTehai[paiType][6] && !tempTehai[paiType][7] &&!tempTehai[paiType][9]) {
// 			if(tempTehai[paiType][8] >= 3){
// 				params.block.kotu.push(`888${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][8] -= 3;
// 			}
//         }
//         // 3～7
//         for (let paiNo = 3; paiNo <= 7; paiNo++) {
// 			if (tempTehai[paiType][paiNo] &&
//             	!tempTehai[paiType][paiNo - 2] && !tempTehai[paiType][paiNo - 1] &&
//                 !tempTehai[paiType][paiNo + 1] && !tempTehai[paiType][paiNo + 2]) {
// 				if(tempTehai[paiType][paiNo] >= 3){
// 					params.block.kotu.push(`${paiNo}${paiNo}${paiNo}${paiType_to_text(paiType)}`);
// 					tempTehai[paiType][paiNo] -= 3;
// 				}
//             }
//         }

//         // 順子----------------------------------
//         for (let pais = 0; pais < 3; pais++) {
// 			// 123▲▲
//             if (tempTehai[paiType][1] == 1 && tempTehai[paiType][2] == 1 && tempTehai[paiType][3] == 1 &&
//                 !tempTehai[paiType][4] && !tempTehai[paiType][5]) {
// 				params.block.shuntu.push(`123${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][1]--;
// 				tempTehai[paiType][2]--;
// 				tempTehai[paiType][3]--;
//             }
//             // ▲234▲▲
//             if (tempTehai[paiType][2] == 1 && tempTehai[paiType][3] == 1 && tempTehai[paiType][4] == 1 &&
//                 !tempTehai[paiType][1] && !tempTehai[paiType][5] && !tempTehai[paiType][6]) {
// 				params.block.shuntu.push(`234${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][2]--;
// 				tempTehai[paiType][3]--;
// 				tempTehai[paiType][4]--;
//             }
//             // ▲▲345▲▲ ▲▲456▲▲ ▲▲567▲▲
//             for (let paiNo = 3; paiNo <= 5; paiNo++) {
//                 if (!tempTehai[paiType][paiNo - 2] && !tempTehai[paiType][paiNo - 1] &&
//                     tempTehai[paiType][paiNo] == 1 && tempTehai[paiType][paiNo + 1] == 1 && tempTehai[paiType][paiNo + 2] == 1 &&
//                     !tempTehai[paiType][paiNo + 3] && !tempTehai[paiType][paiNo + 4]) {
// 					params.block.shuntu.push(`${paiNo}${paiNo + 1}${paiNo + 2}${paiType_to_text(paiType)}`);
// 					tempTehai[paiType][paiNo]--;
// 					tempTehai[paiType][paiNo + 1]--;
// 					tempTehai[paiType][paiNo + 2]--;
//                 }
//             }
//             // ▲▲678▲
//             if (tempTehai[paiType][6] == 1 && tempTehai[paiType][7] == 1 && tempTehai[paiType][8] == 1 &&
//                 !tempTehai[paiType][4] && !tempTehai[paiType][5] && !tempTehai[paiType][9]) {
// 				params.block.shuntu.push(`678${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][6]--;
// 				tempTehai[paiType][7]--;
// 				tempTehai[paiType][8]--;
//             }
//             // ▲▲789
//             if (tempTehai[paiType][7] == 1 && tempTehai[paiType][8] == 1 && tempTehai[paiType][9] == 1 &&
//                 !tempTehai[paiType][5] && !tempTehai[paiType][6]) {
// 				params.block.shuntu.push(`789${paiType_to_text(paiType)}`);
// 				tempTehai[paiType][7]--;
// 				tempTehai[paiType][8]--;
// 				tempTehai[paiType][9]--;
//             }
//         }
//     }
// }

// ============================================================================
// 鳴き手などの枚数が少ない手牌は向聴数を減らす
function KanzenNakimentu_tehaiCount(tempTehai) {
	let sum = 0;
	tempTehai.forEach(function (value, index, array) {
		array[index].forEach(function (value, index, array) {
			if(index == 0) return; // 赤5はスキップ
			sum += Number(value);
		});
	});
	// 鳴いた部分は完全系の面子として返す。ついでに手牌の枚数も返す
	return [(4 - Math.floor(sum / 3)), sum];
}

// =================================================================
// 七対子の向聴数を計算
function toitu7SyantenCheck(tempTehai, params) {
	let toitu7 = {"block": {
		"shuntu": [], "kotu": [], "head": [], "hoge": 0,
		"taatu": [], "surplus": [], "dapai": [], "naki": 0,
	}};
	// 塔子格納
    for (let paiType = 0; paiType < 4; paiType++) {
        for (let paiNo = 1; paiNo < 10; paiNo++) {
            if (notAvailable3GamePai(paiType, paiNo)) continue;
			if (paiType == 3 && paiNo >= 8) break;
			if (tempTehai[paiType][paiNo] == 2){
				// 2枚で1ブロックなので刻子扱いで格納
				toitu7.block.kotu.push(`${paiNo}${paiNo}${paiType_to_text(paiType)}`);
			}else if (tempTehai[paiType][paiNo] == 1){
				// 1枚は受入で一旦孤立牌で格納
				toitu7.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
			}else if (tempTehai[paiType][paiNo] >= 3){
				// 3枚以上は1ブロック確定、かつ打牌牌候補確定
				toitu7.block.kotu.push(`${paiNo}${paiNo}${paiType_to_text(paiType)}`);
				toitu7.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
			}
        }
    }

	let toitu = toitu7.block.kotu.length;
	let surplus = 7 - toitu - toitu7.block.surplus.length < 0 ? 7 - toitu : toitu7.block.surplus.length;
	let toitu7Syanten = 13 - toitu * 2 - surplus;
	// 7塔子あるかで受入処理変化
	let sumTaatu = toitu + surplus;

	// 受入と打牌再チェック
	for (let paiType = 0; paiType < 4; paiType++) {
        for (let paiNo = 1; paiNo < 10; paiNo++) {
            if (notAvailable3GamePai(paiType, paiNo)) continue;
			if (paiType == 3 && paiNo >= 8) break;
			if (sumTaatu >= 7){
				// 塔子が十分な場合は孤立牌を打牌候補に入れる
				if(tempTehai[paiType][paiNo] != 1) continue;
				toitu7.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
			}else{
				// 塔子が不足してる場合は手牌にある牌以外全てが対象
				if(tempTehai[paiType][paiNo]) continue;
				toitu7.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
			}
        }
    }

	[params.syanten.toitu7, params.minSyanten.toitu7] = [toitu7Syanten, toitu7Syanten];
	params.blockList.push([JSON.parse(JSON.stringify(params.syanten)), JSON.parse(JSON.stringify(toitu7.block))]);
	params.syanten.toitu7 = 8; // 一般手のために戻す
}

// =================================================================
// 国士無双の向聴数を計算
function kokusiSyantenCheck(tempTehai, params) {
	let kokusi = {"block": {
		"shuntu": [], "kotu": [], "head": [], "hoge": 0,
		"taatu": [], "surplus": [], "dapai": [], "naki": 0,
	}};
	// 頭検索
    for (let paiType = 0; paiType < 4; paiType++) {
        for (let paiNo = 1; paiNo < 10; paiNo++) {
			if (!kokusiPai(paiType, paiNo)) continue;
			if (tempTehai[paiType][paiNo] < 2) continue;
			// 頭候補として格納
			kokusi.block.head.push(`${paiNo}${paiNo}${paiType_to_text(paiType)}`);
        }
    }
	// 受入と打牌再チェック
	for (let paiType = 0; paiType < 4; paiType++) {
        for (let paiNo = 1; paiNo < 10; paiNo++) {
			if ((paiType == 3 && paiNo >= 8)) break;

			// 中張牌は打牌候補確定
			if(tempTehai[paiType][paiNo] && !kokusiPai(paiType, paiNo)){
				kokusi.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
			}
			// 19字牌は1枚あれば1ブロックなので刻子扱いで格納
			if(tempTehai[paiType][paiNo] && kokusiPai(paiType, paiNo)){
				kokusi.block.kotu.push(`${paiNo}${paiType_to_text(paiType)}`);
			}

			if(kokusi.block.head.length){
				// 持ってない19字牌が受入なので孤立牌として格納
				if(!tempTehai[paiType][paiNo] && kokusiPai(paiType, paiNo)){
					kokusi.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
				}
				// 19字牌でも3枚以上は打牌候補確定
				if(tempTehai[paiType][paiNo] >= 3 && kokusiPai(paiType, paiNo)){
					kokusi.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
				}
				// 2枚持ちは頭候補が2つ以上あるとき、打牌候補になる
				if(tempTehai[paiType][paiNo] >= 2 && kokusiPai(paiType, paiNo) && kokusi.block.head.length >= 2){
					kokusi.block.dapai.push(`${paiNo}${paiType_to_text(paiType)}`);
				}
			}else{
				// 頭がない(=3枚以上持ちもない)
				// 全ての19字牌が受入なので孤立牌として格納
				if(kokusiPai(paiType, paiNo)){
					kokusi.block.surplus.push(`+${paiNo}${paiType_to_text(paiType)}`);
				}
			}
        }
    }

	// 国士無双
	let head = kokusi.block.head.length ? 1 : 0;
	let kokusiSyanten = 13 - head - kokusi.block.kotu.length;
	[params.syanten.kokusi, params.minSyanten.kokusi] = [kokusiSyanten, kokusiSyanten];
	params.blockList.push([JSON.parse(JSON.stringify(params.syanten)), JSON.parse(JSON.stringify(kokusi.block))]);
	params.syanten.kokusi = 13; // 一般手のために戻す

	return;

	function kokusiPai(type, no){
		return (type < 3 && (no == 1 || no == 9)) || (type == 3 && no < 8) ? 1 : 0;
	}
}

// ============================================================================
// 有効牌をリスト化
function yukopaiCheck(params, tehaiPais){
	if(!params.blockList.length) return;

	let yukopaiTable = yukoupai_table();
	let choicePairs = {};
	let yukopaiList = {};

	// 全要素をフラット化
	let flatArr = params.blockList.flatMap(obj => Object.values(obj[0]));
	// 最小向聴数を取得
	let minValue = flatArr.reduce((min, val) => Math.min(min, val));
	// 最小向聴数のブロックセットのみを使用
	// console.log(minValue)
	let filteredArr = params.blockList.filter(obj => [obj[0].normal, obj[0].toitu7, obj[0].kokusi].includes(minValue));
	// let debug = params.blockList.filter(obj => obj[1].dapai.includes("3m"));
	// console.log(filteredArr);
	// 孤立牌(打牌候補)と塔子候補をまとめたやつを作成する
	for (let i = 0; i < filteredArr.length; i++) {
		let block = filteredArr[i][1];

		// 打牌リスト作成
		let choiceList = [2, 5, 8, 11, 14].includes(tehaiPais) ? block.dapai : ["0z"];

		// 有効牌の塔子リスト作成
		let taatuList = block.surplus.concat(block.taatu);

		// 打牌と有効牌を組み合わせる
		for (let p = 0; p < choiceList.length; p++) {
			let dapai = choiceList[p]; // 打牌では槓子孤立牌と通常孤立牌は同じ
			if(typeof choicePairs[dapai] === 'undefined'){
				choicePairs[dapai] = taatuList;
			}else{
				choicePairs[dapai] = choicePairs[dapai].concat(taatuList);
			}
		}
	}
	// 重複塔子を削除
	for (let key in choicePairs) {
		choicePairs[key] = choicePairs[key].filter((item, index) => choicePairs[key].indexOf(item) == index);
	}

	// 打牌と有効牌の手牌を作成
	for (let dapai in choicePairs) {
		yukopaiList[dapai] =  [ // 表示に必要な有効牌フラグ
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0]
		];
		let [dapaiNo, dapaiTypeT] = dapai.split("");

		let dapaiType = paiTypeToText(dapaiTypeT);
		for (let i = 0; i < choicePairs[dapai].length; i++) {
			// pai = surplus or taatu
			let pai = choicePairs[dapai][i];
			if(["-", "+"].includes(pai.slice(0, 1)) && dapai == pai.slice(-2)) continue; // 孤立牌を打牌するのは有効牌ではないのでスキップ

			if(pai == "-9z"){
				// 全部有効牌
				for (let paiType = 0; paiType < 4; paiType++) {
					for (let paiNo = 1; paiNo < 10; paiNo++) {
						if (notAvailable3GamePai(paiType, paiNo)) continue;
						if (paiType == 3 && paiNo >= 8) break;
						yukopaiList[dapai][paiType][paiNo] = 1;
					}
				}
				yukopaiList[dapai][dapaiType][dapaiNo] = 0; // 打牌したやつを再度ツモるのは有効牌ではないのでカット
				break;
			}else{
				// 有効牌のフラグを立てていく
				// ここでは種類のみ。枚数は表示時に自分の手牌と見比べながら
				let paiType = paiTypeToText(pai.slice(-1));
				yukopaiTable[pai].forEach(
					paiNo => yukopaiList[dapai][paiType][paiNo] = 1
				);
				yukopaiList[dapai][dapaiType][dapaiNo] = 0; // 打牌したやつを再度ツモるのは有効牌ではないのでカット
			}
		}
	}

	return yukopaiList;
}

// ============================================================================
// 牌種→テキスト変換
function paiType_to_text(paiType){
	let paiText = ["m", "p", "s", "z"];
	return paiText[paiType];
};

