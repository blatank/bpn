(function() {
  'use strict';

  // 設定
  const cookieLifeDay = 60*60*24*20; // 20日
  
  // デバッグ用
  const dbg = document.getElementById('debug');

  // クリアボタン
  const clrBtn = document.getElementById('clear');
  clrBtn.onclick = clearAllData;

  // outputボタン
  const outputBtn = document.getElementById('output');
  outputBtn.onclick = saveClipboard;

  // loadボタン
  const loadBtn = document.getElementById('load');
  loadBtn.onclick = loadTextData;


  // 平均値表示箇所
  const tdMorMax = document.getElementById('mor-max-ave');
  const tdMorMin = document.getElementById('mor-min-ave');
  const tdMorPul = document.getElementById('mor-pul-ave');
  const tdNgtMax = document.getElementById('ngt-max-ave');
  const tdNgtMin = document.getElementById('ngt-min-ave');
  const tdNgtPul = document.getElementById('ngt-pul-ave');

  // 日付関連
  const todayBtn = document.getElementById('today');
  // 「今日」ボタンクリック時の処理
  todayBtn.onclick = setDateAsToday;

  const dateEdit = document.getElementById('startDate');
  // 一番上以外の日付情報のchangeイベント設定(手動で更新された場合)
  dateEdit.onchange = updateDate;

  // 一番上以降の日付情報の設定箇所
  const days = document.querySelectorAll('.day');


  // 各データ
  let dataMorMax = document.getElementsByClassName("mor-max");
  let dataMorMin = document.getElementsByClassName("mor-min");
  let dataMorPul = document.getElementsByClassName("mor-pul");
  let dataNgtMax = document.getElementsByClassName("ngt-max");
  let dataNgtMin = document.getElementsByClassName("ngt-min");
  let dataNgtPul = document.getElementsByClassName("ngt-pul");
  const lenMorMax = dataMorMax.length;
  const lenMorMin = dataMorMin.length;
  const lenMorPul = dataMorPul.length;
  const lenNgtMax = dataNgtMax.length;
  const lenNgtMin = dataNgtMin.length;
  const lenNgtPul = dataNgtPul.length;

// ====================================================================宣言部ここまで
  
  // 初期化処理実施
  bpnInit();
  
// ====================================================================読み込み時処理ここまで

  /**
   * 初期化処理
   */
   function bpnInit() {
    // 起動時に日付情報を更新
    loadDate();
    // データロード
    loadInputData();
    
    // 血圧データのコールバック設定
    for (let i=0; i<lenMorMax; i++) {
      // 最大側のエディットボックスでchangeイベントが発生したら最大値を再演算
      dataMorMax[i].onchange = function() {
        calcData(dataMorMax, tdMorMax);
        saveInputData();
      };
    }
    for (let i=0; i<lenMorMin; i++) {
      // 最小側のエディットボックスでchangeイベントが発生したら最小値を再演算
      dataMorMin[i].onchange = function() {
        calcData(dataMorMin, tdMorMin);
        saveInputData();
      };
    }
    for (let i=0; i<lenMorPul; i++) {
      // Pulse(朝)が変更されたら再演算
      dataMorPul[i].onchange = function() {
        calcData(dataMorPul, tdMorPul);
        saveInputData();
      };
    }
    for (let i=0; i<lenNgtMax; i++) {
      // 最大側のエディットボックスでchangeイベントが発生したら最大値を再演算
      dataNgtMax[i].onchange = function() {
        calcData(dataNgtMax, tdNgtMax);
        saveInputData();
      };
    }
    for (let i=0; i<lenNgtMin; i++) {
      // 最小側のエディットボックスでchangeイベントが発生したら最小値を再演算
      dataNgtMin[i].onchange = function() {
        calcData(dataNgtMin, tdNgtMin);
        saveInputData();
      };
    }
    for (let i=0; i<lenNgtPul; i++) {
      // Pulse(夜)が変更されたら再演算
      dataNgtPul[i].onchange = function() {
        calcData(dataNgtPul, tdNgtPul);
        saveInputData();
      };
    }
  }

  /**
   * 今日の日付情報を設定
   */
  function setDateAsToday() {
    // 今日の日付情報を取得
    let today = new Date();
    // 今日のデータを一番上の日付エディットボックスに設定
    dateEdit.value = month_day(today);

    // 一番上以外の日付情報更新(onchange呼ばれないので自前でコール)
    updateDate();
  };
  
  /**
   * 日付情報更新処理
   */
  function updateDate() {

    // 自動箇所はまず空にする
    days.forEach(day => {
      day.innerHTML = "";
    });

    // エディットボックスが空なら終了する
    if (dateEdit.value === "") {
      return;
    }

    // 今日のデータを取得する
    let today = new Date();

    // エディットボックスのデータをDateオブジェクトに変換
    // ここに日付しかない場合は年が2001年に設定される
    // 年を今現在のデータに修正してからDateオブジェクトを生成
    let date = new Date(`${today.getFullYear()}/${dateEdit.value}`);

    // cookie更新
    saveDate(date);

    // 残りの日付情報更新
    // dayは一番上以外の要素が入っている(一番上はinput要素、それ以外はtd要素)
    for (let i=0; i<days.length; i++) {
      // dateに1日足す
      date.setDate(date.getDate() + 1);   // 月末に+1してもこれでうまく行く

      // tdに設定
      days[i].innerHTML = month_day(date);  // 整形はmonth_dayで実施
    }
  }

  /**
   * 日付情報を整形("month/days")の形にする
   * @param {Date} date 日付 
   * @returns String 日付("Moth/Day"の形)
   */
  function month_day(date) {
    // getMonthは0始まりの月を返す(0=1月)
    // getDateは日付を返す
    return `${date.getMonth()+1}/${date.getDate()}`;
  }

  /**
   * 平均値演算
   * @param {Array(HTMLElement)} data エディットボックスの配列(1列すべて) 
   * @param {HTMLElement} output 平均の出力先(td要素を想定)
   */
  function calcData(data, output) {
    // 母数と平均値を0で初期化
    let num = 0;
    let sum = 0;
    
    // 入力値から平均値を求める
    for (let i=0; i<data.length; i++) {
      if (!isNaN(data[i].value)       // 文字列(dataMorMax[i].value)が数字かどうか
                                      // isNaNは文字列が非数ならtrueを返す
                                      // ので、!をつけて数字ならtrueを返す
                                      // ただし、空文字は数字扱いにされる 
       && data[i].value.length > 0) { // ↑が空文字だと抜けてくるので、文字列の長さを見て、0より大きければ
                                      // 空文字じゃないので、それ以降の処理をする

        // 入力値を数値に変換して合計に加算
        sum += parseInt(data[i].value);
        // 計算できた入力数をインクリメント
        num++;
      }
    }

    // 計算できる要素がなかった場合(0割防止)
    if (num === 0) {
      // データがないときは-に設定
      output.innerHTML = "-";
    }
    else {
      // 平均値を計算しtd内に設定
      // 小数点第1位までを有効桁とする
      output.innerHTML = Math.round(sum * 10 / num) / 10;
    }
  }

  /**
   * 全血圧データを再演算
   */
  function calcAllData() {
    calcData(dataMorMax, tdMorMax);
    calcData(dataMorMin, tdMorMin);
    calcData(dataMorPul, tdMorPul);
    calcData(dataNgtMax, tdNgtMax);
    calcData(dataNgtMin, tdNgtMin);
    calcData(dataNgtPul, tdNgtPul);
  }

  /**
   * 入力データをクリアする
   */
  function clearAllData() {
    // ループ回数は日付 * 2回 
    let loopNum = (days.length + 1) * 2;
    for (let i=0; i<loopNum; i++) {
      dataMorMax[i].value = "";
      dataMorMin[i].value = "";
      dataMorPul[i].value = "";
      dataNgtMax[i].value = "";
      dataNgtMin[i].value = "";
      dataNgtPul[i].value = "";
    }
    // 再演算しておく
    calcAllData();    

    // 日付もクリア(自動箇所はupdateDate()でクリア)
    dateEdit.value = "";
    updateDate();

    // cookieを一度クリアする
    updateCookie("date", "", 0);
    updateCookie("data", "", 0);
  }

  /**
   * 入力データの保存
   */
  function saveInputData() {
    // ループ回数は日付 * 2回 
    let loopNum = (days.length + 1) * 2;
    let dataForSave = "";
    for (let i=0; i<loopNum; i++) {
      if (i > 0) dataForSave += ",";
      dataForSave += `${dataMorMax[i].value},${dataMorMin[i].value},${dataMorPul[i].value},${dataNgtMax[i].value},${dataNgtMin[i].value},${dataNgtPul[i].value}`;
    }
    updateCookie("data", dataForSave, cookieLifeDay);
  }

  /**
   * 血圧データのロード
   */
  function loadInputData() {
    let re = /data=([\d|,]+)/;
    let value = re.exec(document.cookie);

    // 該当cookieが存在
    if (value) {
      let datas = value[1].split(",");

      if (datas.length > 0 && (datas.length % 6) === 0) {
        // ループ回数は日付 * 2回 
        let loopNum = (days.length + 1) * 2;
        for (let i=0; i<loopNum; i++) {
          dataMorMax[i].value = datas[i*6];
          dataMorMin[i].value = datas[i*6+1];
          dataMorPul[i].value = datas[i*6+2];
          dataNgtMax[i].value = datas[i*6+3];
          dataNgtMin[i].value = datas[i*6+4];
          dataNgtPul[i].value = datas[i*6+5];
        }
        calcAllData();
      }
    }
  }

  /**
   * cookieの更新(汎用関数)
   * @param {String} name cookie名
   * @param {String} value cookie値
   * @param {Number} maxAge 有効期限(秒)
   */
  function updateCookie(name, value, maxAge) {
    document.cookie = `${name}=${value}; max-age=${maxAge}`;
  }

  /**
   * 日付情報のロード
   */
  function loadDate() {
    let re = /date=(\d+)/;
    let value = re.exec(document.cookie);

    // 該当cookieが存在
    if (value) {
      // [1]が取り出した値$1
      dateEdit.value = month_day(new Date(parseInt(value[1])));
      
      // 一番上以外の日付情報更新(onchange呼ばれないので自前でコール)
      updateDate();
    }
  }

  /**
   * 日付情報の保存
   * @param {Date} date 日付 
   */
  function saveDate(date) {
    // 時間として保存(月/日で保存するとまた2001年になってしまうため)
    updateCookie("date", date.getTime(), cookieLifeDay);
  }

  /**
   * クリップボードにすべてのデータを保存
   */
  function saveClipboard() {
    // cookieのデータをクリップボードに保存
    navigator.clipboard.writeText(document.cookie).then(function() {
      // 成功
      alert(`クリップボードに\n${document.cookie}\nをコピーしました！`);
    }, function() {
      // 失敗
      alert('クリップボードの操作に失敗しました');
    });
  }

  /**
   * すべてのデータを入力文字列からロードする
   */
  function loadTextData() {
    const inputStr = prompt("データを入力下さい(outputボタンをクリックしたときのもの)。");
    if (inputStr) {
      let res = 0;

      // date抽出
      const date_re = /date=(\d+)/;
      const date_value = date_re.exec(inputStr);
      
      // dateが有効？
      if (date_value) {
        // cookie保存する
        document.cookie = `date=${date_value[1]}`;

        // 起動時に日付情報を更新
        loadDate();

        res += 1;
      }

      // data抽出
      const data_re = /data=([\d|,]+)/;
      const data_value = data_re.exec(inputStr);

      // dataが有効？
      if (data_value) {
        // cookie保存する
        document.cookie = `data=${data_value[1]}`;

        // データロード
        loadInputData();

        res += 2;
      }

      // メッセージ出力
      if (res === 3) {
        alert("データロードしました！");
      }
      else if (res === 2) {
        alert("日付情報のロードに失敗しました");
      }
      else if (res === 1) {
        alert("血圧・心拍数のロード似失敗したか、もともとデータがありませんでした");
      }
      else {
        alert("入力されたデータは有効データではありませんでした");
      }
    }
  }
})();