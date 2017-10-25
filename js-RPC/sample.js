// Web3の利用
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
web3.eth.defaultAccount=web3.eth.accounts[0]

// passwordが"test"で作成
// var _account = web3.personal.newAccount("test");
// アカウントなどをコマンドライン上に出力
// console.log(_account)
console.log("Debug")

// コントラクトへの接続
var addr = "0xf8380187691f589354756e19289a0dbbce750c3f";
var abi = [{"constant":true,"inputs":[{"name":"","type":"uint160"}],"name":"issued","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"GlobalIDRegAndMgt","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_baKeyOfIDSpace","type":"bytes20"},{"name":"_baMiddleOfRange","type":"bytes10"},{"name":"_toAddress","type":"address"},{"name":"_which","type":"uint8"}],"name":"transferIDSpace","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getSLIDS0","outputs":[{"name":"","type":"bytes10"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_keyOfIDSpace","type":"bytes20"}],"name":"getValid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint160"}],"name":"valid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint160"}],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"getProc","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getLIDS","outputs":[{"name":"","type":"uint160"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_inputStartOfRange","type":"uint64"}],"name":"regIDSpace","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getSLIDS1","outputs":[{"name":"","type":"bytes10"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_keyOfIDSpace","type":"bytes20"}],"name":"getAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_keyOfIDSpace","type":"bytes20"}],"name":"getIssued","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_hashToSign","type":"bytes32"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"verify","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]

// 利用できるようになったコントラクト
test = web3.eth.contract(abi).at(addr);

// コントラクトを使ってみる(gas limitは高めに設定した方が良い)
test.regIDSpace.sendTransaction(80, {gas: 3000000});
var a = test.getProc.call();
console.log(test.getSLIDS0.call())
console.log(test.getSLIDS1.call())

// ディジタル署名の実行 
var encoded = '0x70617373776f726465';
sig = web3.eth.sign(web3.eth.accounts[0], web3.sha3(encoded));
console.log("sig: " + sig)
// r, s, vを各々定義する
var r = sig.slice(0,66);
var s = '0x' + sig.slice(66,130);
var v = sig.slice(130,132);

// web3.sha3('\x19Ethereum Signed Message:\n' + encoded.length + encoded)
console.log(v)
var addr = test.verify.call(web3.sha3(encoded), Number(v) + 27, r, s);
console.log(addr)
