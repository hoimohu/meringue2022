const http = require('http');
const WebSocket = require('ws');
const Database = require("nedb");

const board = {
    top: {
        people: [],
        date: getNowDate()
    }
};

const db = new Database({ filename: "database.db" });

db.loadDatabase((error) => {
    if (error !== null) {
        console.error(error);
    }
    console.log("database has loaded.");

    db.find({}, (error, docs) => {
        console.error(error);
        docs.forEach(e => {
            if (e.type === 'board') {
                board[e.boardname] = e;
            } else if (e.type === 'score') {
                board[e.boardname].score.push(e);
            }
        });
    });
});

const server = http.createServer();
const sock = new WebSocket.Server({ noServer: true });

function broadcast(m) {
    sock.clients.forEach((person) => person.send(JSON.stringify(m)));
}

let symbolnum = 1;

function createboard(boardname, counter) {
    if (!Object.prototype.hasOwnProperty.call(board, boardname)) {
        board[boardname] = {
            type: 'board',
            counter: counter,
            boardname: boardname,
            score: [],
            people: [],
            date: getNowDate()
        };
        db.insert(board[boardname], (err) => {
            if (err != null) {
                console.error('[ERROR@createboard]', err);
            }
        });
        broadcast({
            type: "newboard",
            data: boardname,
        });
        return true;
    } else {
        if (boardname === 'top') {
            return true;
        } else {
            return false;
        }
    }
}

