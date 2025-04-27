//Test-ris   2025-0412 ver 0.1  0428 ver 0.92 akiramaetomo
/* =========================================================
 *  壁紙取り込み　将来的には別クラスとして、動的に切り替え可とする
 * =======================================================*/
/* === 壁紙レイヤー =============================================== */
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx    = bgCanvas.getContext('2d');
const bgImg    = new Image();
bgImg.src      = './assets/images/wall3.png';      // パスはご都合に合わせて

/* ─ 画面サイズが変わったらキャンバスをフィットさせ再描画 ─ */
window.addEventListener('resize', () => {
  resizeBgCanvas();
  drawBg();
});

/* 画像ロード完了後に 1 度だけ描画（静的レイヤーなので毎フレーム不要） */
bgImg.onload = () => {
  resizeBgCanvas();
  drawBg();
};

function resizeBgCanvas () {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

/* “object-fit: cover” と同じく  
   画面全体を覆いつつ左右（または上下）が余る場合はセンタリング */
function drawBg () {
  if (!bgImg.complete) return;
  const scale = Math.max(
    bgCanvas.width  / bgImg.width,
    bgCanvas.height / bgImg.height
  );
  const w = bgImg.width  * scale;
  const h = bgImg.height * scale;
  const x = (bgCanvas.width  - w) / 2;
  const y = (bgCanvas.height - h) / 2;

  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.drawImage(bgImg, x, y, w, h);
}
/* === 壁紙レイヤーここまで ======================================= */



/* =========================================================
 *  1.設定クラス、状態クラス取り込み
 * =======================================================*/
import { GameConfig } from './GameConfig.js';
import { GameState  } from './GameState.js';

/* =========================================================
 *  2. 設定インスタンスを生成
 *    ・引数で “上書きしたい値” だけ渡せます
 *    ・後から cfg のプロパティを書き換えても OK
 * =======================================================*/
const cfg = new GameConfig({
  // 例：テスト用に ROWS を 15、落下速度を速く
  // ROWS: 15,
  // NATURAL_DROP_INTERVAL: 4,
});

/* =========================================================
 *  3. 状態コンテナを生成
 *    ・cfg への参照を内部に保持
 * =======================================================*/
let state = new GameState(cfg);

// ★ キャンバス(壁＋プレイ領域+壁=12列ぶん)
const CANVAS_COLS = cfg.COLS + 2;
const CANVAS_WIDTH = CANVAS_COLS * cfg.BLOCK_SIZE;
const CANVAS_HEIGHT = (cfg.TOP_MARGIN + cfg.ROWS + 1) * cfg.BLOCK_SIZE;//下壁+1行分＋上壁


// フェーズ管理用の列挙 (文字列でもOK)
const PHASE = {
    TITLE: 'title',      // 追加
    PLAYING: 'playing',    // ブロックを自由に操作・落下中
    LOCKING: 'locking',    // 接地してLockDelayを待っている
    CLEARING: 'clearing',  // 行が揃ったのでエフェクト表示や消去待ち
    COLLAPSING: 'collapsing',   // ★ 追加: 行を落とす処理中
    SPAWNING: 'spawning',  // 次ブロックを出すまでの待ち
    GAMEOVER: 'gameover',  // ← 追加

};

state.currentPhase = PHASE.TITLE;


//cpu負荷計測用クラス　for debug 
import { PerfStats } from './utils/perfStats.js';
const perf = new PerfStats({ enabled: true, interval: 1000, keyToggle: 'F3' });


//ココでタイトル画面表示
enterTitlePhase();


//25-0415mae テトロミノをファイルからimport
import { TETROMINOES } from './tetrominoes.js';
//サウンドマネージャーをインポート
import { SoundManager } from './soundManager.js';

// サウンド
const soundManager = new SoundManager();

// 音声ファイルのロード。全部読み込むまで待機。
await soundManager.loadAllSounds({
    move: './assets/audio/move.wav',
    rotate: './assets/audio/rotate.wav',
    land: './assets/audio/land.wav',
    fix: './assets/audio/fix.wav',
    clear: './assets/audio/clear.wav',
    drop: './assets/audio/drop.wav',
    bgm_play: './assets/audio/bgm_play.wav',
    bgm_over: './assets/audio/bgm_over.wav'  

});

/* ===== ① マスター／チャンネル音量 ===== */
soundManager.setVolume({ master: 0.1, sfx: 0.2, bgm: 0.2 });



// キーボード、ジョイパッド入力
import { ACTIONS } from './input/inputHandler.js';
import { KeyboardInputHandler } from './input/keyboard.js';
import { GamepadInputHandler } from './input/gamepad.js';


/* ---------- デバイス切り替え関数 ---------- */
/* - グローバル --- */
let input = null;          // 現在の InputHandler
let device = 'keyboard';    // 'keyboard' | 'gamepad'

function setInputDevice(kind) {
    if (kind === 'gamepad') {
        input = new GamepadInputHandler();
        device = 'gamepad';
    } else {
        input = new KeyboardInputHandler();
        device = 'keyboard';
    }
    console.log('[DBG] setInputDevice ->', device);
}

/* 初期化：とりあえずキーボード */
setInputDevice('keyboard');


/* -------------------------------------------
   ★[1] 画像オブジェクトの定義とロード
   ----------------------------------------- */
const leftWallImg = new Image();
//leftWallImg.src = '/assets/images/stone.bmp';
leftWallImg.src = './assets/images/renga.bmp';

const rightWallImg = new Image();
//rightWallImg.src = '/assets/images/muddy.bmp';
rightWallImg.src = './assets/images/renga.bmp';

const downWallImg = new Image();
downWallImg.src = './assets/images/renga.bmp';

/* 画像 ─ 上壁用を追加（既存画像を流用して OK） */
const topWallImg = downWallImg;        // 別画像なら差し替えて下さい



/* -------------------------------------------
   ★[2] 変数・状態管理
   ----------------------------------------- */
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Canvas の幅を infoArea に適用（ブロック領域幅と同じにする）
//document.getElementById('infoArea').style.width = `${CANVAS_WIDTH}px`;
const nextCanvasWidth = document.getElementById('nextCanvas').width;
document.getElementById('infoArea').style.width = `${nextCanvasWidth}px`;

let nextCanvas = document.getElementById('nextCanvas');
let nextCtx = nextCanvas.getContext('2d');


/* -------------------------------------------
   ★[3] 初期化・リセット・開始
   ----------------------------------------- */
// ★ フィールド(0=空, string=色)
//これは描画フィールドなのでglobalとしておく（GameStateには今のところ入れない）
let field = [];

function initField() {
    // ★ フィールドを行×列で初期化(0)
    field = [];
    for (let r = 0; r < cfg.ROWS; r++) {
        field[r] = [];
        for (let c = 0; c < cfg.COLS; c++) {
            field[r][c] = 0;
        }
    }
}

function resetGame() {
    initField();
    
    state = new GameState(cfg);           // ← これで全部初期化
    state.currentBlock = generateRandomBlock();
    state.nextBlock    = generateRandomBlock();

    state.lastUpdateTime = performance.now();
}

function startGame() {
    resetGame();
    requestAnimationFrame(gameLoop);
}

/* -------------------------------------------
   ★[4] ブロック生成・固定・行削除
   ----------------------------------------- */

// ★ ランダムにテトリミノを生成（回転情報を持たせる）25-0415o1
function generateRandomBlock() {
    // ランダムにテトリミノの種類を選ぶ
    const tetIndex = Math.floor(Math.random() * TETROMINOES.length);
    const tetData = TETROMINOES[tetIndex];

    // rotationIndexを0に初期化（またはランダムでもよい）
    const rotationIndex = 0;

    return {
        // ★ テトリミノ種類のインデックスを保持しておくと回転で再参照できる
        tetrominoIndex: tetIndex,
        rotationIndex: rotationIndex,

        // ★ 初期形状
        shape: JSON.parse(JSON.stringify(tetData.shapes[rotationIndex])),

        color: tetData.color,
        row: -cfg.TOP_MARGIN,
        col: Math.floor(cfg.COLS / 2 - 2)
    };
}


// ★ 次のブロックへ
function spawnBlock() {
    state.blockFixed = false;                // 新しい操作ブロックに切り替える準備
    state.currentBlock = state.nextBlock;
    state.currentBlock.row = -cfg.TOP_MARGIN;
    state.currentBlock.col = Math.floor(cfg.COLS / 2 - 2);

    /* ①　出現位置で衝突していればゲームオーバー */
    if (isCollision()) {
        state.currentBlock = null;           // 描画対象を消しておく
        enterGameOverPhase();
        return;                        // ← ここで関数終了
    }

    /* ②　正常に出現した場合の後始末 -------------- */
    state.nextBlock = generateRandomBlock(); // 新しい Next を決定
    state.landed = false;                 // 着地フラグをクリア
    state.landingTimer = null;                  // LockDelay 用タイマー初期化
    state.spawnTimer = null;                  // （使用するなら）出現待ちタイマー初期化
}
function enterGameOverPhase() {
    state.currentPhase = PHASE.GAMEOVER;
    soundManager.fadeOutBgm(500); // ★フェードアウト
    soundManager.play('bgm_over', { bus: 'bgm', playbackRate: 1, volume: 0.5 });
    window.addEventListener('keydown', onGameOverKey, { once: true });
}
function onGameOverKey(e) {
    if (e.key.toLowerCase() === 'r') {
        resetGame();
        soundManager.play('bgm_play', { loop: true, bus: 'bgm', playbackRate: 1.2, volume: 0.5 }); // ★boolean でループ指定
        state.currentPhase = PHASE.PLAYING;
    }
}



// ★ 完全固定（spawnBlock() の呼び出しは spawnTimer による次ブロック出現で行う）
function fixBlock() {
    let { shape, color } = state.currentBlock;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (shape[r][c]) {
                let fr = state.currentBlock.row + r;
                let fc = state.currentBlock.col + c;
                if (fr >= 0 && fr < cfg.ROWS && fc >= 0 && fc < cfg.COLS) {
                    //                    field[fr][fc] = color; // 25-0413_o3m5: ミノの色を格納
                    field[fr][fc] = color; // 25-0413_o3m5: ミノの色を格納
                }
            }
        }
    }
    // 25-0413_o3m5: 固定完了時サウンド再生

    soundManager.play('fix', { playbackRate: 1.2, volume: 0.5 });

    //clearLines();

    // 25-0413_o3m5: spawnBlock() の呼び出しは spawnTimer によって制御
    // ライン消去が完了した時点で固定フラグを立てる
    state.blockFixed = true;  //25-0415mae call元関数でこのフラグを参照しているため上位でこの行を定義したほうが良いのかもしれない
    state.currentBlock = null;    // 25-0415mae カレントブロックを null にして、draw関数で表示させないようにする。

}


