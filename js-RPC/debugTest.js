// Web3の利用
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
web3.eth.defaultAccount=web3.eth.accounts[0];

// 関数呼び出し用
var BigNumber = require('bignumber.js'); // npm install bignumber, https://www.npmjs.com/package/bignumber.js
var leftPad = require('left-pad'); // npm install left-pad, https://www.npmjs.com/package/left-padのサイトとかにある
var web3utils = require('web3-utils'); // npm install web3-utils, https://www.npmjs.com/package/web3-utilsなど

// コントラクトの利用
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var contract = require("truffle-contract");
var json = require("../build/contracts/BulkedGIIAM.json");
var BulkedGIIAM = contract(json);
BulkedGIIAM.setProvider(provider);


// トランザクションを発行したり、変数を呼び出せる。テストに使えるが使いにくいことに注意する
var deployed;
// ID空間の発行
var keyIDSpace = 34;
var blockHeight = 500;
var nonce = 5;
// ID空間の譲渡
var keyIDSpaceAndRange = 0x1e0000ffff;
var validateBlockHeight = 5000;
var sig = web3.eth.sign(web3.eth.accounts[1], web3utils.soliditySha3({t: 'uint72', v: keyIDSpaceAndRange}, {t: 'uint128', v: validateBlockHeight}));
// 譲渡用のディジタル署名
// r, s, vを各々定義する
var r = sig.slice(0,66);
var s = '0x' + sig.slice(66,130);
var v = Number(sig.slice(130,132)) + 27; // これだけ数値型                                                                                                                          
console.log("v: " + v);
console.log("r: " + r);
console.log("s: " + s);

// テスト開始
BulkedGIIAM.deployed().then(function(instance) {
    // ノードで関数呼び出し部, またはトランザクションの発行
    deployed = instance;
    return deployed.regIDSpace64.call(keyIDSpace, blockHeight, nonce, {from: web3.eth.accounts[0]});
}).then(function(result) {
    if (result) {
	deployed.regIDSpace64.sendTransaction(keyIDSpace, blockHeight, nonce, {from: web3.eth.accounts[0], gas: 3000000});
    }
    console.log("sending Tx occurs?: " + result);
    return deployed.getProc.call({from: web3.eth.accounts[0]});
}).then(function(result) {
    // 処理がどこまで進んだかのIDを表示
    console.log(result);
    return deployed.getIDS.call({from: web3.eth.accounts[0]});
}).then(function(result) {
    // 一番最後に操作されたID空間を表示
    console.log("ID Space Data: " + result);
    return deployed.getAddr64.call(0x1e0000ffff, {from: web3.eth.accounts[0]});
}).then(function(result) {
    // ID空間の所有者が誰か判定する
    console.log("Who is Owner?: " + result);
    return deployed.transferRight64.call(keyIDSpaceAndRange, validateBlockHeight, web3.eth.accounts[1], v, r, s, {from: web3.eth.accounts[0]});
}).then(function(result) {
    if (result) {
	return deployed.transferRight64.sendTransaction(keyIDSpaceAndRange, validateBlockHeight, web3.eth.accounts[1], v, r, s, {from: web3.eth.accounts[0], gas: 3000000});
    }
    // ID空間の権利の譲渡を行う
    return false;
}).then(function(result) {
    console.log(result);
}).catch(function(err) {
    alert("ERROR! " + err.message);
});
