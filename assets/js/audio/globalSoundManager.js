// src/audio/globalSoundManager.js
import { SoundManager } from './soundManager.js';   // ← クラスを読み込む

// ここでただ 1 回だけ生成
export const soundManager = new SoundManager();