// 「そろった行を見つけて配列を返すだけ」
//  ＝コード量が少ないので checkFullLines() といった名前にする
function checkFullLines() {
    const linesToClear = [];
    for (let r = 0; r < cfg.ROWS; r++) {
        if (field[r].every(cell => cell !== 0)) {
            linesToClear.push(r);
        }
    }
    return linesToClear;
}

// 「実際に行を消し、ブロックを上から詰める」
//  ＝ collapseLines() のみを実行。何らかの演出後にコールする
function clearLines(linesToClear) {
    // (引数が undefined でないことを前提)
    if (!linesToClear || !linesToClear.length) return;

    // 行を0化
    for (const r of linesToClear) {
        for (let c = 0; c < cfg.COLS; c++) {
            field[r][c] = 0;
        }
    }

}



// 「上の行を下へコピーして詰める部分」
function collapseLines(linesToClear) {
    // linesToClearを昇順ソートしておく
    linesToClear.sort((a, b) => a - b);

    // 最下の行から順に詰めていくイメージ
    for (const line of linesToClear) {
        for (let r = line; r > 0; r--) {
            for (let c = 0; c < cfg.COLS; c++) {
                field[r][c] = field[r - 1][c];
            }
        }
        // 最上段は空に
        for (let c = 0; c < cfg.COLS; c++) {
            field[0][c] = 0;
        }
    }

}



