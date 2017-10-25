// npm外部ライブラリ
var BigNumber = require('bignumber.js');
var leftPad = require('left-pad');

// web3インスタンスを作成
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
web3.eth.defaultAccount=web3.eth.accounts[0]

// クロスドメイン問題になる？
var request = require('request');
var json; // jsonの獲得

// ID空間獲得ウェブアプリ
var targetID;
var targetIDStr;
var decision = 0; // 判断に使う
// JSONデータを取得できたフラグが立った場合に
var jsonFlag = 0;

function response(req, res) {
    var data = "";
    var obj;
    
    function makeHTML() {
	var template = fs.readFileSync("./html/IDSearch.ejs", "utf-8");
	var html = ejs.render(template, {targetIDStr: targetIDStr, decision: decision, json: json, jsonFlag: jsonFlag}); // 名前を決定
	res.writeHead(200, {"Content-type": "text/html"});
	res.write(html);
	res.end();
    }
    
    function getData(chunk) {
      data += chunk;
	// console.log(chunk);
    }
    
    function getDataEnd() {
	obj = qs.parse(data);
	console.log(obj);
	targetID = obj;
	checkInput(targetID);
	makeHTML();
    }
    
    function checkInput(_targetID) {
	console.log("DEBUG");
	if (_targetID.name == '') {
	    console.log("DEBUG1");
	    decision = -1;
	    targetIDStr = _targetID.name;
	} else if (isNaN(_targetID.name)) {
	    console.log("DEBUG2");
	    decision = -2;
	    targetIDStr = _targetID.name;
	} else {
	    console.log("DEBUG3");
	    decision = 1;
	    var num = new BigNumber(_targetID.name);
	    // console.log(num);
	    targetIDStr = "0x" + leftPad(num.toString(16), 32, 0); // 16 Byte = 128bit (=32*4)
	}
	
    }
    
    if (req.method == "POST") {
	decision = 0; // 判定フラグリセット
	jsonFlag = 0;
	req.on('data', getData);
	req.on('end', getDataEnd);
    } else if (req.method == "GET") {
	request('http://prismoid.webcrow.jp/json/11110000ffff0001.json', function (error, response, body) {
	    console.log('error:', error); // Print the error if one occurred
	    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	    console.log('body:', body); // Print the HTML for the Google homepage.
	    json = body;
	    jsonFlag = 1;
	});
	makeHTML();
    } else {
	makeHTML(); // 通常にHTMLを表示
    }

}
 
var http = require("http");
var fs = require("fs");
var ejs = require("ejs");
var qs = require('querystring');
var server = http.createServer();
server.on("request", response);
server.listen(1234);
console.log("server started.");
