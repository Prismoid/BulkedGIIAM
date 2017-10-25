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


/*** ディジタル署名の実行 ***/
// string型で作成した場合(Solidity側でもStringで受ける必要がある)
var x1 = new BigNumber('0x22c'); // 0x12c: 300(in decimal)
console.log(x1);
var str1 = '0x000000001e0000ffff';
var str2 = "0x" + leftPad(web3.toHex(x1).slice(2).toString(16), 32, 0);
console.log(str2);
// cf.var str3 = leftPad(web3.toHex(x1).slice(2).toString(16), 72, 0);
console.log("--- ディジタル署名生成のテストを行う ---");
sig = web3.eth.sign(web3.eth.accounts[1], web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint128', v: str2}));
// sig = web3.eth.sign(web3.eth.accounts[1], web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint256', v: str2}, {t: 'uint32', v: str3}));

console.log("--- String Digital Sign ---");
console.log("Signer: " + web3.eth.accounts[1]);
console.log("str1: " + str1);
console.log("str2: " + str2);
console.log("sha3(str1, str2): " + web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint128', v: str2}));
console.log("sig: " + sig);
// r, s, vを各々定義する
var r = sig.slice(0,66);
var s = '0x' + sig.slice(66,130);
var v = Number(sig.slice(130,132)) + 27; // これだけ数値型
console.log("v: " + v);
console.log("r: " + r);
console.log("s: " + s);