/* -------------------------------------------
   ★[5] 衝突判定
   ----------------------------------------- */
function isCollision() {
    const { shape } = state.currentBlock;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!shape[r][c]) continue;

            const fr = state.currentBlock.row + r;
            const fc = state.currentBlock.col + c;
            /* fr < 0 なら上壁と衝突扱い */
            if (fr < 0 ||
                /* fr < -TOP_MARGIN だけ衝突扱い（-1 行までは許容） */
                //            if (fr < -TOP_MARGIN ||
                fr >= cfg.ROWS || fc < 0 || fc >= cfg.COLS || field[fr][fc] !== 0) {
                return true;
            }
        }
    }
    return false;
}


//************************************** */
//25-0415o1 stateマシン化したgameLoop
//************************************** */
function gameLoop(timestamp) {

    // --- 計測開始 ---for debug
    perf.begin();                 // // HUD 用
    performance.mark('loop-start');  // DevTools 用


    // TITLE または GAMEOVER なら描画も更新もスキップ
        if (state.currentPhase === PHASE.TITLE || state.currentPhase === PHASE.GAMEOVER) {
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }


    const delta = timestamp - state.lastUpdateTime;
    state.lastUpdateTime = timestamp;

    input.poll(delta);//キーボード・ジョイパッド入力


    // 2) 既存グローバルフラグへ反映（★ブリッジ）
    state.leftKeyDown = input.isDown(ACTIONS.MOVE_LEFT);
    state.rightKeyDown = input.isDown(ACTIONS.MOVE_RIGHT);
    state.forcedDrop = input.isDown(ACTIONS.SOFT_DROP);
    /* ★ ソフトドロップ開始時に dropAccumulator をリセット */
    if (input.isPressed(ACTIONS.SOFT_DROP)) state.dropAccumulator = 0;
    /* ★ 回転は立ち上がりのみ呼ぶ */
    if (input.isPressed(ACTIONS.ROTATE_L)) rotateBlock(-1);
    if (input.isPressed(ACTIONS.ROTATE_R)) rotateBlock(1);


    switch (state.currentPhase) {
        case PHASE.PLAYING: updatePlaying(delta); break;
        case PHASE.LOCKING: updateLocking(delta); break;
        case PHASE.CLEARING: updateClearing(delta); break;
        case PHASE.COLLAPSING: updateCollapsing(delta); break;
        case PHASE.SPAWNING: updateSpawning(delta); break;
    }

    draw();
    drawNextBlock();

    // 25-0413_o3m6: デバッグ情報表示（state.landed, landingTimer, spawnTimer, dropAccumulator, state.blockFixed）
    document.getElementById('infoArea').innerHTML =
        "landed: " + state.landed + "<br>" +
        "landingTimer: " + (state.landingTimer !== null ? state.landingTimer.toFixed(1) : "null") + "<br>" +
        "spawnTimer: " + (state.spawnTimer !== null ? state.spawnTimer.toFixed(1) : "null") + "<br>" +
        "blockFixed: " + state.blockFixed + "<br>" +
        "dropAccumulator: " + state.dropAccumulator.toFixed(1);

    input._afterPoll();         // ③ フレームの最後で prev ← active



    // --- 計測終了 ---for debug 
    performance.mark('loop-end');
    performance.measure('frame', 'loop-start', 'loop-end');
    perf.end();                 


    requestAnimationFrame(gameLoop);
}


