

/**
 * Engine クラス
 * ゲーム用キャンバスの初期化と描画ループを管理します。
 * - 指定した canvas 要素を取得し、GameConfig に基づく解像度にリサイズ
 * - ループごとに経過時間 (dt) を計算し、コールバックに渡して更新・描画をドライブ
 * - requestAnimationFrame を用いて安定したフレーム駆動を実現
 */
import { GameConfig } from './GameConfig.js';

export class Engine {
    /**
     * @param {string} canvasId - ID of the canvas element
     * @param {GameConfig} cfg - game configuration
     */
    constructor(canvasId, cfg) {
        this.cfg = cfg;
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found.`);
        }
        this.ctx = this.canvas.getContext('2d');
        // calculate logical dimensions: include side walls (+2 columns) and bottom wall (+1) + top margin
        this.cols = cfg.COLS + 2;
        this.width = this.cols * cfg.BLOCK_SIZE;
        this.height = (cfg.TOP_MARGIN + cfg.ROWS + 1) * cfg.BLOCK_SIZE;
        // resize canvas to match game resolution
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this._lastTime = performance.now();
    }

    /**
     * Starts the game loop, invoking the callback each frame with elapsed time (ms).
     * @param {(dt: number) => void} frameCallback
     */
    start(frameCallback) {
        const loop = (now) => {
            const dt = now - this._lastTime;
            this._lastTime = now;
            frameCallback(dt);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame((now) => {
            this._lastTime = now;
            loop(now);
        });
    }
}
