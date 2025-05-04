import { Scene } from '../core/Scene.js';
import { ACTIONS } from '../input/inputHandler.js';
import { DROP_SPEED_LABELS } from '../core/GameConfig.js';

export default class SettingsScene extends Scene {
    constructor() {
        super();
        this._cursor = 0;
        this.options = [
            { label: '落下速度', values: DROP_SPEED_LABELS, selected: 3 },
            { label: 'BGM', values: ['bgm_play', 'bgm_over', 'loop1_v3'], selected: 0 },
            { label: 'フィールド', values: ['10×20', '15×30', '20×40'], selected: 0 },
            // { label: '入力デバイス', values: ['Keyboard', 'Gamepad'], selected: 0 },
        ];

        // Restore saved settings
        if (window.settingOptions) {
            this.options.forEach(opt => {
                const saved = window.settingOptions[opt.label];
                if (typeof saved === 'number' && saved >= 0 && saved < opt.values.length) {
                    opt.selected = saved;
                }
            });
        }
    }

    enter() {
        // メニュー画面用 BGM 再生 (初期化時に実行)
        // window.bgmManager.play('bgm_init');
        // immediate key handling for returning to menu
        this._onKey = (e) => {
            if (e.key === 'c' || e.key === 'C' || e.key === 'Enter') {
                this._mgr.changeTo('title');
            }
        };
        window.addEventListener('keydown', this._onKey);
    }
    exit() {
        // Save settings to persist across scenes
        window.settingOptions = {};
        this.options.forEach(opt => {
            window.settingOptions[opt.label] = opt.selected;
        });
        window.removeEventListener('keydown', this._onKey);
    }


    update(dt) {
        // Cキー/Enterキー or ゲームパッドのBackボタンでタイトルへ戻る
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