// -------------------------
// [1] 普段の操作 & 落下 (PLAYINGフェーズ)
// -------------------------
function updatePlaying(delta) {
    // （A）自然落下の処理
    // dropAccumulator += delta;
    // 自然落下およびソフトドロップ処理（そのまま）
    if (!state.forcedDrop) {
        state.dropAccumulator += delta;
        /* 何行落とせるか計算。ROWS (20) を上限にして一括移動 */
        const steps = Math.min(Math.floor(state.dropAccumulator / cfg.NATURAL_DROP_INTERVAL), cfg.ROWS);
        if (steps > 0) {
            state.dropAccumulator -= steps * cfg.NATURAL_DROP_INTERVAL;
            moveBlockDown(steps);
        }
    } else {
        moveBlockDown(cfg.SOFT_DROP_FRAME); // zキー押下中は引数フレーム分だけ落下
    }


    // （B）キー操作での左右移動・回転
    handleHorizontalMove(delta);
    //回転処理はキーイベントでcallされる。

    // （C）「ブロックが床に接触している」かどうか判定
    //       → canDrop() == false なら、LockDelayへ遷移
    if (!canDrop()) {
        // 着地した瞬間に、Lockフェーズへ
        state.currentPhase = PHASE.LOCKING;
        state.phaseTimer = 0;

        // 着地音を鳴らしたり、何か処理があればここ
        soundManager.play('land', { playbackRate: 0.8, volume: 0.5 });

    }
}

// -------------------------
//Lock Delay中 (LOCKINGフェーズ)
// -------------------------
//let pendingLinesToClear = null; // グローバルまたは上部で宣言

