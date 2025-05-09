/**
 * クラス名: WallpaperController
 * 概要  : ゲーム進行に合わせて背景画像（壁紙）を切り替え・描画するコントローラ
 * 機能  :
 *   - init(): EventBus でフェーズ変更を購読し、壁紙切替タイミングを検知
 *   - setImage(src: string): 画像ソースを設定し、ロード後に描画
 *   - drawBg(): 現在の画像をキャンバス全体にスケーリング描画
 * 公開メソッド:
 *   - init()
 */
import { EventBus } from './EventBus.js';

export class WallpaperController {
    /**
     * @param {string} canvasId - 背景描画用キャンバスの ID 属性
     */
    constructor(canvasId = 'bgCanvas') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.img = new Image();
        this.img.onload = () => this._draw();      // ← private に変更
        window.addEventListener('resize', () => this._resize());
        this._resize();                            // 初期リサイズ
    }


    _resize() {
        const dpr = window.devicePixelRatio ?? 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;   // CSS ピクセル
        this.canvas.style.height = `${window.innerHeight}px`;
        this._draw();   // キャンバスが変わったら再描画
    }

    /**
     * 初期化：EventBus でフェーズ変更イベントを購読する
     */
    init() {
        EventBus.on('phaseChanged', (phase) => {
            this.onPhaseChange(phase);
        });
    }

    /**
     * フェーズ変更時のハンドラ
     * @param {string} phase - ゲームフェーズ名
     */
    onPhaseChange(phase) {
        // フェーズに応じた画像パスを選択
        let src;
        switch (phase) {
            case 'title':
                src = './assets/images/wall3.png';
                break;
            case 'playing':
                src = './assets/images/wall1.png';
                break;
            case 'gameover':
                src = './assets/images/wall1.png';
                break;
            default:
                src = './assets/images/wall3.png';
        }
        this.setImage(src);
    }

    /**
     * 画像ソースを設定し、ロード完了後に描画
     * @param {string} src - 画像ファイルのパス
     */
    setImage(src) {
        this.img.src = src;
    }

    /**
     * キャンバスに画像を全体スケーリング描画
     */
    _draw() {
        if (!this.img.complete) return;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const iw = this.img.width;
        const ih = this.img.height;
        const scale = Math.max(cw / iw, ch / ih);
        const w = iw * scale;
        const h = ih * scale;
        const x = (cw - w) / 2;
        const y = (ch - h) / 2;
        this.ctx.clearRect(0, 0, cw, ch);
        this.ctx.drawImage(this.img, x, y, w, h);
    }
}
