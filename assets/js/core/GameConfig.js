// GameConfig.js 2025-05-02
// ゲームパラメータをまとめた「設定」クラス。
// new GameConfig({ ROWS:30, speedIndex:2 }) のようにオーバーライド可能。

// ドロップ速度オプション（SettingsSceneで表示するラベル）



import { SETTING_DEFINITIONS } from '../config/settingDefinitions.js';

export class GameConfig {
    constructor(overrides = {}) {
        for (const def of SETTING_DEFINITIONS) {
            const key = def.key;
            const options = def.options;
            const saved = overrides[key] ?? window.settingOptions?.[key];
            let selected;

            if (typeof saved !== 'undefined') {
                const idx = options.findIndex(opt => JSON.stringify(opt.value) === JSON.stringify(saved));
                selected = idx >= 0 ? idx : def.defaultIndex;
            } else {
                selected = def.defaultIndex;
            }

            const opt = options[selected];
            this[key] = opt.value;

            // ラベルも必要なら同時に
            this[key + 'Label'] = opt.label;

            // 特別用途に応じた追加変数も（例：落下間隔）
            if (key === 'speedIndex') {
                this.NATURAL_DROP_INTERVAL = opt.value;
            }

            if (key === 'fieldSize') {
                this.COLS = opt.value[0];
                this.ROWS = opt.value[1];
            }
        }

        // 固定設定（今後可変化予定）
        this.TOP_MARGIN = 1;
        this.BLOCK_SIZE = 40;
        this.NEXT_BLOCK_SIZE = 40;
        this.SOFT_DROP_FRAME = 3;
        this.KEY_MOVE_INITIAL_DELAY = 200;
        this.KEY_MOVE_REPEAT_INTERVAL = 17;
        this.LINE_STEP_FALL_TIME = 0;
        this.LINE_STEP_PAUSE_TIME = 0;
        this.FALL_DELAY = 500;
        this.LOCK_DELAY = 500;
        this.SPAWN_DELAY = 500;
    }
}