function updateLocking(delta) {
    state.phaseTimer += delta; // LockDelayを進める


    // ■ LockDelay中でも横移動や回転を許可する
    //    handleHorizontalMove(delta); など
    //    ここで動かしてみて衝突が解除されたら canDrop() が true になるかもしれない
    handleHorizontalMove(delta);

    // もし、ブロックが再び動いて衝突が解消されたら (＝回転や移動で持ち上げた場合など)
    // たとえば canDrop() == true なら衝突がなくなった、という判断でOK
    if (canDrop()) {
        // LockDelayを中断して再びPLAYINGへ
        state.currentPhase = PHASE.PLAYING;
        return;
    }

    // LockDelayを超えたら固定　強制ドロップがあれば即固定
    if (state.phaseTimer >= cfg.LOCK_DELAY || state.forcedDrop) {
        fixBlock(); // フィールドにブロックを確定書き込み
        // fixSound など鳴らすならここ
        soundManager.play('fix', { playbackRate: 0.8, volume: 0.5 });

        // ラインが揃ってるかどうか
        let lines = checkFullLines();
        if (lines.length > 0) {
            // ここで pendingLinesToClear に保持
            state.pendingLinesToClear = lines;
            state.currentPhase = PHASE.CLEARING;
        } else {
            state.currentPhase = PHASE.SPAWNING;
        }
        state.phaseTimer = 0;
    }
}

//Helper
//仮に1行下げた場合の衝突判定を行う
function canDrop() {
    state.currentBlock.row++; // 25-0413_o3m5: 仮に1行下げる
    let collision = isCollision();
    state.currentBlock.row--; // 25-0413_o3m5: 元に戻す
    return !collision;
}


// -------------------------
//ライン消去(CLEARINGフェーズ)
// -------------------------
function updateClearing(delta) {

    if (state.phaseTimer === 0 && state.pendingLinesToClear?.length) {
        clearLines(state.pendingLinesToClear);      // n 行を 0 化
        soundManager.play('clear', { playbackRate: 1, volume: 0.5 });
    }

    state.phaseTimer += delta;

    if (state.phaseTimer >= cfg.FALL_DELAY) {//???????????????????????????????????????????
        const n = state.pendingLinesToClear.length;          // ★ 消えた行数
        if (n === 0) { /* 保険 */ }

        /* A と B が両方 0 → 旧ロジック完全互換で即下詰め */
        if (cfg.LINE_STEP_FALL_TIME === 0 && cfg.LINE_STEP_PAUSE_TIME === 0) {
            collapseLines(state.pendingLinesToClear);   // 一括で詰める
            state.pendingLinesToClear = null;
            state.currentPhase = PHASE.SPAWNING;
            state.phaseTimer = 0;
            return;
        }

        /* --- 段階落下モード開始 --- */
        state.stepsPerChunk = n;
        state.stepsRemainingInChunk = n;
        state.collapseState = 'fall';
        state.collapseTimer = 0;
        state.currentPhase = PHASE.COLLAPSING;
    }
}


// -------------------------
//固定ブロック落下(COLLAPSINGフェーズ)
// -------------------------
function updateCollapsing(delta) {
    state.collapseTimer += delta;

    if (state.collapseState === 'fall') {

        /* ① A ms 経過で 1 段コピー */
        while (cfg.LINE_STEP_FALL_TIME === 0 ||
            state.collapseTimer >= cfg.LINE_STEP_FALL_TIME) {

            if (cfg.LINE_STEP_FALL_TIME) state.collapseTimer -= cfg.LINE_STEP_FALL_TIME;

            const moved = collapseStep();      // 実移動

            if (!moved) {  /* もう浮いている塊は無い → 終了 */
                state.pendingLinesToClear = null;
                state.currentPhase = PHASE.SPAWNING;
                state.phaseTimer = 0;
                return;
            }

            soundManager.play('drop', { playbackRate: 1, volume: 0.4 });         // ★ 1 段毎に SE
            state.stepsRemainingInChunk--;

            if (state.stepsRemainingInChunk === 0) { /* 塊を落とし切った */
                state.collapseState = 'pause';
                break;
            }
        }

    } else { /* 'pause' 状態 */

        if (cfg.LINE_STEP_PAUSE_TIME === 0 ||
            state.collapseTimer >= cfg.LINE_STEP_PAUSE_TIME) {

            if (cfg.LINE_STEP_PAUSE_TIME) state.collapseTimer -= cfg.LINE_STEP_PAUSE_TIME;

            /* 次の塊（さらに上）へ。再度 n ステップ必要 */
            state.stepsRemainingInChunk = state.stepsPerChunk;
            state.collapseState = 'fall';
        }
    }
}


