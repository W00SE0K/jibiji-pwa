import { isCJK, isJapanese, isKana } from './cjk';
import { pinyin } from 'pinyin-pro';
import * as wanakana from 'wanakana';



export const HeadingLevel = {
  Body: 0,
  H2: 1,
  H1: 2,
} as const;

export type HeadingLevel = typeof HeadingLevel[keyof typeof HeadingLevel];

export interface Segment {
  text: string;
  bold: boolean;
  red: boolean;
}

export interface ParsedLine {
  level: HeadingLevel;
  segments: Segment[];
}

export function parseDocument(text: string): ParsedLine[] {
  const lines = text.split('\n');
  return lines.map(parseLine);
}

function parseLine(line: string): ParsedLine {
  let level: HeadingLevel = HeadingLevel.Body;
  let content = line;
  const trimmed = line.trim();

  if (trimmed.startsWith('##')) {
    level = HeadingLevel.H2;
    content = trimmed.substring(2);
  } else if (trimmed.startsWith('#')) {
    level = HeadingLevel.H1;
    content = trimmed.substring(1);
  }

  const segments = parseBoldAndRedSegments(content);
  return { level, segments };
}

function parseBoldAndRedSegments(s: string): Segment[] {
  const result: Segment[] = [];
  let remaining = s;

  while (true) {
    const startRange = remaining.indexOf('/red(');
    if (startRange !== -1) {
      const before = remaining.substring(0, startRange);
      appendBoldSegments(before, false, result);
      remaining = remaining.substring(startRange + 5); // length of "/red("

      const endIdx = remaining.indexOf(')');
      if (endIdx !== -1) {
        const redContent = remaining.substring(0, endIdx);
        remaining = remaining.substring(endIdx + 1);
        appendBoldSegments(redContent, true, result);
      } else {
        // Unclosed red tag, treat "/red(" as text
        appendBoldSegments('/red(', false, result);
      }
    } else {
      appendBoldSegments(remaining, false, result);
      break;
    }
  }
  return result;
}

function appendBoldSegments(s: string, red: boolean, result: Segment[]) {
  const parts = s.split('*');
  parts.forEach((part, index) => {
    // Even index = not bold, Odd index = bold (if surrounded by *)
    // Example: "A *B* C" -> ["A ", "B", " C"]
    // if string starts with *, first part is empty.
    result.push({
      text: part,
      bold: index % 2 === 1,
      red: red,
    });
  });
}

export interface RubySegment {
    char: string;
    pinyin: string;
    isCJK: boolean;
    isSpace: boolean;
}

export function getRubySegments(text: string): RubySegment[] {
    const result: RubySegment[] = [];
    
    // Detect if text is Japanese (contains hiragana or katakana)
    const isJapaneseText = isJapanese(text);
    
    if (isJapaneseText) {
        // Use WanaKana for Japanese romaji
        // Note: WanaKana can only convert kana (hiragana/katakana) to romaji, NOT kanji
        const textChars = Array.from(text);
        
        for (let i = 0; i < textChars.length; i++) {
            const char = textChars[i];
            
            // Check if it's kana (hiragana or katakana)
            if (isKana(char)) {
                const charRomaji = wanakana.toRomaji(char);
                
                result.push({
                    char,
                    pinyin: charRomaji,  // Kana always converts to romaji
                    isCJK: true,  // Treat as CJK for ruby rendering
                    isSpace: false
                });
            } else if (isCJK(char)) {
                // It's a kanji - no romaji available
                result.push({
                    char,
                    pinyin: '',
                    isCJK: true,
                    isSpace: false
                });
            } else {
                // Regular character or space
                result.push({
                    char,
                    pinyin: '',
                    isCJK: false,
                    isSpace: char.trim() === ''
                });
            }
        }
    } else {
        // Use pinyin-pro for Chinese
        const pinyinList = pinyin(text, { 
            toneType: 'symbol', 
            type: 'array' 
        });

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (isCJK(char)) {
                const py = pinyinList[i] || ''; 
                
                result.push({
                    char,
                    pinyin: py === char ? '' : py,
                    isCJK: true,
                    isSpace: false
                });
            } else {
                result.push({
                    char,
                    pinyin: '',
                    isCJK: false,
                    isSpace: char.trim() === ''
                });
            }
        }
    }
    
    return result;
}


