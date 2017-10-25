pragma solidity ^0.4.15;
contract BulkedGIIAM {
  /*** 変数の宣言 ***/
  // ディフィカルティとターゲットの設定
  uint32 public diff;
  uint256 public target;
  uint256 public coefficient;
  uint256 public exponent;
  // 分割数の限界
  uint8 divLimit;
    
  // デバック用
  bytes5 strKeyIDSpace;
  bytes2[2] strRangeIDSpace;
  bytes9 strIDSpace;
  int proc;
  // ハッシュとターゲットの値
  bytes32 public hashTEST;
  bytes32 public hashTEST2;
  bytes32 public targetTEST;

  /*** 構造体の定義 ***/
  // 所有者のトレーサビリティ用の外部array
  struct Record64 {
    OwnerData owner;
    OwnerData[] pastOwner;
    DomainData domain;
    DomainData[] pastDomain;
    uint32 parent; // ID空間のレンジをキーとする
    uint8 childNum;
    mapping(uint8 => Record64) children;
  }
  // 過去の所有者情報
  struct OwnerData {
    address addr;
    uint64 blockHeight;
  }
  // 過去のドメイン情報
  struct DomainData {
    string name;
    uint64 blockHeight;
  }
  // ソートが行われているか確認する
  struct CheckSort {
    uint16 middle;
    uint8 to;
    uint8 owner;
  }
  struct KeyInfo {
    uint40 keyIDSpace;
    uint32 keyRange;
    uint16 startOfRange;
    uint16 endOfRange;
  }
  struct Tmp {
    uint32 newKeyRange;
    uint8 i;
  }
  
  /*** 変数のマッピング ***/
  /* SLDc: 40bit, ic: 64bitのucode */
  // 所有者、ディレクトリサービスなどを定義
  mapping(uint40 => mapping(uint32 => Record64)) record64;
  // 発行済か
  mapping(uint40 =>  bool) public issued64;
  // 譲渡が有効なID空間か(ブランチのHeadであるか)
  mapping(uint40 => mapping(uint32 => bool)) valid64;
  // Recordの識別ID用のnonce
  mapping(uint40 => uint24) public nonce64;
  
  /* SLDc: 56bit, ic: 48bitのucode */
  // 作成中
  
  /* SLDc: 24bit, ic: 80bitのucode */
  // 作成中
  
  /*** コンストラクタの作成 ***/
  function BulkedGIIAM(){
    /** 使用する変数 **/
    // ディフィカルティの設定
    diff = 0x207fffff;
    coefficient = uint256(uint24(diff));
    exponent = uint256((diff >> 24));
    target = coefficient << (8 * (exponent - 3)); // 0x03a30c0000000000000000000000000000000000000000000000000000000000
    targetTEST = bytes32(target);

    // 分割数の限界
    divLimit = 16;    
    
    // デバック変数の初期化
    strIDSpace = bytes9(0);
    proc = 0;
  }
  
  /*** メソッド一覧 ***/
  // 64bitプリフィックスID空間の発行、nonceとディジタル署名の入力が必要
  function regIDSpace64(uint40 _inputKey, uint64 _blockHeight, uint64 _nonce) public returns (bool) {
    /** 変数の宣言 **/
    // 16bitのレンジを示す(最大2^16=65536の分割ができる)
    uint32 geneRange = 0x0000ffff;
    uint256 blockHash = uint256(block.blockhash(_blockHeight));
    uint256 hash;
    
    /** 入力に対する処理(エラー含む) **/
    // _inputKeyのエラー処理1 -> 予約されているID空間か
    if (_inputKey == 0) {
      proc = -1;
      return false;
    }
    // _inputKeyのエラー処理2 -> 発行済のID空間か
    if (issued64[_inputKey]) {
      proc = -2;
      return false;
    }
    // _blockHeightのエラー処理1 -> ブロック高が有効なブロックか
    if (blockHash == 0) {
      proc = -3;
      return false;
    }
    // PoWを実行してdifficultyより小さいか確認
    hash = uint256(sha3(_inputKey, blockHash, _nonce));
    hashTEST = bytes32(hash);
    if (hash > target) {
      proc = -4;
      return false;
    }
            
    /** ID空間の発行処理を実行 **/
    // 所有権を付与する、ディジタル署名による確認は不要(送信者のアドレスが入るため)
    record64[_inputKey][geneRange].owner.addr = msg.sender;
    record64[_inputKey][geneRange].owner.blockHeight = uint64(block.number);
    // ルートになるため、親は存在しない
    record64[_inputKey][geneRange].parent = 0;
    // ID空間が発行済になったことを示す
    issued64[_inputKey] = true;
    // ID空間が譲渡可能であることを示す
    valid64[_inputKey][geneRange] = true;
    // Recordの識別用のNonceを定義する(更新回数を記述)
    nonce64[_inputKey] = 1;
    
    /** デバック用 **/
    strKeyIDSpace = bytes5(_inputKey);
    strRangeIDSpace[0] = bytes2(uint16((geneRange >> 16)));
    strRangeIDSpace[1] = bytes2(uint16(geneRange));
    strIDSpace = bytes9((uint72(strKeyIDSpace) << 32) + (uint72(strRangeIDSpace[0]) << 16) + uint72(strRangeIDSpace[1]));
    proc = 1;
    
    return true;
  }

  // 権利の譲渡を行うトランザクション
  function transferRight64(uint72 _keyIDSpaceAndRange, uint128 _validateBlockHeight, address _to, uint8 _v, bytes32 _r, bytes32 _s) public returns(bool){
    /** 変数の宣言 **/
    uint40 keyIDSpace = uint40(_keyIDSpaceAndRange >> 32);
    uint32 keyRange = uint32(_keyIDSpaceAndRange);

    /** 入力に対する処理(エラー含む) **/
    /* 入力ID空間に関する処理 */
    // 発行済のID空間でない場合
    if (!issued64[keyIDSpace]) {
      proc = -11;
      return false;
    }
    // ID空間が譲渡可能なものであるか確認
    if (!valid64[keyIDSpace][keyRange]) {
      proc = -12;
      return false;
    }
    // 送信者が所有しているID空間であるか確認
    if (record64[keyIDSpace][keyRange].owner.addr != msg.sender) {
      proc = -13;
      return false;
    }
    /* 有効なブロック高に関する処理 */
    // 現在のブロック高がTxが有効であるブロック高を超えたら無効になる
    if (block.number > _validateBlockHeight) {
      proc = -14;
      return false;
    }
    
    /* ディジタル署名の検証 */
    hashTEST2 = sha3(_keyIDSpaceAndRange, _validateBlockHeight);
    if (ecrecover(bytes32(sha3(_keyIDSpaceAndRange, _validateBlockHeight)), _v, _r, _s) != _to) {
      proc = -15;
      return false;
    }

    /* 権利の変更を行う */
    // 過去の所有者リストに代入
    record64[keyIDSpace][keyRange].pastOwner.push(record64[keyIDSpace][keyRange].owner);
    // 署名を行った人に権利を譲渡
    record64[keyIDSpace][keyRange].owner.addr = _to;
    record64[keyIDSpace][keyRange].owner.blockHeight = uint64(block.number);


    
    proc = 2;
    return true;    
  }

  // ドメイン情報の更新
  function updateDomain64(uint72 _keyIDSpaceAndRange, string _domain) public returns(bool){
    /** 変数の宣言 **/
    uint40 keyIDSpace = uint40(_keyIDSpaceAndRange >> 32);
    uint32 keyRange = uint32(_keyIDSpaceAndRange);

    /** エラー処理 **/
    // _keyIDSpaceAndRange入力のエラー処理
    if (record64[keyIDSpace][keyRange].owner.addr != msg.sender) {
      proc = -21;
      return false;
    }

    /** データベース更新処理 **/
    // 現在のドメインを過去のドメインとして登録
    // まだドメインが登録されている場合のみ、この処理を行う
    if (record64[keyIDSpace][keyRange].pastDomain.length > 0) {
      record64[keyIDSpace][keyRange].pastDomain.push(record64[keyIDSpace][keyRange].domain);
    }
    // ドメイン名の更新
    proc = 3;
    record64[keyIDSpace][keyRange].domain.name = _domain;
    record64[keyIDSpace][keyRange].domain.blockHeight = uint64(block.number);
    return true;
  }
  

  //  譲渡トランザクションの生成
  /**** _ownerPlaceはいらない(なぜなら_toPlaceに譲渡した後にthe othersを代入すれば良いから(既に所有者がいる所は無効にして代入していく)) ****/
  function transferIDSpace64(uint72 _keyIDSpaceAndRange, uint128 _validateBlockHeight, uint16[] _middleOfRange, uint8[] _toPlace, uint8[] _ownerPlace, address[] _to,
			     uint8[] memory _v, bytes32[] memory _r, bytes32[] memory _s) public returns(bool){
    /** 変数の宣言 **/
    // IDの設定
    KeyInfo storage keyInfo;
    keyInfo.keyIDSpace = uint40(_keyIDSpaceAndRange >> 32);
    keyInfo.keyRange = uint32(_keyIDSpaceAndRange);
    // 開始と終了Rangeの設定
    keyInfo.startOfRange = uint16(keyInfo.keyRange >> 16);
    keyInfo.endOfRange = uint16(keyInfo.keyRange);
    // IDと所有者の入力においてソートが行われているか確認する一時変数
    CheckSort storage check;
    /*
    uint16 checkIDSort;
    uint8 checkToSort;
    uint8 checkOwnerSort;
    */

    // ストレージ変数
    Tmp storage tmp;

    /** 入力に対するエラー処理 **/
    // ID空間所有者が作成したTxか
    if (record64[keyInfo.keyIDSpace][keyInfo.keyRange].owner.addr != msg.sender) {
      proc = -31;
      return false;
    }
    // 譲渡が可能なID空間か
    if (!valid64[keyInfo.keyIDSpace][keyInfo.keyRange]) {
      proc = -32;
      return false;
    }
    // 現在のブロック高がTxが有効であるブロック高を超えたら無効になる
    if (block.number > _validateBlockHeight) {
      proc = -321;
      return false;
    }
    // 入力数が分割数限界以下の範囲に収まっているか
    if ((_middleOfRange.length + 1) > divLimit) {
      proc = -33;
      return false;
    }
    // 分割の開始と終了がkeyOfRangeの範囲に収まっているか
    if ((_middleOfRange[0] < keyInfo.startOfRange) || (keyInfo.endOfRange < _middleOfRange[_middleOfRange.length - 1])) {
      proc = -34;
      return false;
    }    
    // 分割がソートされているか確認
    check.middle = _middleOfRange[0];
    for (tmp.i = 1; tmp.i < _middleOfRange.length; tmp.i++) {
      if (!(check.middle < _middleOfRange[tmp.i])) {
	proc = -35;
	return false;
      }
      check.middle = _middleOfRange[tmp.i];
    }
    // 所有者が所有する分割対象数が一致するかどうか
    if ((_toPlace.length + _ownerPlace.length) != (_middleOfRange.length + 1)) {
      proc = -36;
      return false;
    }
    // 所有者が指定した空間と所有者の人数が一致する必要
    if (_toPlace.length != _to.length) {
      proc = -361;
      return false;
    }    
    // 所有者が新たに所有するID空間の範囲が正しいか確認(0-_middleOfRange.lengthであることに注意！(ゼロオリジン))
    if ((_ownerPlace[0] < 0) || (_ownerPlace[_ownerPlace.length - 1] < _middleOfRange.length)) {
      proc = -37;
      return false;
    }
    // 所有者が所有する分割対象がdivSizeの範囲に収まっているか(この条件を満たすために入力を階段状にする必要がある)
    check.owner = _ownerPlace[0];
    for (tmp.i = 1; tmp.i < _ownerPlace.length; tmp.i++) {
      if (!(check.owner < _ownerPlace[tmp.i])) {
	proc = -38;
	return false;
      }
      check.owner = _ownerPlace[tmp.i];
    }
    // 所有者が所有する分割対象がdivSizeの範囲に収まっているか(この条件を満たすために入力を階段状にする必要がある)
    check.to = _toPlace[0];
    for (tmp.i = 1; tmp.i < _toPlace.length; tmp.i++) {
      if (!(check.to < _toPlace[tmp.i])) {
	proc = -39;
	return false;
      }
      check.to = _toPlace[tmp.i];
    }

    /** 受け手側により生成されたディジタル署名の検証 **/
    for (tmp.i = 0; tmp.i < _to.length; tmp.i++) {
      if (ecrecover(bytes32(sha3(_keyIDSpaceAndRange, _validateBlockHeight, _middleOfRange, _toPlace, _ownerPlace, _to)), _v[tmp.i], _r[tmp.i], _s[tmp.i]) != _to[tmp.i]) {
	proc = -40;
	return false; // ここに誰の所為で署名に失敗したか追加する
      }
    }
    
    /** 入力ID空間の無効化 **/
    // 譲渡ができないID空間(履歴)に
    valid64[keyInfo.keyIDSpace][keyInfo.keyRange] = false;
    
    /** 新しいID空間の出力 **/
    // 新しいID空間のKeyの記述
    // 送り先のデータベースの更新
    for (tmp.i = 0; tmp.i < _to.length; tmp.i++) {
      if (_toPlace[tmp.i] == 0) {
	tmp.newKeyRange = (uint32(keyInfo.startOfRange) << 16) + uint32(_middleOfRange[_toPlace[tmp.i]]);
	record64[keyInfo.keyIDSpace][tmp.newKeyRange].owner.addr = _to[tmp.i];
      } else if (_toPlace[tmp.i] == _middleOfRange.length) {
	tmp.newKeyRange = (uint32(_middleOfRange[_toPlace[tmp.i]]) << 16) + uint32(keyInfo.endOfRange);
	record64[keyInfo.keyIDSpace][tmp.newKeyRange].owner.addr = _to[tmp.i];
      } else {
	tmp.newKeyRange = (uint32(_middleOfRange[_toPlace[tmp.i]]) << 16) + uint32(_middleOfRange[_toPlace[tmp.i]]);
	record64[keyInfo.keyIDSpace][tmp.newKeyRange].owner.addr = _to[tmp.i];
      }
    }
    // 所有者のデータベースの更新
    for (tmp.i = 0; tmp.i < _ownerPlace.length; tmp.i++) {
      if (_toPlace[tmp.i] == 0) {
	tmp.newKeyRange = (uint32(keyInfo.startOfRange) << 16) + uint32(_middleOfRange[_ownerPlace[tmp.i]]);
	record64[keyInfo.keyIDSpace][tmp.newKeyRange].owner.addr = msg.sender;
      } else if (_toPlace[tmp.i] == _middleOfRange.length) {
	tmp.newKeyRange = (uint32(_middleOfRange[_ownerPlace[tmp.i]]) << 16) + uint32(keyInfo.endOfRange);
	record64[keyInfo.keyIDSpace][tmp.newKeyRange].owner.addr = msg.sender;
      } else {
	tmp.newKeyRange = (uint32(_middleOfRange[_ownerPlace[tmp.i]]) << 16) + uint32(_middleOfRange[_ownerPlace[tmp.i]]);
	record64[keyInfo.keyIDSpace][tmp.newKeyRange].owner.addr = msg.sender;
      }
    }
    proc = 4;
    return true;
    
    // デバック用に変数を代入

  } 
  
  // 所有権の確認
  function getAddr64(uint72 _keyIDSpaceAndRange) public returns(address){
    uint40 keyIDSpace = uint40(_keyIDSpaceAndRange >> 32);
    uint32 keyRange = uint32(_keyIDSpaceAndRange);
    return record64[keyIDSpace][keyRange].owner.addr;
  }
  function getValid64(uint72 _keyIDSpaceAndRange) public  returns(bool){
    uint40 keyIDSpace = uint40(_keyIDSpaceAndRange >> 32);
    uint32 keyRange = uint32(_keyIDSpaceAndRange);
    return valid64[keyIDSpace][keyRange];
  }
  function getIssued(uint40 _keyIDSpace) public returns(bool){
    return issued64[_keyIDSpace];
  }
  function getDomain64(uint72 _keyIDSpaceAndRange) public returns(string){
    uint40 keyIDSpace = uint40(_keyIDSpaceAndRange >> 32);
    uint32 keyRange = uint32(_keyIDSpaceAndRange);
    return record64[keyIDSpace][keyRange].domain.name;
  }
  /*
  function findLocation64(uint128 _keyGlobalID) public returns(bytes9){
    return 
  }
  */

  // ディジタル署名を検証するmメソッド
  function verify(bytes32 _hashToSign, uint8 _v, bytes32 _r, bytes32 _s) constant returns(address) {
    return ecrecover(_hashToSign, _v, _r, _s);
  }

  // デバック用関数
  function getIDS() public returns(bytes9){
    return strIDSpace;
  }
  function getProc() public returns(int){
    return proc;
  }
  function getRegHashTest() public returns(bytes32){
    return hashTEST;
  }
  function getTransRightHashTest() public returns(bytes32){
    return hashTEST2;
  }
  function getTransHash(uint72 _keyIDSpaceAndRange, uint128 _validateBlockHeight, uint16[] _middleOfRange, uint8[] _toPlace,
		   uint8[] _ownerPlace, address[] _to) public returns(bytes32){
    return sha3(_keyIDSpaceAndRange, _validateBlockHeight, _middleOfRange, _toPlace, _ownerPlace, _to);
  }
  
      
  /*** Private メソッド ***/
}
