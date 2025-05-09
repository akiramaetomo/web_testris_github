import { Scene } from '../core/Scene.js';
import { ACTIONS } from '../input/inputHandler.js';
//import { DROP_SPEED_LABELS } from '../core/GameConfig.js';
import { SETTING_DEFINITIONS } from '../config/settingDefinitions.js';

export default class SettingsScene extends Scene {

    constructor(mgr) {
        super(mgr);

        this._cursor = 0;

        // 各設定項目を UI 表示用に変換（インデックス付き）
        this.options = SETTING_DEFINITIONS.map(def => {
            const saved = window.settingOptions?.[def.key];
            const index = def.options.findIndex(opt => JSON.stringify(opt.value) === JSON.stringify(saved));
            return {
                key: def.key,
                label: def.label,
                values: def.options.map(opt => opt.label),
                selected: index >= 0 ? index : def.defaultIndex
            };
        });
    }




    enter() {

    }


    exit() {
        // 設定値の保存（選択 index → 実際の value に変換）
        window.settingOptions = {};
        this.options.forEach(opt => {
            const def = SETTING_DEFINITIONS.find(d => d.key === opt.key);
            const selectedValue = def.options[opt.selected].value;
            window.settingOptions[opt.key] = selectedValue;
        });

        // 設定変更をゲーム全体に適用
        window.app.reconfigure();

    }



    update() {
        //'B',enter,ゲームパッドのBackボタンでタイトルへ戻る
        if (window.input.isPressed(ACTIONS.BACK) || window.input.isPressed(ACTIONS.ENTER)) {
            this._mgr.changeTo('title');
            return;
        }
        const optCount = this.options.length;
        if (window.input.isPressed(ACTIONS.MOVE_UP)) {
            this._cursor = (this._cursor + optCount - 1) % optCount;
        }
        if (window.input.isPressed(ACTIONS.MOVE_DOWN)) {
            this._cursor = (this._cursor + 1) % optCount;
        }
        const opt = this.options[this._cursor];
        const valCount = opt.values.length;
        if (window.input.isPressed(ACTIONS.MOVE_LEFT) || window.input.isPressed(ACTIONS.ROTATE_L)) {
            opt.selected = (opt.selected + valCount - 1) % valCount;
        }
        if (window.input.isPressed(ACTIONS.MOVE_RIGHT) || window.input.isPressed(ACTIONS.ROTATE_R)) {
            opt.selected = (opt.selected + 1) % valCount;
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Settings', 50, 40);
        ctx.font = '16px sans-serif';
        ctx.fillText('Use ↑/↓ to move, ←/→ to change, B(BACK) to main', 50, 70);

        const startY = 110;
        const lineHeight = 30;
        this.options.forEach((opt, idx) => {
            const y = startY + idx * lineHeight;
            if (idx === this._cursor) {
                ctx.fillStyle = '#ff0';
                ctx.fillText('> ' + opt.label + ': ' + opt.values[opt.selected], 50, y);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillText(opt.label + ': ' + opt.values[opt.selected], 70, y);
            }
        });
    }
}
