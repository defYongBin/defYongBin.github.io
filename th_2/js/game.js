// JSON 枚举
let pieceColors = {
    "blank": -1,
    "black": 0,
    "white": 1
};

// 玩家对象数组
let player = [];
player.push({
    color: "black",
    step: [],      // 着棋栈，记录前两布棋
    score: 0,
    piece: null,
    init: function () {
        this.piece = createPiece(this.color);
    }
});
player.push({
    color: "white",
    step: [],
    score: 0,
    piece: null,
    init: function () {
        this.piece = createPiece(this.color);
    }
});

let game = {
    bg: null,        // 背景线条
    board: document.createElement("canvas"),   // 主画布
    pieces: [],    // 棋盘上的棋子是否存在
    current: pieceColors.black,  // 当前玩家，黑棋先手
    line : 15,      // 棋盘路数
    isOver : false,     // 游戏是否结束
    linePieces: [],     // 五连的棋子

    init: function () {
        // 初始化棋子
        for (let i = 0; i < this.line; i++) {
            this.pieces[i] = [];
            for (let j = 0; j < this.line; j++)
                this.pieces[i][j] = pieceColors.blank;
        }

        // 画棋盘
        document.getElementById("canvas").appendChild(this.board);
        this.board.width = this.board.height = 640;
        let ctx = this.board.getContext("2d");
        this.bg = createBg(this.line);
        ctx.drawImage(this.bg, 0, 0);
    },

    // 重画画布
    redraw: function () {
        // 画棋盘
        let ctx = this.board.getContext("2d");
        ctx.drawImage(this.bg, 0, 0);

        // 画棋子
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++)
                if (this.pieces[i][j] !== pieceColors.blank) {
                    ctx.drawImage(player[this.pieces[i][j]].piece, (j + 1) * 40 - 17, (i + 1) * 40 - 17);
                }
        }
    },

    // 着棋
    moveChess: function (e) {
        if(!this.isOver){
            // 获取坐标
            let j = Math.floor((e.offsetX - 20) / 40);
            let i = Math.floor((e.offsetY - 20) / 40);
            let ctx = this.board.getContext("2d");

            // 画出棋子 并存入step数组
            if (this.pieces[i][j] === pieceColors.blank) {
                this.pieces[i][j] = this.current;   // 添加棋子
                ctx.drawImage(player[this.current].piece, (j + 1) * 40 - 17, (i + 1) * 40 - 17);   // 画出棋子
                if (player[this.current].step.length >= 2)
                    player[this.current].step.shift();
                player[this.current].step.push([i,j]);
                this.current = (this.current + 1) % 2;
            }

            // 判断局面
            this.judge(i, j);
        }
    },

    // 悔棋
    backMove: function (){
        let current = (this.current + 1) % 2;
        if (player[current].step.length > 0) {
            let cp = player[current].step.pop();  // 需要撤回的玩家的上一步棋
            this.pieces[cp[0]][cp[1]] = pieceColors.blank;  // 撤回一步棋
            this.current = current;
            this.redraw();
        } else {
            $id("log").innerText = "你没机会了";
        }
    },

    // 认输
    killMyself: function (){
        this.gameOver((this.current + 1) % 2);
    },

    // 判断局面（是否获胜）
    judge: function (i, j) {
        let current = (this.current + 1) % 2;        // 刚着棋的玩家
        let dir = [[-1,0], [-1,-1], [0,-1], [1,-1]];   // 方向

        // 寻找五连，从上一步出发向周围扩散寻找
        for(let k = 0; k < dir.length; k++) {
            this.linePieces = [[i, j]];
            for (let l = 1; i + dir[k][0] * l >= 0 && i + dir[k][0] * l < this.line &&
            j + dir[k][1] * l >= 0 && j + dir[k][1] * l < this.line &&
            this.pieces[i + dir[k][0] * l][j + dir[k][1] * l] === current; l++)
                this.linePieces.push([i + dir[k][0] * l, j + dir[k][1] * l]);
            for (let l = 1; i - dir[k][0] * l >= 0 && i - dir[k][0] * l < this.line &&
            j - dir[k][1] * l >= 0 && j - dir[k][1] * l < this.line &&
            this.pieces[i - dir[k][0] * l][j - dir[k][1] * l] === current; l++)
                this.linePieces.push([i - dir[k][0] * l, j - dir[k][1] * l]);
            if (this.linePieces.length >= 5) {
                this.gameOver((this.current + 1) % 2);
                break;
            }
        }
    },

    // 游戏结束
    gameOver: function (win) {
        $id("log").innerText = player[win].color + "获胜";
        this.isOver = true;
    }
};

// 入口
window.onload = function () {
    player[0].init();
    player[1].init();
    game.init();

    // 棋盘点击事件
    game.board.onclick = function (e) {
        game.moveChess(e);
        console.log(Math.floor((e.offsetX-20)/40) + "," + Math.floor((e.offsetY-20)/40));

        // 修改信息栏信息
        changeCurr();
    };

    // 悔棋点击事件
    $id("back").onclick = function () {
        game.backMove();
        changeCurr();
    };

    // 认输点击事件
    $id("loser").onclick = function () {
        if(!game.isOver) {
            game.killMyself();
            this.innerText = "重来";
        } else {
            game.isOver = false;
            this.innerText = "认输";
            game.init();
            $id("log").innerText = "play";
        }
    };
};

// 构建棋盘背景图
function createBg(line){
    let bg = document.createElement("canvas");
    let ctx = bg.getContext("2d");
    bg.width = 640;
    bg.height = 640;
    ctx.fillStyle = "rgba(245, 203, 105, 1)";
    ctx.fillRect(0, 0, bg.width, bg.height);
    ctx.strokeStyle = "black";
    ctx.lineCap = "square";
    ctx.lineWidth = 2;

    // 中间的网格
    for (let i = 1; i <= line; i++){
        ctx.beginPath();
        ctx.moveTo(i*40, 40);
        ctx.lineTo(i*40, 600);
        ctx.moveTo(40, i*40);
        ctx.lineTo(600, i*40);
        ctx.stroke();
    }

    // 外边粗边框
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo(35, 35);
    ctx.lineTo(605, 35);
    ctx.lineTo(605, 605);
    ctx.lineTo(35, 605);
    ctx.closePath();
    ctx.stroke();

    // 天元和星(五个点)
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(320, 320, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(160, 160, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(160, 480, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(480, 160, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(480, 480, 6, 0, Math.PI*2);
    ctx.fill();
    return bg;
}

// 创建棋子
function createPiece(color) {
    let can = document.createElement("canvas");
    can.width = can.height = 34;
    let ctx = can.getContext("2d");
    let grd=ctx.createRadialGradient(22,8,2,22,8,10);
    if (color === "white") {
        grd.addColorStop(0, "#fff");
        grd.addColorStop(1, "#ccc");
    } else {
        grd.addColorStop(0,"#eee");
        grd.addColorStop(1,"black");
    }
    ctx.fillStyle = grd;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "#666";
    ctx.shadowOffsetX = -1;
    ctx.shadowOffsetY = 2;
    ctx.arc(17, 17, 14, 0, Math.PI*2);
    ctx.fill();
    return can;
}

// 改变信息栏信息
function changeCurr() {
    if (game.current === pieceColors.black) {
        $id("current").className="black-now";
    } else {
        $id("current").className="white-now";
    }
}