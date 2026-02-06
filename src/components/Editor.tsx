interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  return (
    <textarea
      className="w-full h-full px-5 py-4 text-[17px] leading-relaxed resize-none outline-none font-sans"
      style={{
        backgroundColor: 'var(--ios-tertiary-background)',
        color: 'var(--ios-label)',
        caretColor: 'var(--ios-blue)'
      }}
      placeholder="Type here... Use # for H1, ## for H2, *bold*, /red(text)."
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  );
}
