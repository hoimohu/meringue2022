let runkey;
(function init() {
  const key = Symbol();
  runkey = key;
  let sock = new WebSocket("wss://cooperative-cliff-grenadilla.glitch.me");

  function send(m) {
    if (sock != null && key === runkey) {
      sock.send(JSON.stringify(m));
    }
  }

  const category = document.getElementById("category");

  const rankingbox = document.getElementById("score");

  const createbtn = document.getElementById("create");

  const sortbtn = document.getElementById("sort");

  const board = {};

  let setting = {
    p: null,
  };

  function setcookie() {
    if (key === runkey) {
      document.cookie =
        "meringue=" +
        encodeURIComponent(JSON.stringify(setting)) +
        "; max-age=86400000";
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

  function insertscore(rank, name, score, counter, id) {
    if (key === runkey) {
      const parent = document.createElement("div");
      const rankbox = document.createElement("div");
      rankbox.innerText = rank;
      rankbox.addEventListener("click", () => changescore(id, name, score));
      const namebox = document.createElement("div");
      namebox.innerText = name;
      const scorebox = document.createElement("div");
      scorebox.innerText = score + counter;
      parent.appendChild(rankbox);
      parent.appendChild(namebox);
      parent.appendChild(scorebox);
      rankingbox.appendChild(parent);
    }
  }

  function pass() {
    if (key === runkey) {
      const box = crel(null, "glass notice");
      const heading = crel("パスワードを入力してください", "heading");
      box.appendChild(heading);
      const passwordbox = document.createElement("input");
      passwordbox.type = "password";
      passwordbox.placeholder = "パスワードを入力...";
      box.appendChild(passwordbox);
      const note = crel(
        "指定されたパスワードを入力してください。パスワードが間違っていた場合も次に進むことができますが、データを閲覧することはできません。",
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
        } else if (boardnamebox.value === "") {
          boardnamebox.focus();
        }
      });
      btn2.addEventListener("click", () => {
        p = false;
        box.remove();
      });
      document.body.appendChild(box);
    }
  }

  function pushscore() {
    if (key === runkey) {
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
        } else if (typeof (scorebox.value - 0) !== "number") {
          scorebox.focus();
        }
      });
      btn2.addEventListener("click", () => {
        p = false;
        box.remove();
      });
      document.body.appendChild(box);
    }
  }

  function changescore(id, name, score) {
    if (key === runkey) {
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
              boardname: category.value,
              id: id,
              name: namebox.value,
              score: scorebox.value - 0,
            },
          });
        } else if (typeof (scorebox.value - 0) !== "number") {
          scorebox.focus();
        }
      });
      btn2.addEventListener("click", () => {
        p = false;
        box.remove();
      });
      btn3.addEventListener("click", () => {
        p = false;
        box.remove();
        send({
          type: "deletescore",
          data: {
            boardname: category.value,
            id: id,
          },
        });
      });
      document.body.appendChild(box);
    }
  }

  function changesetting() {
    if (key === runkey) {
      const box = crel(null, "glass notice");
      const heading = crel("設定", "heading");
      box.appendChild(heading);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "パスワードを再設定";
      box.appendChild(btn);
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
        }
      });
      close.addEventListener("click", () => {
        p = false;
        box.remove();
      });
      document.body.appendChild(box);
    }
  }

  function warndelete(m) {
    if (key === runkey) {
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
        }
      });
      close.addEventListener("click", () => {
        p = false;
        box.remove();
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

  sock.addEventListener("open", () => {
    if (key === runkey) {
      if (running != null || running === null) {
        running = true;
      }
      console.log("[OPEN]せつぞく済みなり〜");
      const cookie = document.cookie.split("; ");
      cookie.forEach((e) => {
        const c = decodeURIComponent(e);
        if (c.match(/^meringue=/)) {
          setting = JSON.parse(c.replace(/^meringue=/g, ""));
        }
      });
      if (setting.p === null) {
        pass();
      } else {
        send({
          type: "password",
          data: {
            p: setting.p,
          },
        });
      }
      category.addEventListener("change", () => {
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
      });
    }
  });

  sock.addEventListener("message", (e) => {
    if (key === runkey) {
      const m = JSON.parse(e.data);
      switch (m.type) {
        case "top": {
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
            "</span></p><hr><p>本日はお越しくださりありがとうございます。</p><p>ページ上部の「得点表を選択」の隣にある四角を押して、記録が見たい種目を選択してください！</p>";
          break;
        }
        case "getboard": {
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
            insertscore(rankdata.rank, s.name, s.score, m.data.counter, s.id);
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
          rankingbox.innerHTML = "<hr>";
          board[m.data.boardname].score.push(m.data);
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
              s.id
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
    notice("通信が切断されました", init);
  });

  sock.addEventListener("error", () => {
    console.log("[ERROE!]えらーなり");
    notice("エラーが発生しました");
  });
})();