function pushscore(boardname, name, score) {
    if (Object.prototype.hasOwnProperty.call(board, boardname)) {
        const pushdata = {
            type: 'score',
            name: name,
            score: score,
            date: getNowDate(),
            latest: Date.now(),
            id: symbolnum++,
            boardname: boardname
        };
        db.insert(pushdata, (error) => {
            if (error !== null) {
                console.error('[ERROR@pushscore]', error);
            }
        });
        board[boardname].score.push(pushdata);
        board[boardname].score.sort(function (a, b) {
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
        board[boardname].people.forEach((person) =>
            person({
                type: "newscore",
                data: pushdata,
            })
        );
    }
}

function deleteboard(boardname) {
    if (Object.prototype.hasOwnProperty.call(board, boardname)) {
        const now = getNowDate();
        db.remove({ type: 'score', boardname: boardname }, { multi: true }, function (err) {
            console.log('[ERROR@deleteboard:s]', err);
        })
        db.remove({ type: 'board', boardname: boardname }, {}, function (err) {
            console.log('[ERROR@deleteboard:b]', err);
        });
        broadcast({
            type: "deleteboard",
            data: {
                date: now,
                boardname: boardname
            }
        });
        delete board[boardname];
    }
}

function deletescore(boardname, id) {
    if (Object.prototype.hasOwnProperty.call(board, boardname)) {
        db.remove({ type: 'score', boardname: boardname, id: id }, {}, function (err) {
            console.log('[ERROR@deletescore]', err);
        });
        board[boardname].score = board[boardname].score.filter(
            (score) => score.id !== id
        );
        board[boardname].people.forEach((person) =>
            person({
                type: "getboard",
                data: {
                    boardname: boardname,
                    score: board[boardname].score,
                    counter: board[boardname].counter
                },
            })
        );
    }
}

function changescore(boardname, id, name, score) {
    if (Object.prototype.hasOwnProperty.call(board, boardname)) {
        board[boardname].score.forEach((e, i) => {
            if (e.id === id) {
                board[boardname].score[i].latest = Date.now();
                board[boardname].score[i].name = name;
                board[boardname].score[i].score = score;
                db.update({ type: 'score', boardname: boardname, id: id }, board[boardname].score[i], {}, (err) => {
                    console.log('[ERROR@changescore]', err);
                });
            }
        });
        board[boardname].score.sort(function (a, b) {
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
        board[boardname].people.forEach((person) =>
            person({
                type: "getboard",
                data: {
                    boardname: boardname,
                    score: board[boardname].score,
                    counter: board[boardname].counter
                },
            })
        );
    }
}

sock.on("connection", (ws) => {
    console.log(
        "[" +
        getNowDate() +
        "]" + 'enter');
    let nowboard;
    let perm = 1;

    const connectiontime = getNowDate();
    const peoplewhenconnection = sock.clients.size;
    board.top.people.forEach(e =>
        e({
            type: "viewers",
            data: {
                viewers: peoplewhenconnection,
                date: connectiontime,
            }
        }));

    function send(message) {
        ws.send(JSON.stringify(message));
    }

    ws.on("message", (message) => {
        const m = JSON.parse(message.toString());
        if (perm > 1) {
            switch (m.type) {
                case "top":
                    if (nowboard != null && Object.prototype.hasOwnProperty.call(board, nowboard)) {
                        board[nowboard].people = board[nowboard].people.filter(
                            (person) => person !== send
                        );
                    }
                    if (Object.prototype.hasOwnProperty.call(board, 'top')) {
                        board.top.people.push(send);
                        const viewers = sock.clients.size;
                        board.top.people.push(send);
                        send({
                            type: "top",
                            data: {
                                viewers: viewers,
                                date: getNowDate(),
                                board: Object.keys(board)
                            }
                        });
                        nowboard = 'top';
                    }
                    break;
                case "getboard":
                    if (nowboard != null && Object.prototype.hasOwnProperty.call(board, nowboard)) {
                        board[nowboard].people = board[nowboard].people.filter(
                            (person) => person !== send
                        );
                    }
                    if (Object.prototype.hasOwnProperty.call(board, m.data.boardname)) {
                        board[m.data.boardname].people.push(send);
                        nowboard = m.data.boardname;
                        send({
                            type: "getboard",
                            data: {
                                boardname: m.data.boardname,
                                score: board[m.data.boardname].score,
                                counter: board[m.data.boardname].counter
                            },
                        });
                    }
                    break;
            }
            if (perm > 2) {
                switch (m.type) {
                    case "pushscore":
                        pushscore(m.data.boardname, m.data.name, m.data.score);
                        break;
                    case "createboard":
                        if (!createboard(m.data.boardname, m.data.counter)) {
                            send({
                                type: 'warndelete',
                                data: {
                                    type: 'deleteboard',
                                    data: {
                                        boardname: m.data.boardname
                                    }
                                }
                            });
                        }
                        break;
                    case "deleteboard":
                        deleteboard(m.data.boardname);
                        break;
                    case "deletescore":
                        deletescore(m.data.boardname, m.data.id);
                        break;
                    case "changescore":
                        changescore(m.data.boardname, m.data.id, m.data.name, m.data.score);
                        break;
                }
            }
        } else {
            if (m.type === "password") {
                switch (m.data.p) {
                    case "jessicaspark":
                        perm = 3;
                        break;
                    case "senkou":
                        perm = 2;
                        break;
                }
                if (nowboard != null && Object.prototype.hasOwnProperty.call(board, nowboard)) {
                    board[nowboard].people = board[nowboard].people.filter(
                        (person) => person !== send
                    );
                }
                if (Object.prototype.hasOwnProperty.call(board, 'top')) {
                    board.top.people.push(send);
                    const viewers = sock.clients.size;
                    send({
                        type: "top",
                        data: {
                            viewers: viewers,
                            date: getNowDate(),
                            board: Object.keys(board)
                        }
                    });
                }
            }
        }
    });

    ws.on("close", () => {
        if (nowboard != null && Object.prototype.hasOwnProperty.call(board, nowboard)) {
            board[nowboard].people = board[nowboard].people.filter(
                (person) => person !== send
            );
        }
        const closetime = getNowDate();
        const peoplewhenclose = sock.clients.size;
        board.top.people.forEach(e =>
            e({
                type: "viewers",
                data: {
                    viewers: peoplewhenclose,
                    date: closetime,
                }
            }));
        console.log(
            "[" +
            getNowDate() +
            "]" + 'out');
    });
});

function getNowDate() {
    const d = new Date(new Date().getTime() + 32400000)
        .toUTCString()
        .replace("Sun,", "(日)")
        .replace("Mon,", "(月)")
        .replace("Tue,", "(火)")
        .replace("Wed,", "(水)")
        .replace("Thu,", "(木)")
        .replace("Fri,", "(金)")
        .replace("Sat,", "(土)")
        .replace("Jan", "01")
        .replace("Feb", "02")
        .replace("Mar", "03")
        .replace("Apr", "04")
        .replace("May", "05")
        .replace("Jun", "06")
        .replace("Jul", "07")
        .replace("Aug", "08")
        .replace("Sep", "09")
        .replace("Oct", "10")
        .replace("Nov", "11")
        .replace("Dec", "12")
        .replace("GMT", "[日本標準時]")
        .split(" ");
    return `${d[3]}年${d[2]}月${d[1]}日${d[0]}${d[4]} ${d[5]}`;
}

const allowedOrigins = [
    'http://127.0.0.1:5500',
];

server.on('upgrade', function (request, socket, head) {
    const origin = request.headers.origin;

    console.log(
        "[" +
        getNowDate() +
        "]" +
        (allowedOrigins.includes(origin) ? "(^_^)" : "(X_X)") +
        "origin: " +
        origin +
        " ip: " +
        (request.headers["x-forwarded-for"] ?
            request.headers["x-forwarded-for"] : request.socket && request.socket.remoteAddress ? request.socket.remoteAddress : "0.0.0.0") +
        " user-agent: " +
        request.headers["user-agent"]
    );

    if (!allowedOrigins.includes(origin)) {
        return socket.destroy();
    }

    sock.handleUpgrade(request, socket, head, (ws) => {
        sock.emit('connection', ws, request);
    });
});

server.listen(3000);