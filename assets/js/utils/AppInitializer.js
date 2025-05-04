/**
 * クラス名: AppInitializer
 * 概要  : アプリ起動時の初期化タスクを一括オーケストレーションする
 * 機能  :
 *   - register(taskName: string, initFn: () => Promise<void>): タスクを登録
 *   - initializeAll(): 登録タスクを順次実行し、完了を Promise で返す
 * 公開メソッド:
 *   - init(): initializeAll() を呼び出し、ロード完了後に Promise を返す
 */
export class AppInitializer {
    constructor() {
        this.tasks = [];
    }

    /**
     * タスク登録
     * @param {string} name - タスク名
     * @param {() => Promise<void>} initFn - 初期化関数（Promise を返すもの）
     */
    register(name, initFn) {
        this.tasks.push({ name, initFn });
    }

    /**
     * 登録されたタスクを順次実行
     * @returns {Promise<void>}
     */
    async initializeAll() {
        for (const { name, initFn } of this.tasks) {
            console.log(`Initializing: ${name}`);
            await initFn();
        }
    }

    /**
     * 初期化を開始し、完了を Promise で通知
     * @returns {Promise<void>}
     */
    init() {
        return this.initializeAll();
    }
}
