/*** 外部ライブラリの読み込み ***/
// 関数呼び出し用
var BigNumber = require('bignumber.js'); // npm install bignumber, https://www.npmjs.com/package/bignumber.js
var leftPad = require('left-pad'); // npm install left-pad, https://www.npmjs.com/package/left-padのサイトとかにある
var web3utils = require('web3-utils'); // npm install web3-utils, https://www.npmjs.com/package/web3-utilsなど
// Web3のインスタンスの作成
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
web3.eth.defaultAccount=web3.eth.accounts[0]

/*** 使わなくなった外部ライブラリ ***/
// (sha3withsizeはdefaultなどともできる)
// var sha3 = require('solidity-sha3').sha3withsize; 



/*** 必要 ***/
/*** コントラクトの呼び出し方法 ***/
var addr = '0x940459a5192de1f962a72ffae45489d8332d40e4';
var abi = [{"constant":true,"inputs":[],"name":"hash","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_diff","type":"uint32"}],"name":"getDiffData","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"blockHashNow","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"test","type":"uint8[]"}],"name":"Sha3","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"coefficient","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"IDSpace","type":"uint72"},{"name":"blockHash","type":"uint256"},{"name":"nonce","type":"uint32"},{"name":"diff32","type":"uint32"}],"name":"verifyPoW","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"exponent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"blockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"blockHashPrevious","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"IDSpace","type":"uint72"},{"name":"blockHash","type":"uint256"},{"name":"nonce","type":"uint32"}],"name":"PoW","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"diff","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_hashToSign","type":"bytes32"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"verifyECSign","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_prevNum","type":"uint32"}],"name":"getBlockHash","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"target","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"IDSpace","type":"uint72"},{"name":"blockHeight","type":"uint128"}],"name":"Sha3_2","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

// コンストラクタのインスタンスを作成
var test = web3.eth.contract(abi).at(addr);

/*** web3-utilsのsha3を使うのがベスト ***/
console.log("--- ハッシュ関数のテストを行う ---");
console.log("TestコントラクトのSha3メソッドにおいて, Sha3.call([0, 0, '0xf'])などとすることで同じ結果が得られる");
//var str1 = "0x000000001e0000ffff"
var str2 = "0x0000000000000000000000000000022c";
var str1 = "0x000000001e0000ffff";
var str22 = "0x" + leftPad(web3.toHex(0x22c).slice(2).toString(16), 32, 0);
console.log(str22);
console.log(str2);
console.log("ローカルで呼び出した結果: " +  web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint128', v: str2}));
// console.log("ローカルで呼び出した結果: " +  web3utils.soliditySha3({t: 'uint72', v: "0x000000001e0000ffff"}, {t: 'uint128', v: "0x0000000000000000000000000000022c"}));
console.log("ブロックチェーン内の結果: " + test.Sha3_2.call(0x000000001e0000ffff, 0x0000000000000000000000000000022c));
console.log("");

/*** 大きい自然数に対しても有効か確認する ***/
console.log("--- 上記ハッシュ関数のテストが大きい数値に対しても実行できるか確認 ---");
console.log("BigNumberとleftPadを使う");
console.log("BN: string型を代入してコンストラクトする, leftPad: ");
var x1 = new BigNumber("0x1");
var str1 = leftPad(web3.toHex(x1).slice(2).toString(16), 72, 0);
var str2 = leftPad(web3.toHex(x1).slice(2).toString(16), 256, 0);
var str3 = leftPad(web3.toHex(x1).slice(2).toString(16), 32, 0);
console.log("TestコントラクトのPoWメソッドにおいて, PoW.call(1, 1, 1)などとすることで同じ結果が得られる");
console.log("期待される結果: 0xa17a1679711407776ec24da57ce4e14d86f1e3e2285beccdb2f8c949147521c4");
console.log("実際の結果: " +  web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}));
console.log("テスト: " + web3utils.soliditySha3({t: 'uint8', v: 0x61}, {t: 'uint8', v: 0x62}, {t: 'uint8', v: 0x63}, {t: 'uint8', v: 0x64}));
console.log("");

/*** ディジタル署名の実行 ***/
// string型で作成した場合(Solidity側でもStringで受ける必要がある)
console.log("--- ディジタル署名生成のテストを行う ---");
sig = web3.eth.sign(web3.eth.accounts[0], web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}));
// --- String Digital Sign --- 
console.log("str1: " + str1);
console.log("str2: " + str2);
console.log("str3: " + str3);
console.log("sha3: " + web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}));
console.log("sig: " + sig);
// r, s, vを各々定義する
var r = sig.slice(0,66);
var s = '0x' + sig.slice(66,130);
var v = Number(sig.slice(130,132)) + 27; // これだけ数値型
// 署名検証のメソッドを呼び出し(コントラクトから)
var addr = test.verifyECSign.call(web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}), v, r, s);
console.log("期待される結果(eth.accounts[0]): 0xe8a13d1e299f75fc516d5f046027a1e67bd123e2");
console.log("実際の結果: " + addr);
console.log("");

/*** PoWの実行テスト ***/
// PoW通貨の実装: https://ethereum.org/token#proof-of-work
console.log("--- PoWの実行テスト ---");
var diffHex = 0x2000ffff;
var divHex = 0x01000000;
var diff = new BigNumber(diffHex);
var div = new BigNumber(divHex);
var shiftCount = diff.dividedToIntegerBy(div)
var shiftTarget = diff - shiftCount * div;

console.log("Input Difficulty: " + "0x207fffff");
console.log("shift count: " + shiftCount);
console.log("shift target: " + shiftTarget);
var mult = new BigNumber("2", 10);
mult = mult.pow(8 * (shiftCount - 3))
console.log("mult: " + web3.toHex(mult));
var target = new BigNumber(shiftTarget);
console.log("Target: " + web3.toHex(target));
target = target.times(mult);
console.log("Target: " + web3.toHex(target));


var max = 4294967296 - 1; // ループ回数
for (var i = 0; i < max; i++) {
    var str3 = "0x" + leftPad(web3.toHex(i).slice(2).toString(16), 4, 0); // 4 Byte
    var num = new BigNumber(web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}), 16);
    if (target.gt(num)) {
	console.log("PoWに成功");
	console.log("nonce: " + i);
	console.log("Verify: " + test.verifyPoW.call(1, 1, i, diffHex));
	break;
    }
    if ((i % 10000) == 0) {
	console.log(str3);
	console.log(web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}));
	var num_test = test.PoW.call(str1, str2, str3);
	console.log(num_test);
	console.log("TEST Count: " + i);
    }
}


// The following works
var max1 = new BigNumber("4294967296", 10);
for (var i = new BigNumber("0x00", 16); max1.gt(i); i = i.plus(1)) {
    var str3 = "0x" + leftPad(i.toString(16), 4, 0);
    var num = new BigNumber(web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}), 16);
    if (target.gt(num)) {
	console.log("nonce: " + i.toString());
	console.log("Verify: " + test.verifyPoW.call(1, 1, i.toString(), diffHex));
	break;
    }
    if ((i % 10000) == 0) {
	console.log(str3);
	console.log(web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}));
	var num_test = test.PoW.call(str1, str2, str3);
	console.log(num_test);
	console.log("TEST Count: " + i.toString());
    }
}
