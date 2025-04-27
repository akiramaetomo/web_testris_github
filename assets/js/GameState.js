// GameState.js  Phase‑1.1 2025‑04‑27
// 状態専用コンテナ。cfg (GameConfig インスタンス) への参照を保持します。

export class GameState {
    /** @param {GameConfig} cfg */
    constructor(cfg) {
        this.cfg = cfg;               // 共有設定への参照 (可変 OK)

        // 便利にアクセスしたい主要寸法だけコピー
        this.COLS = cfg.COLS;
        this.ROWS = cfg.ROWS;
        //        this.TOP_MARGIN = cfg.TOP_MARGIN;

        /* === ゲーム状態 === */
//        this.initField();

        this.currentBlock = null;
        this.nextBlock = null;

        this.currentPhase = 'title';
        this.phaseTimer = 0;

        /* タイマー・ドロップ関連 */
        this.lastUpdateTime = 0;
        this.dropAccumulator = 0;
        this.forcedDrop = false;

        /* 入力状態 (DAS) */
        this.leftKeyDown = false;
        this.rightKeyDown = false;
        this.lastMoveTimeLeft = 0;
        this.lastMoveTimeRight = 0;
        this.hasMovedLeft = false;
        this.hasMovedRight = false;
        
        /* 着地・固定判定 */
        this.landed = false;
        this.landingTimer = null;
        this.spawnTimer = null;
        this.blockFixed = false;

        //ライン消去関係
        this.pendingLinesToClear = null; // グローバルまたは上部で宣言


        /* ===== Collapsing フェーズ ===== */
        this.collapseTimer = 0;// サブタイマー
        this.collapseState = 'fall';   // 'fall' / 'pause'
        this.stepsPerChunk = 0;// = 消去行数 n
        this.stepsRemainingInChunk = 0;// カウントダウン用

    }

    /** ROWS×COLS を 0 埋めで初期化 */
    //暫定的にフィールドはglobalとしておく
    
//    initField() {
//        this.field = Array.from({ length: this.ROWS },
//            () => Array(this.COLS).fill(0));
//    }

}