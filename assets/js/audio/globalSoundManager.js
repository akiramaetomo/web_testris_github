// /audio/globalSoundManager.js
/**
 * @file globalSoundManager.js
 * @module soundManagerInstance
 *
 * @description
 *   SoundManager クラスのシングルトンインスタンスを生成・エクスポートするモジュール。
 *   アプリケーション全体で共通のサウンド再生管理に使用する。
 *
 * @example
 * import { soundManager } from './globalSoundManager.js';
 * soundManager.play('drop');
 */


// src/audio/globalSoundManager.js
import { SoundManager } from './soundManager.js';   // ← クラスを読み込む

// ここでただ 1 回だけ生成
export const soundManager = new SoundManager();
