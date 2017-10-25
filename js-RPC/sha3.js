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

var contract_json = require('../../TestForBulkedGIIAM/build/contracts/Test.json');
var addr = contract_json.networks[1].address;
var abi = contract_json.abi;
var test = web3.eth.contract(abi).at(addr);


/*** 使わなくなった外部ライブラリ ***/
// (sha3withsizeはdefaultなどともできる)
// var sha3 = require('solidity-sha3').sha3withsize; 


/*** ディジタル署名の実行 ***/
// string型で作成した場合(Solidity側でもStringで受ける必要がある)
// var x1 = new BigNumber('0x22c'); // 0x12c: 300(in decimal)
// console.log(x1);
var str = ["0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795", "0xcd669c440a31f6f54a0fa583abf76fd2badeede7"];
console.log(str.toString(16));

console.log("--- Sha3 Test ---");
console.log("sha3(addr1, addr2): " + web3utils.soliditySha3({t: 'address', v: "0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795"},
							    {t: 'address', v: "0xcd669c440a31f6f54a0fa583abf76fd2badeede7"}));
console.log("sha3(uint160, uint160): " + web3utils.soliditySha3({t: 'uint160', v: "0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795"},
							    {t: 'uint160', v: "0xcd669c440a31f6f54a0fa583abf76fd2badeede7"}));
console.log("sha3(string): " + web3utils.soliditySha3({t: 'bytes', v: "0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795cd669c440a31f6f54a0fa583abf76fd2badeede7"}));
console.log("sha3([addr1, addr2]): " + web3utils.soliditySha3({t: 'address[]', v: str})); // リモートで実行時に得られる結果
console.log("sha3(string(間に\",\"あり)): " + web3utils.soliditySha3({t: 'uint256', v: "0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795"}, {t: 'uint256', v: "0xcd669c440a31f6f54a0fa583abf76fd2badeede7"})); // この結果と一致した。つまりaddress型をuint256型にキャストしてSHA3(keccak256)を実行している
console.log();
console.log("sha3(bytes20): " + web3utils.soliditySha3({t: 'bytes20', v: "0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795"}));
console.log("sha3(addr1): " + web3utils.soliditySha3({t: 'address', v: "0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795"}));
console.log("sha3(uint160): " + web3utils.soliditySha3({t: 'uint160', v: "0x32a3468dcc2118ba9ba8467d4c3b1a1c9e3da795"}));
console.log();
console.log("sha3(0x0001): " + web3utils.soliditySha3({t: 'uint8', v: "0x01"}));
console.log();
console.log("--- 長いSha3の実行テスト --- ");
var strAddrs = ["0xcd669c440a31f6f54a0fa583abf76fd2badeede7", "0xcd669c440a31f6f54a0fa583abf76fd2badeede7", "0xcd669c440a31f6f54a0fa583abf76fd2badeede7"];
console.log("sha3(...): " + web3utils.soliditySha3({t: 'uint256[]', v: [0, 1]}, {t: 'uint256[]', v: []})); // 配列はuint256[]で受けるとうまく動く
console.log("リモート: " + test.Sha3_42.call([0, 1], []));
console.log("sha3(...): " + web3utils.soliditySha3({t: 'uint72', v: "0x000000001e0000ffff"}, {t: 'uint128', v: "0x01"}, {t: 'uint16[]', v: [0x0008, 0x0010, 0x00f0]},
						      {t: 'uint8[]', v: [0x00, 0x01, 0x02]}, {t: 'address[]', v: strAddrs}));
