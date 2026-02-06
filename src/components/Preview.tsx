import { useMemo } from 'react';
import { parseDocument, getRubySegments, type ParsedLine, HeadingLevel, type RubySegment } from '../utils/parser';
import { cn } from '../utils/cn';

interface PreviewProps {
  content: string;
  showPinyin: boolean;
}

export function Preview({ content, showPinyin }: PreviewProps) {
  const lines = useMemo(() => parseDocument(content), [content]);

  if (!content.trim()) {
      return (
          <div className="flex flex-col items-center justify-center h-full"
               style={{ color: 'var(--ios-tertiary-label)' }}>
              <p className="text-[17px]">Type your content in Edit mode.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-start w-full px-5 py-4 pb-32 space-y-4">
      {lines.map((line, idx) => (
        <LineRenderer key={idx} line={line} showPinyin={showPinyin} />
      ))}
    </div>
  );
}

function LineRenderer({ line, showPinyin }: { line: ParsedLine, showPinyin: boolean }) {
    // Style based on level
    const baseStyle = "leading-loose";
    const headingStyle = line.level === HeadingLevel.H1 
       ? "text-2xl font-bold mb-4 mt-2" 
       : line.level === HeadingLevel.H2 
         ? "text-xl font-semibold mb-3 mt-2" 
         : "text-base mb-2";

    // Spacing adjustment: The swift code has specific gap logic.
    // Here we wrap segments. 

    return (
        <div className={cn("block break-words", headingStyle, baseStyle)}>
           {line.segments.map((seg, sIdx) => (
               <SegmentRenderer key={sIdx} text={seg.text} bold={seg.bold} red={seg.red} level={line.level} showPinyin={showPinyin} />
           ))}
        </div>
    );
}

function SegmentRenderer({ text, bold, red, level, showPinyin }: { text: string, bold: boolean, red: boolean, level: HeadingLevel, showPinyin: boolean }) {
    // Break text into RubySegments (char by char mostly for CJK)
    const parts = useMemo(() => getRubySegments(text), [text]);

    return (
        <>
          {parts.map((part, i) => (
              <RubyChar key={i} part={part} bold={bold} red={red} level={level} showPinyin={showPinyin} />
          ))}
        </>
    );
}

function RubyChar({ part, bold, red, level, showPinyin }: { part: RubySegment, bold: boolean, red: boolean, level: HeadingLevel, showPinyin: boolean }) {
    const textColor = red ? 'var(--ios-red)' : 'var(--ios-label)';
    const fontWeight = bold ? 'font-bold' : 'font-normal';
    
    // Larger font sizes for CJK characters based on heading level
    const cjkSize = level === HeadingLevel.H1 
        ? 'text-4xl' 
        : level === HeadingLevel.H2 
            ? 'text-3xl' 
            : 'text-2xl';
    
    if (part.isSpace) {
        return <span className="inline-block w-1" data-level={level}></span>;
    }

    if (!part.isCJK) {
        return <span className={cn(fontWeight, "font-sans")} style={{ color: textColor }} data-level={level}>{part.char}</span>;
    }

    // Ruby layout with larger CJK characters
    return (
        <ruby className={cn("mx-[1px]", fontWeight, cjkSize)}>
            <span className="font-serif" style={{ color: textColor }}>{part.char}</span>
            <rt className={cn(
                "text-[0.4em] text-slate-500 font-sans select-none transition-opacity duration-200 font-normal",
                // Red pinyin? Usually pinyin is neutral, but if requested:
                red && "text-red-400/80",
                !showPinyin && "hidden-pinyin"
            )}>
                {part.pinyin}
            </rt>
        </ruby>
    );
}
