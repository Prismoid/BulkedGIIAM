[Error: Exceeds block gas limitとなる場合の解決方法]
https://github.com/trufflesuite/truffle/issues/271

[truffle.jsを編集する]
どのEthereumネットワークに接続するか、Gas Limitの設定、rpcなどなど

[デプロイしたコントラクトの呼び方]
truffle compile # ./contracts以下の.solファイルをコンパイルする
truffle migrate # ./migrates以下の指示通りにEthereumネットワークにdeployする(マイニングしている必要あり)
truffle console # コンソールモードで起動

*** console 内において ***
HelloWorld.deployed().then(function(instance) {app = instance;})
BulkedGIIAM.deployed().then(function(instance) {app = instance;})
deployed().then(function(instance) {app = instance;})
[もう一度コントラクトをブロックチェーンに登録]
migrate --reset


以下のようにして関数や変数の呼び出しを実行できる 

app.creator.call()
app.message.call()

*** トランザクションの発行方法 ***

以下のようにする。基本的にweb3を介するだけで同じ

app.getMessage.sendTransaction({from: web3.eth.accounts[0]})

*** デプロイのやり直し ***
rm -rf buildを実行してからコンパイルし直す

*** ID空間譲渡の方法 ***
app.transferRight64.sendTransaction('0x000000001e0000ffff', 0x022c, "0xcd669c440a31f6f54a0fa583abf76fd2badeede7", 27, "0x05f4d232c9e11038d85adfb8a7f0e264702a9e1bb5647820c7ae41688709f623", "0x61ffbd50d8fd99828fe83d56d9e01e6e1d2c3f35639271153367d04ba1484f13")
などとする
bytes32型は文字列型でなくてもエラーがでないため注意する