/* ⑥  1 段だけ下へ詰めるヘルパー */
/* (3) 行を丸ごと 1 段下へシフトするだけに簡略化 */
function collapseStep() {
    /* 下から 2 行目 (ROWS‑2) まで走査:
       上にブロックがあり、下が空なら 1 行コピー */
    for (let r = cfg.ROWS - 2; r >= 0; r--) {
        if (field[r].some(c => c !== 0) &&
            field[r + 1].every(c => c === 0)) {

            field[r + 1] = field[r].slice();          // 下へコピー
            field[r] = new Array(cfg.COLS).fill(0);   // 上を空に
            return true;      // 1 段落とした
        }
    }
    return false;             // もう落とせる行は無い
}


// -------------------------
//新ブロック出現待ち(SPAWNINGフェーズ)
// -------------------------
function updateSpawning(delta) {
    state.phaseTimer += delta;
    handleHorizontalMove(delta);
    if (state.phaseTimer >= cfg.SPAWN_DELAY) {
        //        console.log("SPAWN_DELAY完了。ブロックを出します。leftKeyDown=", leftKeyDown, "rightKeyDown=", rightKeyDown);

        spawnBlock(); // 次のブロックを生成

        if (state.currentPhase === PHASE.GAMEOVER) return; // 早期リターン

        // もしすでに leftKeyDown = true であれば、 
        // 「初回ディレイをすでに消化済み」と見なして lastMoveTimeLeft に大きめの値を入れておく
        if (state.leftKeyDown) {
            //            console.log("左キー押下を検出 -> lastMoveTimeLeft を書き換えます");

            state.lastMoveTimeLeft = cfg.KEY_MOVE_INITIAL_DELAY + 1;
        }
        if (state.rightKeyDown) {
            //            console.log("右キー押下を検出 -> lastMoveTimeRight を書き換えます");

            state.lastMoveTimeRight = cfg.KEY_MOVE_INITIAL_DELAY + 1;
        }
        //        console.log("遷移前: currentPhase=", currentPhase);

        state.currentPhase = PHASE.PLAYING;
        console.log("遷移後: currentPhase=", state.currentPhase);

        state.phaseTimer = 0;
    }
}







/* -------------------------------------------
   ★[8] 描画処理
   ----------------------------------------- */
function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ★ 新しい「壁描画関数」を呼び出す
    drawWalls();

    // ★ フィールドのブロック描画
    for (let r = 0; r < cfg.ROWS; r++) {
        for (let c = 0; c < cfg.COLS; c++) {
            if (field[r][c] !== 0) {
                drawBlock(c, r, field[r][c]);
            }
        }
    }

    // ★ 現在のブロック描画
    if (state.currentBlock && !state.blockFixed) {
        const { shape, color, row, col } = state.currentBlock;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (shape[r][c]) {
                    let px = col + c;
                    let py = row + r;
                    if (py >= 0) {
                        drawBlock(px, py, color);
                    }
                }
            }
        }
    }

    // ゲームオーバー時オーバーレイ
    if (state.currentPhase === PHASE.GAMEOVER) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = '30px sans-serif';
        ctx.fillText('Press [R] to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        ctx.restore();
    }
}

function drawBlock(c, r, color) {
    const x = (c + 1) * cfg.BLOCK_SIZE;
    const y = fieldToScreenY(r);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE);
    ctx.strokeStyle = 'lightgray';
    ctx.strokeRect(x, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE);
}
//1. 座標変換を関数化してミスを防止
function fieldToScreenY(fieldRow) {
    return (fieldRow + cfg.TOP_MARGIN) * cfg.BLOCK_SIZE;
}


//    画像がロード済みかどうかを判定する関数
//    complete && naturalWidth > 0 ならロード成功とみなす
function isImageLoaded(img) {
    return img.complete && img.naturalWidth > 0;
}

/* -------------------------------------------
   ★[2] 壁描画関数の定義
   ----------------------------------------- */
