/**
 * クラス名: BGMManager
 * 概要  : BGM トラックの登録・ロード・再生・切り替え（フェード）を管理するサービス
 * 機能  :
 *   - init(tracks: Record<string,string>): トラック名とファイルパスのマップを登録しロード
 *   - play(trackKey: string): 指定トラックをループ再生
 *   - switch(trackKey: string, fadeMs?: number): 現在のトラックをフェードアウトし、新トラックに切り替え
 *   - stop(fadeMs?: number): BGM をフェードアウトして停止
 * 公開メソッド:
 *   - init()
 *   - play()
 *   - switch()
 *   - stop()
 */
import { soundManager } from './globalSoundManager.js';

export class BGMManager {
    constructor() {
        /** @type {Record<string,string>} 登録されたトラック名→URL マップ */
        this.tracks = {};
        /** @type {string|null} 現在再生中のトラックキー */
        this.currentTrack = null;
    }

    /**
     * トラックを登録してロードする
     * @param {Record<string,string>} tracks - キー: トラック名, 値: ファイルパス
     * @returns {Promise<void>}
     */
    async init(tracks) {
        this.tracks = tracks;
        await soundManager.loadAllSounds(tracks);
    }

    /**
     * トラックをループ再生する
     * @param {string} trackKey - 登録済みトラックのキー
     */
    play(trackKey) {
        if (!this.tracks[trackKey]) {
            console.warn(`BGMManager: Unknown trackKey "${trackKey}"`);
            return;
        }
        // 既存のBGMを停止
        if (this.currentTrack) {
            soundManager.stop(this.currentTrack);
        }
        soundManager.play(trackKey, { loop: true, bus: 'bgm' });
        this.currentTrack = trackKey;
    }

    /**
     * 現在のトラックをフェードアウトし、指定トラックに切り替える
     * @param {string} trackKey - 切り替え先トラックのキー
     * @param {number} [fadeMs=1000] - フェード時間（ms）
     */
    switch(trackKey, fadeMs = 1000) {
        if (this.currentTrack) {
            soundManager.fadeOutBgm(fadeMs);
        }
        setTimeout(() => {
            this.play(trackKey);
        }, fadeMs);
    }

    /**
     * BGM をフェードアウトして停止する
     * @param {number} [fadeMs=1000] - フェード時間（ms）
     */
    stop(fadeMs = 1000) {
        if (this.currentTrack) {
            soundManager.fadeOutBgm(fadeMs);
            this.currentTrack = null;
        }
    }
}
