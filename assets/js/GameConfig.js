// GameConfig.js 2025-04-27
// ゲームパラメータをまとめた「設定」クラス。
// new GameConfig({ ROWS:30 }) のようにオーバーライド可能。

export class GameConfig {
    constructor(overrides = {}) {
        Object.assign(this, {
            /* --- プレイフィールド寸法 --- */
            COLS: 10,
            ROWS: 20,
            TOP_MARGIN: 1,

            /* --- 描画 --- */
            BLOCK_SIZE: 40,
            NEXT_BLOCK_SIZE: 40,
            /* --- 落下速度関連 --- */
            NATURAL_DROP_INTERVAL: 16,
            SOFT_DROP_FRAME: 3,

            /* --- 横移動 DAS --- */
            KEY_MOVE_INITIAL_DELAY: 200,
            KEY_MOVE_REPEAT_INTERVAL: 17,

            /* --- 行消去アニメ --- */
            LINE_STEP_FALL_TIME: 0,
            LINE_STEP_PAUSE_TIME: 60,

            /* --- 各種ディレイ --- */
            FALL_DELAY: 500, // ブロックが揃い、消去までのディレイ
            LOCK_DELAY: 500, // ★ Lock Delay(衝突検出から固定までの猶予時間
            SPAWN_DELAY: 500// 新ブロック出現前の待機時間
        }, overrides);
    }
}