function drawWalls() {

    /* ─── 左右壁 :  r = -TOP_MARGIN 〜 ROWS-1 ─── */
    for (let r = -cfg.TOP_MARGIN; r < cfg.ROWS; r++) {
        const y = fieldToScreenY(r);
        const xL = 0;
        const xR = (cfg.COLS + 1) * cfg.BLOCK_SIZE;
        const imgL = isImageLoaded(leftWallImg) ? leftWallImg : null;
        const imgR = isImageLoaded(rightWallImg) ? rightWallImg : null;

        (imgL ? ctx.drawImage(imgL, xL, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)
            : (ctx.fillStyle = 'gray', ctx.fillRect(xL, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)));
        (imgR ? ctx.drawImage(imgR, xR, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)
            : (ctx.fillStyle = 'gray', ctx.fillRect(xR, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)));
    }

    /* ─── 上壁 : r = -TOP_MARGIN ─── */
    {
        const y = fieldToScreenY(-cfg.TOP_MARGIN);
        for (let c = 0; c < cfg.COLS + 2; c++) {
            const x = c * cfg.BLOCK_SIZE;
            const img = isImageLoaded(topWallImg) ? topWallImg : null;
            (img ? ctx.drawImage(img, x, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)
                : (ctx.fillStyle = 'gray', ctx.fillRect(x, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)));
        }
    }

    /* ─── 下壁 : r = ROWS  ─── */
    {
        const y = fieldToScreenY(cfg.ROWS);
        for (let c = 0; c < cfg.COLS + 2; c++) {
            const x = c * cfg.BLOCK_SIZE;
            const img = isImageLoaded(downWallImg) ? downWallImg : null;
            (img ? ctx.drawImage(img, x, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)
                : (ctx.fillStyle = 'gray', ctx.fillRect(x, y, cfg.BLOCK_SIZE, cfg.BLOCK_SIZE)));
        }
    }
}


// ★ 次ブロック描画関数
function drawNextBlock() {
    nextCtx.clearRect(0, 0, nextCanvas.width * 4, nextCanvas.height * 4);
    if (!state.nextBlock) return;
    const { shape, color } = state.nextBlock;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (shape[r][c]) {
                const x = c * cfg.NEXT_BLOCK_SIZE;
                const y = r * cfg.NEXT_BLOCK_SIZE;
                nextCtx.fillStyle = color;
                nextCtx.fillRect(x, y, cfg.NEXT_BLOCK_SIZE, cfg.NEXT_BLOCK_SIZE);
                nextCtx.strokeStyle = 'lightgray';
                nextCtx.strokeRect(x, y, cfg.NEXT_BLOCK_SIZE, cfg.NEXT_BLOCK_SIZE);
            }
        }
    }
}




/* -------------------------------------------
   ★ 飛び越し落とし可能　25-0416o1
   ----------------------------------------- */
function moveBlockDown(step = 1) {
    if (state.spawnTimer !== null) return false;   // SPAWNING 中は落とさない

    // step回ぶん、1マスずつ移動し、都度衝突判定
    for (let i = 0; i < step; i++) {
        state.currentBlock.row++;

        if (isCollision()) {
            state.currentBlock.row--; // ぶつかったので戻す

            // 25-0413_o3m5: 初回衝突時のみ、landingTimer を起動して着地音を再生
            if (state.landingTimer === null) {
                state.landed = true;
                state.landingTimer = 0;
                //着地サウンド 自然落下より高めで
                soundManager.play('land', { playbackRate: 1.2, volume: 0.5 });
            }
            return false;          // ← ここでループを抜ける

            // ※ landingTimer のカウントアップは gameLoop で行う
        }
        // 25-0413_o3m5: 落下成功時、もし landingTimer が起動中ならリセット
        if (state.landingTimer !== null) {
            state.landingTimer = null;
            state.landed = false;
        }
    }

    return true;

}



/* -------------------------------------------
   ★[9] キー入力処理
   ----------------------------------------- */
function moveBlockHorizontal(dir) {
    // 25-0413_o3m7: ブロックが既に固定されている場合のみ左右移動を禁止する
    if (!state.currentBlock) return;
    if (state.blockFixed) return;

    state.currentBlock.col += dir;
    if (isCollision()) {
        state.currentBlock.col -= dir;
    } else {
        //水平ムーブ音
        soundManager.play('move');
    }
    // 25-0413_o3m7: ここでは landingTimer のリセット処理を削除
    // （キー操作で一時的に落下可能になったとしても、landingTimerはリセットせず、カウントを継続させる）

}


