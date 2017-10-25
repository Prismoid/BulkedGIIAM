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

// コントラクトのインスタンスを作成
var contract_json = require('../build/contracts/BulkedGIIAM.json');
var addr = contract_json.networks[1].address;
var abi = contract_json.abi;
var test = web3.eth.contract(abi).at(addr);

/*** 使わなくなった外部ライブラリ ***/
// (sha3withsizeはdefaultなどともできる)
// var sha3 = require('solidity-sha3').sha3withsize; 


/*** ディジタル署名の実行 ***/
// string型で作成した場合(Solidity側でもStringで受ける必要がある)
var x1 = new BigNumber('0x2710'); // 10000ブロックまで有効
var _keyIDSpaceAndRange = '0x000000001e0000ffff';
var _validateBlockHeight = "0x" + leftPad(web3.toHex(x1).slice(2).toString(16), 32, 0); // 32*4=128bit
var _middleOfRange = ["0x3fff", "0x7fff"]; // 1/4, 1/4, 1/2の分け方
var _toPlace = ["0x00", "0x01"];
var _ownerPlace = ["0x02"];
var _to = [web3.eth.accounts[1], web3.eth.accounts[2]];
var _v = [];
var _r = [];
var _s = [];

// ！！！！デバック完了！！！！
// https://github.com/ethereumjs/ethereumjs-abi/issues/27!!!に記述あり！下記のコードはうまく動く
console.log("--- 署名するメッセージのテストを行う ---");
var hash = web3utils.soliditySha3({t: 'uint72', v: _keyIDSpaceAndRange}, {t: 'uint128', v: _validateBlockHeight}, 
				  {t: 'uint256[]', v: _middleOfRange}, {t: 'uint256[]', v: _toPlace},
				  {t: 'uint256[]', v: _ownerPlace}, {t: 'uint256[]', v: _to}); // uint256[]で入ることに注意する！！！
var hash_remote = test.getTransHash.call(_keyIDSpaceAndRange, _validateBlockHeight, _middleOfRange, _toPlace, _ownerPlace, _to);
/*
var hash = web3utils.soliditySha3({t: 'uint72', v: _keyIDSpaceAndRange}, {t: 'uint128', v: _validateBlockHeight}, 
				  {t: 'uint16[]', v: _middleOfRange}, {t: 'uint8[]', v: _toPlace});
var hash_remote = test.getTransHash.call(_keyIDSpaceAndRange, _validateBlockHeight, _middleOfRange, _toPlace, [], []);
*/
console.log("署名するメッセージ(ローカル): " + hash);
console.log("署名するメッセージ(リモート): " + hash_remote);

/*
console.log("--- String Digital Sign ---");
sig = web3.eth.sign(web3.eth.accounts[1], web3utils.soliditySha3({t: 'uint72', v: _keyIDSpaceAndRange}, {t: 'uint128', v: _validateBlockHeight}, 
								 {t: 'uint16[]', v: _middleOfRange}, {t: 'uint8[]', v: _toPlace},
								 {t: 'uint8[]', v: _ownerPlace}, {t: 'address[]', v: _to}));
console.log("Signer: " + web3.eth.accounts[1]);
console.log("sha3(str1, str2): " + web3utils.soliditySha3({t: 'uint72', v: str1}, {t: 'uint128', v: str2}));
console.log("sig: " + sig);
// r, s, vを各々定義する
var r = sig.slice(0,66);
var s = '0x' + sig.slice(66,130);
var v = Number(sig.slice(130,132)) + 27; // これだけ数値型
console.log("v: " + v);
console.log("r: " + r);
console.log("s: " + s);
*/
