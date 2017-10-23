// var ConvertLib = artifacts.require("./ConvertLib.sol"); // artifacts(npm)
// var MetaCoin = artifacts.require("./MetaCoin.sol"); // artifacts(npm)
var BulkedGIIAM = artifacts.require("BulkedGIIAM.sol"); // デプロイするコントラクトを入れる

module.exports = function(deployer) {
    deployer.deploy(BulkedGIIAM);
    // deployer.deploy(HelloWorld); // デプロイするコントラクトを入れる
};
