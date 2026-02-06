export function isCJK(char: string): boolean {
  if (!char) return false;
  const code = char.codePointAt(0);
  if (!code) return false;
  
  // Exclude hiragana and katakana - they are kana, not CJK ideographs
  if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
    return false;
  }
  
  // Common CJK ranges (kanji/hanzi only)
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf)    // CJK Unified Ideographs Extension A
  );
}

export function isHangul(char: string): boolean {
    if (!char) return false;
    const code = char.codePointAt(0);
    if (!code) return false;
    return (
        (code >= 0xac00 && code <= 0xd7a3) || 
        (code >= 0x1100 && code <= 0x11ff) || 
        (code >= 0x3130 && code <= 0x318f)
    );
}

export function isHiragana(char: string): boolean {
    if (!char) return false;
    const code = char.codePointAt(0);
    if (!code) return false;
    return (code >= 0x3040 && code <= 0x309f);
}

export function isKatakana(char: string): boolean {
    if (!char) return false;
    const code = char.codePointAt(0);
    if (!code) return false;
    return (code >= 0x30a0 && code <= 0x30ff);
}

export function isKana(char: string): boolean {
    return isHiragana(char) || isKatakana(char);
}

export function isJapanese(text: string): boolean {
    // If text contains any hiragana or katakana, consider it Japanese
    for (const char of text) {
        if (isHiragana(char) || isKatakana(char)) {
            return true;
        }
    }
    return false;
}

