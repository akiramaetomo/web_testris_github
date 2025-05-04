// scenes/TitleScene.js
import { Scene } from '../core/Scene.js';
import { ACTIONS } from '../input/inputHandler.js';  // ★ 追加
//import { soundManager } from '../audio/globalSoundManager.js'; // ←シングルトンで共有している想定
import { EventBus } from '../utils/EventBus.js';

//soundManager.play('bgm_title', { loop:true, bus:'bgm' });

export default class TitleScene extends Scene {

    constructor(mgr) { super(); this._mgr = mgr; }   // ← mgr 受け取る

    enter() {
        console.log('[Scene] enter Title !!!!!');
        EventBus.emit('phaseChanged', 'title');
        // メニュー画面用 BGM 再生
        this._mgr.app.bgm.play('bgm_init');
        document.getElementById('gameCanvas').focus();
        // Add key listener for Settings
        this._onKey = (e) => {
            if (e.key === 's' || e.key === 'S') this._mgr.changeTo('settings');
        };
        window.addEventListener('keydown', this._onKey);
    }

    exit() {
        // Remove settings key listener
        window.removeEventListener('keydown', this._onKey);
    }

    update(dt) {
        if (window.input.isPressed(ACTIONS.ENTER) || window.input.isPressed(ACTIONS.START)) {
            // Apply desired device if set
            if (window.desiredDevice) {
                window.setInputDevice(window.desiredDevice);
                delete window.desiredDevice;
            }
            this._mgr.changeTo('gameplay');
        }

        if (window.input.isPressed(ACTIONS.BACK)) {
            this._mgr.changeTo('settings');
            return;
        }



    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('■■■■■TeST-Ris■■■■■', ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.font = '24px sans-serif';
        ctx.fillText('Press Enter(START) to start', ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
        ctx.fillText('Press B(BACK) for Settings', ctx.canvas.width / 2, ctx.canvas.height / 2 + 80);
    }
}
