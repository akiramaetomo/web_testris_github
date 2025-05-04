// GameConfig.js 2025-05-02
// ゲームパラメータをまとめた「設定」クラス。
// new GameConfig({ ROWS:30, speedIndex:2 }) のようにオーバーライド可能。

// ドロップ速度オプション（SettingsSceneで表示するラベル）
export const DROP_SPEED_LABELS = [
    '20G(833us)',
    '10G(1.67ms)',
    '5G(3.33ms)',
    '1G(16.67ms)',
    '0.5G(33.3ms)',
    '50ms',
    '100ms',
    '500ms',
    '1s'
];

// ドロップ速度定数（ms単位）
export const DROP_SPEED_VALUES = [
    0.833,
    1.667,
    3.333,
    16.667,
    33.3,
    50,
    100,
    500,
    1000
];

export class GameConfig {
    constructor(overrides = {}) {
        // drop speed index: overrides or persistent setting or default(1G)
        let speedIndex = overrides.speedIndex;
        if (speedIndex == null) {
            speedIndex = window.settingOptions?.['落下速度'];
        }
        if (typeof speedIndex !== 'number' ||
            speedIndex < 0 || speedIndex >= DROP_SPEED_VALUES.length) {
            speedIndex = 3; // default to 1G
        }
        delete overrides.speedIndex;

        Object.assign(this, {
            /* --- プレイフィールド寸法 --- */
            COLS: 10,
            ROWS: 20,
            TOP_MARGIN: 1,

            /* --- 描画 --- */
            BLOCK_SIZE: 40,
            NEXT_BLOCK_SIZE: 40,

            /* --- ソフトドロップ --- */
            SOFT_DROP_FRAME: 3,

            /* --- 横移動 DAS --- */
            KEY_MOVE_INITIAL_DELAY: 200,
            KEY_MOVE_REPEAT_INTERVAL: 17,

            /* --- 行消去アニメ --- */
            LINE_STEP_FALL_TIME: 0,
            LINE_STEP_PAUSE_TIME: 0,

            /* --- 各種ディレイ --- */
            FALL_DELAY: 500, // ブロックが揃い、消去までのディレイ
            LOCK_DELAY: 500, // Lock Delay
            SPAWN_DELAY: 500 // 新ブロック出現前の待機時間
        }, overrides);

        // set natural drop interval from selected speed
        this.NATURAL_DROP_INTERVAL = DROP_SPEED_VALUES[speedIndex];
        this.speedIndex = speedIndex;
        this.dropSpeedLabel = DROP_SPEED_LABELS[speedIndex];
    }
}
