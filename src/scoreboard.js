let runkey;
let display1st = false;
let displaycongra = false;
let bch = null;
(function init(closecounter = 0) {
  const key = Symbol();
  runkey = key;
  // let sock = new WebSocket("ws://127.0.0.1:3000");
  let sock = new WebSocket("wss://cooperative-cliff-grenadilla.glitch.me");
  // let sock = new WebSocket("wss://mangrove-rocky-client.glitch.me");

  function send(m) {
    if (sock != null && key === runkey) {
      sock.send(JSON.stringify(m));
    }
  }

  const cover = document.getElementById("cover");

  const backvideo = document.getElementById("backvideo");

  const firstbox = document.getElementById("first");

  const category = document.getElementById("category");

  const rankingbox = document.getElementById("score");
  rankingbox.innerHTML = '<hr>しばらく待ってもこの表示が消えない場合は、パスワードを間違えている可能性があります。右下の「設定」から再設定してみてください。';

  const createbtn = document.getElementById("create");

  const sortbtn = document.getElementById("sort");

  const board = {};

  let setting = {
    p: null,
    er: false,
    cl: false,
    uid: Date.now().toString(16) + Math.random().toString(16)
  };

  const nowtop = {
    top: false
  };

  function setcookie() {
    if (key === runkey) {
      document.cookie =
        "meringue=" +
        encodeURIComponent(JSON.stringify(setting)) +
        "; max-age=432000";
    }
  }

  function crel(text, classname) {
    const e = document.createElement("div");
    if (text != null) {
      e.innerText = text;
    }
    if (classname != null) {
      e.className = classname;
    }
    return e;
  }

  function crop(parent, ...op) {
    op.forEach(opt => {
      const e = document.createElement("option");
      if (opt != null) {
        e.value = opt;
        e.innerText = opt;
      }
      if (parent != null) {
        parent.appendChild(e);
      }
    });
  }

  function congra(scores) {
    if (scores.length !== 0) {
      if (bch != null) {
        bch.postMessage('congra');
      }
      if (displaycongra === false) {
        const congrabox = document.createElement('div');
        const video = document.createElement('video');
        const namebox = document.createElement('div');
        namebox.classList.add('congraname');
        displaycongra = namebox;
        video.src = 'src/congra.mp4';
        video.classList.add('congravideo');
        video.addEventListener('ended', () => {
          video.pause();
          video.remove();
          congrabox.remove();
          displaycongra = false;
          if (bch != null) {
            bch.postMessage('congraout');
          }
        });
        document.body.appendChild(video);
        video.addEventListener('canplay', () => {
          congrabox.classList.add('congrabox');
          scores.forEach(e => {
            const element = document.createElement('div');
            element.innerText = e.bn + '　' + e.score + e.counter;
            namebox.appendChild(element);
          });
          congrabox.appendChild(namebox);
          document.body.appendChild(congrabox);
          video.play();
        });
      } else {
        scores.forEach(e => {
          const element = document.createElement('div');
          element.innerText = e.bn + '　' + e.score + e.counter;
          displaycongra.appendChild(element);
        });
      }
    }
  }

  function insertscore(rank, name, score, counter, id, index) {
    if (key === runkey) {
      const parent = document.createElement("div");
      const rankbox = document.createElement("div");
      rankbox.innerText = rank;
      if (index === -1) {
        rankbox.classList.add('topmember');
        rankbox.addEventListener("click", () => changescore(id, name, score, rank));
      } else {
        rankbox.addEventListener("click", () => changescore(id, name, score, category.value));
      }
      const namebox = document.createElement("div");
      namebox.innerText = name;
      const scorebox = document.createElement("div");
      scorebox.innerText = score + counter;
      parent.appendChild(rankbox);
      parent.appendChild(namebox);
      parent.appendChild(scorebox);
      rankingbox.appendChild(parent);
      if (display1st && index < 1) {
        const bigparent = document.createElement('div');
        firstbox.classList.remove('none');
        const bigrankbox = document.createElement("div");
        const bigscorebox = document.createElement("div");
        bigscorebox.innerText = score + counter;
        bigparent.appendChild(bigrankbox);
        bigparent.appendChild(bigscorebox);
        if (index === -1) {
          bigrankbox.innerText = rank + '最高記録';
          bigrankbox.classList.add('dsptopranks');
          bigscorebox.classList.add('dsptopscores');
          firstbox.classList.add('fireworks');
        } else {
          backvideo.classList.remove('none');
          bigrankbox.innerText = category.value + '最高記録';
          firstbox.classList.remove('fireworks');
          const bignamebox = document.createElement("div");
          bignamebox.innerText = 'ᅠ';
          bigparent.appendChild(bignamebox);
        }
        firstbox.appendChild(bigparent);
      }
    }
  }

  function pass() {
    if (key === runkey) {
      cover.classList.remove('none');
      const box = crel(null, "glass notice");
      const heading = crel("パスワードを入力してください", "heading");
      box.appendChild(heading);
      const passwordbox = document.createElement("input");
      passwordbox.type = "password";
      passwordbox.placeholder = "パスワードを入力...";
      box.appendChild(passwordbox);
      const note = crel(
        "指定されたパスワードを入力してください。パスワードが間違っていた場合も次に進むことができますが、データを閲覧することはできません。\nまた、このサイトではcookieを利用しています。cookieを有効にしないと記録が見えない場合があります。",
        "note"
      );
      box.appendChild(note);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "認証";
      box.appendChild(btn);
      let p = true;
      function reg() {
        if (p) {
          p = false;
          box.remove();

          setting.p = passwordbox.value;
          setcookie();
          sock.close();
          cover.classList.add('none');
        }
      }
      passwordbox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") reg();
      });
      btn.addEventListener("click", reg);
      document.body.appendChild(box);
    }
  }

  function createboard() {
    if (key === runkey) {
      cover.classList.remove('none');
      const box = crel(null, "glass notice");
      const heading = crel("カテゴリー名を入力してください", "heading");
      box.appendChild(heading);
      const boardnamebox = document.createElement("input");
      boardnamebox.type = "text";
      boardnamebox.placeholder = "カテゴリー名を入力...";
      box.appendChild(boardnamebox);
      const counterbox = document.createElement("input");
      counterbox.type = "text";
      counterbox.placeholder = "助数詞を入力(例: 本、個、回など)";
      box.appendChild(counterbox);
      const note = crel(
        "カテゴリー名が重複している場合、新旧両方のカテゴリーが消去されます。復元はできません。",
        "note"
      );
      box.appendChild(note);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "追加";
      box.appendChild(btn);
      const btn2 = document.createElement("button");
      btn2.type = "button";
      btn2.innerText = "キャンセル";
      box.appendChild(btn2);
      let p = true;
      btn.addEventListener("click", () => {
        if (p && boardnamebox.value !== "") {
          p = false;
          box.remove();
          send({
            type: "createboard",
            data: {
              boardname: boardnamebox.value,
              counter: counterbox.value,
            },
          });
          cover.classList.add('none');
        } else if (boardnamebox.value === "") {
          boardnamebox.focus();
        }
      });
      btn2.addEventListener("click", () => {
        p = false;
        box.remove();
        cover.classList.add('none');
      });
      document.body.appendChild(box);
    }
  }

  function pushscore() {
    if (key === runkey) {
      cover.classList.remove('none');
      const box = crel(null, "glass notice");
      const heading = crel("新しい記録", "heading");
      box.appendChild(heading);

      const namebox = document.createElement("input");
      namebox.type = "text";
      namebox.placeholder = "名前を入力...";
      box.appendChild(namebox);
      const scorebox = document.createElement("input");
      scorebox.type = "number";
      scorebox.placeholder = "記録を入力...";
      box.appendChild(scorebox);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "追加";
      box.appendChild(btn);
      const btn2 = document.createElement("button");
      btn2.type = "button";
      btn2.innerText = "キャンセル";
      box.appendChild(btn2);
      let p = true;
      btn.addEventListener("click", () => {
        if (p && typeof (scorebox.value - 0) === "number") {
          p = false;
          box.remove();
          send({
            type: "pushscore",
            data: {
              boardname: category.value,
              name: namebox.value,
              score: scorebox.value - 0,
            },
          });
          cover.classList.add('none');
        } else if (typeof (scorebox.value - 0) !== "number") {
          scorebox.focus();
        }
      });
      btn2.addEventListener("click", () => {
        p = false;
        box.remove();
        cover.classList.add('none');
      });
      document.body.appendChild(box);
    }
  }

  function changescore(id, name, score, bn) {
    if (key === runkey) {
      cover.classList.remove('none');
      const box = crel(null, "glass notice");
      const heading = crel("記録を変更", "heading");
      box.appendChild(heading);
      const namebox = document.createElement("input");
      namebox.type = "text";
      namebox.placeholder = "名前を入力...";
      namebox.value = name;
      box.appendChild(namebox);
      const scorebox = document.createElement("input");
      scorebox.type = "number";
      scorebox.placeholder = "記録を入力...";
      scorebox.value = score;
      box.appendChild(scorebox);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "変更";
      box.appendChild(btn);
      const btn2 = document.createElement("button");
      btn2.type = "button";
      btn2.innerText = "キャンセル";
      box.appendChild(btn2);
      const btn3 = document.createElement("button");
      btn3.type = "button";
      btn3.innerText = "削除";
      box.appendChild(btn3);
      let p = true;
      btn.addEventListener("click", () => {
        if (p && typeof (scorebox.value - 0) === "number") {
          p = false;
          box.remove();
          send({
            type: "changescore",
            data: {
              boardname: bn,
              id: id,
              name: namebox.value,
              score: scorebox.value - 0,
            },
          });
          cover.classList.add('none');
        } else if (typeof (scorebox.value - 0) !== "number") {
          scorebox.focus();
        }
      });
      btn2.addEventListener("click", () => {
        p = false;
        box.remove();
        cover.classList.add('none');
      });
      btn3.addEventListener("click", () => {
        p = false;
        box.remove();
        send({
          type: "deletescore",
          data: {
            boardname: bn,
            id: id,
          },
        });
        cover.classList.add('none');
      });
      document.body.appendChild(box);
    }
  }

  function changesetting() {
    if (key === runkey) {
      cover.classList.remove('none');
      const box = crel(null, "glass notice");
      const heading = crel("設定", "heading");
      box.appendChild(heading);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "パスワードを再設定";
      box.appendChild(btn);
      const btn2 = document.createElement("button");
      btn2.type = "button";
      if (setting.er) {
        btn2.innerText = "エラー通知を切る";
      } else {
        btn2.innerText = "エラーを通知";
      }
      box.appendChild(btn2);
      const btn3 = document.createElement("button");
      btn3.type = "button";
      if (setting.cl) {
        btn3.innerText = "2回まで通信切断時に再接続";
      } else {
        btn3.className = "redback";
        btn3.innerText = "通信の切断を1回で通知";
      }
      box.appendChild(btn3);
      const btn4 = document.createElement("button");
      btn4.type = "button";
      btn4.innerText = "現在の種目の1位のみ表示";
      btn4.className = "greenback";
      box.appendChild(btn4);
      const close = document.createElement("button");
      close.type = "button";
      close.innerText = "閉じる";
      box.appendChild(close);
      let p = true;
      btn.addEventListener("click", () => {
        if (p) {
          p = false;
          box.remove();
          pass();
          cover.classList.add('none');
        }
      });
      btn2.addEventListener("click", () => {
        if (p) {
          p = false;
          box.remove();
          setting.er = !setting.er;
          setcookie();
          cover.classList.add('none');
        }
      });
      btn3.addEventListener("click", () => {
        if (p) {
          p = false;
          box.remove();
          setting.cl = !setting.cl;
          setcookie();
          cover.classList.add('none');
        }
      });
      btn4.addEventListener("click", () => {
        if (p) {
          p = false;
          box.remove();
          cover.classList.add('none');
          if (category.value !== 'top') {
            display1st = true;
            send({
              type: "getboard",
              data: {
                boardname: category.value,
              },
            });
          } else {
            display1st = true;
            send({
              type: "top"
            });
          }
        }
      });
      close.addEventListener("click", () => {
        p = false;
        box.remove();
        cover.classList.add('none');
      });
      document.body.appendChild(box);
    }
  }

  function warndelete(m) {
    if (key === runkey) {
      cover.classList.remove('none');
      const box = crel(null, "glass notice");
      const heading = crel("警告", "heading warn");
      box.appendChild(heading);
      const note = crel(
        "本当にカテゴリー 「" + m.data.boardname + "」 を削除しますか?",
        "note"
      );
      box.appendChild(note);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "はい。";
      box.appendChild(btn);
      const close = document.createElement("button");
      close.type = "button";
      close.innerText = "いいえ。";
      box.appendChild(close);
      let p = true;
      btn.addEventListener("click", () => {
        if (p) {
          p = false;
          box.remove();
          send(m);
          cover.classList.add('none');
        }
      });
      close.addEventListener("click", () => {
        p = false;
        box.remove();
        cover.classList.add('none');
      });
      document.body.appendChild(box);
    }
  }

  function notice(m, f) {
    const box = crel(null, "glass smallnotice");
    const heading = crel("通知", "heading noticeblue");
    box.appendChild(heading);
    const note = crel(m, "note");
    box.appendChild(note);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = "OK";
    box.appendChild(btn);
    let p = true;
    btn.addEventListener("click", () => {
      if (p) {
        p = false;
        box.remove();
        if (f != null && typeof f === "function") {
          f();
        }
      }
    });
    document.body.appendChild(box);
  }

  document.getElementById("setting").addEventListener("click", changesetting);

  createbtn.addEventListener("click", (e) => {
    if (key === runkey) {
      if (e.ctrlKey || category.value === "top") {
        createboard();
      } else {
        pushscore();
      }
    }
  });

  let podown = 0;
  function poloop() {
    if (podown > 0) {
      podown++;
      if (podown > 120) {
        podown = 0;
        createboard();
      }
      requestAnimationFrame(poloop);
    }
  }
  createbtn.addEventListener("pointerdown", () => {
    if (key === runkey) {
      podown = 1;
      poloop();
    }
  });
  createbtn.addEventListener("pointerup", () => {
    podown = 0;
  });

  sortbtn.addEventListener("click", () => {
    if (key === runkey) {
      send({
        type: "changesort",
        data: { boardname: category.value },
      });
    }
  });

  firstbox.addEventListener('click', () => {
    display1st = false;
    firstbox.classList.add('none');
    backvideo.classList.add('none');
  });

  sock.addEventListener("open", () => {
    if (key === runkey) {
      if (running != null || running === null) {
        running = true;
      }
      closecounter = 0;
      console.log("[OPEN]せつぞく済みなり〜");
      const cookie = document.cookie.split("; ");
      cookie.forEach((e) => {
        const c = decodeURIComponent(e);
        if (c.match(/^meringue=/)) {
          setting = JSON.parse(c.replace(/^meringue=/g, ""));
          if (setting.uid == null) {
            setting.uid = Date.now().toString(16) + Math.random().toString(16);
          }
          setcookie();
        }
      });
      if (setting.p === null) {
        pass();
      } else {
        send({
          type: "password",
          data: {
            p: setting.p,
            boardname: (category.value !== '') ? category.value : 'top'
          },
        });
      }
      category.addEventListener("change", () => {
        if (key === runkey) {
          if (category.value === "top") {
            send({
              type: "top",
            });
          } else {
            send({
              type: "getboard",
              data: {
                boardname: category.value,
              },
            });
          }
        }
      });
    }
  });

  sock.addEventListener("message", (e) => {
    if (key === runkey) {
      const m = JSON.parse(e.data);
      switch (m.type) {
        case "top": {
          firstbox.innerHTML = '';
          category.innerHTML = '<option value="top" selected>トップ</option>';
          m.data.board.forEach((e) => {
            if (e !== "top") {
              const insertoption = document.createElement("option");
              insertoption.value = e;
              insertoption.innerText = e;
              category.appendChild(insertoption);
            }
          });
          rankingbox.innerHTML =
            '<hr><p><span id="viewers">' +
            m.data.date +
            "時点で記録表を見ている人数: " +
            m.data.viewers +
            "</span></p><hr><p>本日はお越しくださりありがとうございます。</p><p>ページ左上にある「種目を選択」のボックスから、記録が見たい種目を選択してください！</p><hr>";
          const h2 = document.createElement('h2');
          h2.innerText = '現在の最高記録';
          let h2counter = 0;
          h2.addEventListener('click', () => {
            if (h2counter > 9 && bch == null) {
              bch = new BroadcastChannel('3a');
              h2.classList.add('warn');
            } else if (h2counter < 10) {
              h2counter++;
            }
          });
          rankingbox.appendChild(h2);
          const congralist = [];
          m.data.board.forEach(bn => {
            if (bn !== 'top') {
              const s = m.data.score[bn];
              if (nowtop[bn] != null) {
                if (nowtop[bn] !== s.id) {
                  congralist.push({ bn: bn, score: s.score, counter: s.counter });
                }
              }
              nowtop[bn] = s.id;
              insertscore(bn, s.name, s.score, s.counter, s.id, -1);
            }
          });
          if (display1st === true) {
            congra(congralist);
          }
          break;
        }
        case "getboard": {
          firstbox.innerHTML = '';
          rankingbox.innerHTML = "<hr>";
          board[m.data.boardname] = m.data;
          let rankdata = {
            rank: 0,
            beforescore: null,
          };
          m.data.score.forEach((s, i) => {
            if (rankdata.beforescore !== s.score) {
              rankdata.beforescore = s.score;
              rankdata.rank = i + 1;
            }
            insertscore(rankdata.rank, s.name, s.score, m.data.counter, s.id, i);
          });
          break;
        }
        case "newboard": {
          const insertoption = document.createElement("option");
          insertoption.value = m.data;
          insertoption.innerText = m.data;
          category.appendChild(insertoption);
          break;
        }
        case "newscore": {
          firstbox.innerHTML = '';
          rankingbox.innerHTML = "<hr>";
          board[m.data.boardname].score.push(m.data);

          if (board[m.data.boardname].sort === 'down') {
            board[m.data.boardname].score.sort(function (a, b) {
              let x = a.score - 0;
              let y = b.score - 0;
              if (x < y) {
                return -1;
              }
              if (x > y) {
                return 1;
              }
              return 0;
            });
          } else {
            board[m.data.boardname].score.sort(function (a, b) {
              let x = a.score - 0;
              let y = b.score - 0;
              if (x > y) {
                return -1;
              }
              if (x < y) {
                return 1;
              }
              return 0;
            });
          }
          let rankdata = {
            rank: 0,
            beforescore: null,
          };
          board[m.data.boardname].score.forEach((s, i) => {
            if (rankdata.beforescore !== s.score) {
              rankdata.beforescore = s.score;
              rankdata.rank = i + 1;
            }
            insertscore(
              rankdata.rank,
              s.name,
              s.score,
              board[m.data.boardname].counter,
              s.id,
              i
            );
          });
          break;
        }
        case "warndelete":
          warndelete(m.data);
          break;
        case "deleteboard":
          if (category.value === m.data.boardname) {
            notice(
              "「" +
              m.data.boardname +
              "」の記録は削除されました。（" +
              m.data.date +
              "）"
            );
            send({
              type: "top",
            });
          } else {
            [...category.children].forEach((e) => {
              if (e.value === m.data.boardname) {
                e.remove();
              }
            });
          }
          break;
        case "viewers": {
          const element = document.getElementById("viewers");
          if (element != null) {
            element.innerText =
              m.data.date + "時点で記録表を見ている人数: " + m.data.viewers;
          }
          break;
        }
      }
    } else {
      sock.close();
    }
  });

  sock.addEventListener("close", () => {
    runkey = false;
    sock = null;
    if (running != null || running === null) {
      running = false;
    }
    console.log("[CLOSED]ご利用ありがとうございました。");
    closecounter++;
    if ((closecounter > 2 || setting.cl) && display1st === false) {
      notice("通信が切断されました", () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://spiffy-tough-megaraptor.glitch.me/', true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');

        const request = encodeURIComponent("msg=wsclosedbtn,cc" + closecounter + ',uid:' + setting.uid);
        xhr.send(request);
        location.reload();
      });
    } else {
      if (closecounter < 10) {
        init(closecounter);
      } else {
        setTimeout(() => init(closecounter), 10000);
      }
    }
  });

  sock.addEventListener("error", () => {
    console.log("[ERROE!]えらーなり");
    if (setting.er) {
      notice("エラーが発生しました", () => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://spiffy-tough-megaraptor.glitch.me/', true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');

        const request = encodeURIComponent("msg=wserrmsgbtn,cc:" + closecounter + ',uid:' + setting.uid);
        xhr.send(request);
      });
    }
  });
})();