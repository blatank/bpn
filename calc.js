(function() {
  'use strict';
  
  // デバッグ用ボタン
  const btn = document.getElementById('test');

  // 平均値表示箇所
  const maxEdit = document.getElementById('max-ave');
  const minEdit = document.getElementById('min-ave');

  // 日付関連
  const todayBtn = document.getElementById('today');
  const dateEdit = document.getElementById('startDate');
  let day = document.getElementsByClassName("day");

  // 各データ
  let maxData = document.getElementsByClassName("mor-max");
  let minData = document.getElementsByClassName("mor-min");
  const lenMax = maxData.length;
  const lenMin = minData.length;

  // 起動時に日付乗法を更新
  loadDate();

  // 血圧データのコールバック設定
  for (let i=0; i<lenMax; i++) {
    // 最大側のエディットボックスでchangeイベントが発生したら最大値を再演算
    maxData[i].onchange = calcMax;
  }
  for (let i=0; i<lenMin; i++) {
    // 最小側のエディットボックスでchangeイベントが発生したら最小値を再演算
    minData[i].onchange = calcMin;
  }

  // テスト用ボタン(クリック時に動作)
  btn.onclick = calc;

  // 「今日」ボタンクリック時の処理
  todayBtn.onclick = function() {
    // 今日の日付情報を取得
    let today = new Date();
    // 今日のデータを一番上の日付エディットボックスに設定
    dateEdit.value = month_day(today);

    // 一番上以外の日付情報更新(onchange呼ばれないので自前でコール)
    updateDate();
  };

  // 一番上以外の日付情報のchangeイベント設定(手動で更新された場合)
  dateEdit.onchange = updateDate;
  
  // 日付情報更新処理
  function updateDate() {
    // まず今日のデータを取得する
    let today = new Date();

    // エディットボックスのデータをDateオブジェクトに変換
    // ここに日付しかない場合は年が2001年に設定される
    let date = new Date(dateEdit.value);

    // dateは2001年になっているので、年を今現在のデータに修正する
    date.setFullYear(today.getFullYear());

    // cookie更新
    saveDate(date);

    // 残りの日付情報更新
    // dayは一番上以外の要素が入っている(一番上はinput要素、それ以外はtd要素)
    for (let i=0; i<day.length; i++) {
      // dateに1日足す
      date.setDate(date.getDate() + 1);   // 月末に+1してもこれでうまく行く

      // tdに設定
      day[i].innerHTML = month_day(date);  // 整形はmonth_dayで実施
    }
  }

  // 日付情報を整形("month/day")の形にする
  function month_day(date) {
    // getMonthは0始まりの月を返す(0=1月)
    // getDateは日付を返す
    return `${date.getMonth()+1}/${date.getDate()}`;
  }

  // 最大値最小値の平均値更新
  function calc() {
    calcMax();
    calcMin();
  }

  // 最大値の平均値計算
  function calcMax() {
    calcData(maxData, maxEdit);
  }

  // 最小値の平均値計算
  function calcMin() { 
    calcData(minData, minEdit);
  }

  // 平均値計算
  // data: エディットボックスの配列
  // output: 平均の出力先(td要素を想定)
  function calcData(data, output) {
    // 母数と平均値を0で初期化
    let num = 0;
    let sum = 0;
    
    // 入力値から平均値を求める
    for (let i=0; i<data.length; i++) {
      if (!isNaN(data[i].value)       // 文字列(maxData[i].value)が数字かどうか
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
      // なにもしない
    }
    else {
      // 平均値を計算しtd内に設定
      output.innerHTML = sum / num;
    }
  }

  function loadDate() {
    let re = /date=(\d+)/;
    let value = re.exec(document.cookie);

    // 該当cookieが存在
    if (value) {
      // [1]が取り出した値$1
      dateEdit.value = month_day(new Date(value[1]));
    }
  }

  // cookie更新
  function saveDate(date) {
    // 時間として保存(月/日で保存するとまた2001年になってしまうため)
    document.cookie = `date=${date.getTime()}`;
  }
})();