"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Color de acento del agente activo (para el botón enviar). */
  accent?: string;
}

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "Escribe a la granja…",
  accent = "#7c5cff",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envía; Shift+Enter hace salto de línea.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function autoGrow(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/5 p-2 backdrop-blur-xl focus-within:border-white/30">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={autoGrow}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none disabled:opacity-50"
      />
      <button
        onClick={submit}
        disabled={!canSend}
        aria-label="Enviar"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:opacity-30"
        style={{ backgroundColor: canSend ? accent : "rgba(255,255,255,0.1)" }}
      >
        <Send size={18} />
      </button>
    </div>
  );
}
