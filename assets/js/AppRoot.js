// @ts-nocheck
/* ====================================================================
 *  AppRoot.js  ―  “アプリ唯一の組み立てクラス”
 * ==================================================================*/
import { GameConfig } from './core/GameConfig.js';
import { Engine } from './core/Engine.js';
import { SceneManager } from './scenes/SceneManager.js';
import { SceneFactory } from './scenes/SceneFactory.js';
import { SOUND_PATHS, BGM_PATHS } from './config/settingDefinitions.js';
import { CombinedInputHandler } from './input/CombinedInputHandler.js';
import { soundManager } from './audio/globalSoundManager.js'; // 既存シングルトン
import { BGMManager } from './audio/BGMManager.js';
import { StatsManager } from './utils/StatsManager.js';
import { DisplayManager } from './utils/DisplayManager.js';
import { WallpaperController } from './utils/WallpaperController.js';
import { PerfStats } from './utils/perfStats.js';
import { AppInitializer } from './utils/AppInitializer.js';
import { EventBus } from './utils/EventBus.js';

export class AppRoot {
    constructor() {
        /* ---------------- 1. 生成フェーズ ---------------- */
        /* ★ ここで先に bgm を作り window に出しておく */
        this.bgmMgr = new BGMManager();
        window.bgmManager = this.bgmMgr;

        /* サウンド */
        this.soundMgr = soundManager;               // 既存シングルトンを転用
        this.eventBus = EventBus;                   // 既存シングルトンを転用

        /* 入力 */
        this.input = new CombinedInputHandler();
        window.input = this.input;

        //コンフィグ
        this.gameConfig = new GameConfig();         //デフォルト値の設定
        this.engine = new Engine('gameCanvas', this.gameConfig);

        /* シーンマネージャ */
        const sceneFactory = new SceneFactory();
        // SceneFactory クラスのインスタンスメソッド `createScene` を、
        // そのインスタンス (`sceneFactory`) に束縛（bind）して関数化
        // `bind` しないと、`this` が失われて正しく動作しないため必須
        //第一引数をclass受けする方法もあるがひとまずこのまま。mae
        this.scenes = new SceneManager(sceneFactory.createScene.bind(sceneFactory), 'title', this);

        /* 統計・表示・壁紙 */
        this.statsMgr = StatsManager;       // 既存シングルトンを転用

        //処理負荷計測
        this.perfStats = new PerfStats({ enabled: true, interval: 1000, keyToggle: 'F3' });

        //描画キャンバスのサイズ設定
        const nextW = document.getElementById('nextCanvas').width;
        const statsEl = document.getElementById('statsArea');
        const infoEl = document.getElementById('infoArea');

        statsEl.style.width = `${nextW}px`;
        infoEl.style.width = `${nextW}px`;
        statsEl.style.height = `${this.engine.canvas.height}px`;

        this.displayMgr = new DisplayManager(statsEl, infoEl);
        this.wallpaper = new WallpaperController();

        /* AppInitializer で非同期タスクをまとめる */
        this.initTasks = new AppInitializer();

        this._registerInitTasks();
    }

    /** 非同期初期化タスクの登録 */
    _registerInitTasks() {
        /* SEサウンドロード */
        this.initTasks.register('LoadSounds', async () => {
            await this.soundMgr.loadAllSounds(SOUND_PATHS);
            this.soundMgr.setVolume({ master: 0.5, sfx: 0.5, bgm: 0.5 });
        });

        /* BGMManager 初期化 */
        this.initTasks.register('InitBGMManager', async () => {
            await this.bgmMgr.init(BGM_PATHS);
            this.bgmMgr.play('bgm_init', { loop: true });
        });

        /* StatsManager 初期化 */
        this.initTasks.register('InitStatsManager', async () => {
            this.statsMgr.init();
        });

        /* DisplayManager 初期化 */
        this.initTasks.register('InitDisplayManager', async () => {
            this.displayMgr.init?.();                    // init() がある場合だけ
        });

        /* Wallpaper 初期化 */
        this.initTasks.register('InitWallpaper', async () => {
            await this.wallpaper.init();
        });
    }

    /**
     * Reconfigure game settings and engine after settings change
     */
    reconfigure() {
        // GameConfig のコンストラクタ内で window.settingOptions を参照して各種値を設定
        this.gameConfig = new GameConfig();
        this.engine.cfg = this.gameConfig;

        // キャンバスサイズ・UI 部分を再計算
        const width = (this.gameConfig.COLS + 2) * this.gameConfig.BLOCK_SIZE;
        const height = (this.gameConfig.TOP_MARGIN + this.gameConfig.ROWS + 1) * this.gameConfig.BLOCK_SIZE;
        this.engine.canvas.width = width;
        this.engine.canvas.height = height;
        this.engine.width = width;
        this.engine.height = height;
        document.getElementById('statsArea').style.height = `${height}px`;
    }


    /** アプリ起動（初期化完了後にメインループ開始） */
    async start() {
        await this.initTasks.init();

        let lastStatsHTML = "";
        this.engine.start((dt) => {
            this.perfStats.begin();
            this.input.poll(dt);

            this.scenes.update(dt);
            this.scenes.draw(this.engine.ctx);

            /* 情報／デバッグ表示 */
            const scene = this.scenes.getCurrentScene();
            if (scene.state?.cfg) {
                this.displayMgr.render(scene.state);
                lastStatsHTML = document.getElementById('statsArea').innerHTML;
            } else {
                document.getElementById('statsArea').innerHTML = lastStatsHTML;
                document.getElementById('infoArea').innerHTML = "";
            }

            this.input._afterPoll();
            this.perfStats.end();
        });

        /* 起動完了イベント */
        this.eventBus.emit('phaseChanged', 'title');
    }
}


/* シングルトンとして公開 */
export const app = new AppRoot();
window.app = app;
//window.engine = app.engine;     // 必要に応じて追加