// ★ 回転処理（新しい回転処理）25-0415o1
function rotateBlock(dir) {
    if (!state.currentBlock || state.blockFixed) return;

    // dir=1なら右回転、dir=-1なら左回転
    const oldRotationIndex = state.currentBlock.rotationIndex;

    // ★ 新しい回転インデックスを計算
    //   (左回転は old-1 だが、JavaScriptのモジュロ扱いに注意)
    //   ここでは dir=1 → +1, dir=-1 → +3 するなどの方法で mod 4
    let newRotationIndex;
    if (dir !== 1) {
        newRotationIndex = (oldRotationIndex + 1) % 4;
    } else {
        newRotationIndex = (oldRotationIndex + 3) % 4;
        // (oldRotationIndex - 1 + 4) % 4 と同じ
    }

    // ★ 一旦 shape を新しい回転状態に差し替える
    const tetData = TETROMINOES[state.currentBlock.tetrominoIndex];
    const newShape = tetData.shapes[newRotationIndex];

    // 退避しておく（衝突したら戻せるよう）
    const oldShape = state.currentBlock.shape;

    state.currentBlock.shape = JSON.parse(JSON.stringify(newShape));

    // ★ 衝突チェック
    if (isCollision()) {
        // 衝突していれば回転をキャンセルして元に戻す
        state.currentBlock.shape = oldShape;
    } else {
        // 衝突しなければ rotationIndexを更新し、回転完了
        state.currentBlock.rotationIndex = newRotationIndex;

        // 回転サウンド
        soundManager.play('rotate', { playbackRate: 1.2, volume: 0.5 });
    }
}




//左右キー押下時の移動処理
//DAS (Delayed Auto Shift)（移動キー押下時の連続移動）処理が入っている。
function handleHorizontalMove(delta) {
    if (state.leftKeyDown) {
        if (!state.hasMovedLeft) {
            moveBlockHorizontal(-1);
            state.hasMovedLeft = true;
            state.lastMoveTimeLeft = 0;
        } else {
            state.lastMoveTimeLeft += delta;
            if (state.lastMoveTimeLeft > cfg.KEY_MOVE_INITIAL_DELAY) {
                while (state.lastMoveTimeLeft > cfg.KEY_MOVE_REPEAT_INTERVAL + cfg.KEY_MOVE_INITIAL_DELAY) {
                    state.lastMoveTimeLeft -= cfg.KEY_MOVE_REPEAT_INTERVAL;
                    moveBlockHorizontal(-1);// ← ここが複数回呼ばれる
                }
            }
        }
    } else {
        state.hasMovedLeft = false;
        state.lastMoveTimeLeft = 0;
    }

    if (state.rightKeyDown) {
        if (!state.hasMovedRight) {
            moveBlockHorizontal(1);
            state.hasMovedRight = true;
            state.lastMoveTimeRight = 0;
        } else {
            state.lastMoveTimeRight += delta;
            if (state.lastMoveTimeRight > cfg.KEY_MOVE_INITIAL_DELAY) {
                while (state.lastMoveTimeRight > cfg.KEY_MOVE_REPEAT_INTERVAL + cfg.KEY_MOVE_INITIAL_DELAY) {
                    state.lastMoveTimeRight -= cfg.KEY_MOVE_REPEAT_INTERVAL;
                    moveBlockHorizontal(1);
                }
            }
        }
    } else {
        state.hasMovedRight = false;
        state.lastMoveTimeRight = 0;
    }
}



//暫定的にココにタイトル画面を置く　今後別ファイルとする。

function enterTitlePhase() {
    //    console.log('[DBG] enterTitlePhase');//for debug

    const title = document.getElementById('titleScreen');
    title.style.display = 'flex';
    title.focus();                             // ★ ← キーボードフォーカス獲得

    window.addEventListener('keydown', onTitleKey, { once: true });
}


function onTitleKey(e) {

    //    console.log('[DBG] onTitleKey key=', e.key);//for debug

    if (e.key === 'k' || e.key === 'K') {
        setInputDevice('keyboard');
    } else if (e.key === 'g' || e.key === 'G') {
        setInputDevice('gamepad');
    } else {
        return;            // それ以外は無視
    }

    // ① AudioContext を再開（iOS Safari / Chrome で必要）
    soundManager.resumeContext();

    // ② BGM を再生（必要ならループ設定も後述）
    soundManager.play('bgm_play', { loop: true, bus: 'bgm', playbackRate: 1.2, volume: 0.5 });   // ループ再生

    // 画面を消してゲーム開始
    document.getElementById('titleScreen').style.display = 'none';
    state.currentPhase = PHASE.PLAYING;
}



/* -------------------------------------------
   ★[10] ゲーム開始
   ----------------------------------------- */
startGame();
