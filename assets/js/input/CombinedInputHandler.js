import { InputHandler } from './inputHandler.js';
import { KeyboardInputHandler } from './keyboard.js';
import { GamepadInputHandler } from './gamepad.js';

/**
 * Keyboard と Gamepad を同時に監視し、どちらかの入力を受け付けるハンドラ
 */
export class CombinedInputHandler extends InputHandler {
    constructor() {
        super();
        this.keyboard = new KeyboardInputHandler();
        this.gamepad = new GamepadInputHandler();
    }

    /**
     * 毎フレーム呼び出し。両方のハンドラを poll し、
     * active セットをマージする。
     */
    poll(dt) {
        this.keyboard.poll(dt);
        this.gamepad.poll(dt);
        this.active.clear();
        for (const act of this.keyboard.active) {
            this.active.add(act);
        }
        for (const act of this.gamepad.active) {
            this.active.add(act);
        }
    }

    /**
     * poll 後に呼び出し、両方の _afterPoll() を実行し、
     * 統合した前フレームセットを更新する。
     */
    _afterPoll() {
        this.keyboard._afterPoll();
        this.gamepad._afterPoll();
        super._afterPoll();
    }
}
