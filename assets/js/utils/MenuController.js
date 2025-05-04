/**
 * クラス名: MenuController
 * 概要  : BGM 切替用のセレクトメニューを生成し、選択時にコールバックを実行するコントローラ
 * 機能  :
 *   - init(menuId: string, trackKeys: string[]): メニュー要素を取得し、トラックキーを option 要素として登録
 *   - onSelect(callback: (trackKey: string) => void): ユーザーがメニューを変更した際にコールバックを呼び出す
 * 公開メソッド:
 *   - init()
 *   - onSelect()
 */
export class MenuController {
    constructor() {
        /** @type {HTMLSelectElement} */
        this.menuEl = null;
        /** @type {(trackKey: string) => void} */
        this.callback = null;
    }

    /**
     * セレクトメニューを初期化
     * @param {string} menuId - <select> 要素の ID
     * @param {string[]} trackKeys - 登録するトラックキー一覧
     */
    init(menuId, trackKeys) {
        const el = document.getElementById(menuId);
        if (!(el instanceof HTMLSelectElement)) {
            console.warn(`MenuController: ${menuId} is not a select element`);
            return;
        }
        this.menuEl = el;
        // メニューをクリア
        el.innerHTML = '';
        // オプションを登録
        trackKeys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            el.appendChild(option);
        });
        // 選択イベント
        el.addEventListener('change', () => {
            if (this.callback) {
                this.callback(el.value);
            }
        });
    }

    /**
     * ユーザー選択時のコールバックを登録
     * @param {(trackKey: string) => void} callback 
     */
    onSelect(callback) {
        this.callback = callback;
    }
}
