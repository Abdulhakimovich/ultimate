'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import Checkbox from '@/components/ui/Checkbox';

interface TaskRowProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: () => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

export default function TaskRow({
  id,
  text,
  completed,
  onToggle,
  onUpdate,
  onDelete,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== text) {
      onUpdate(trimmed);
    } else {
      setEditText(text);
    }
    setIsEditing(false);
  }, [editText, text, onUpdate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setEditText(text);
        setIsEditing(false);
      }
    },
    [handleSave, text],
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
        completed
          ? 'bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]'
          : 'hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
      }`}
    >
      <Checkbox
        checked={completed}
        onChange={onToggle}
        size="sm"
        ariaLabel={`Задача: ${text}`}
      />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-b border-[#00D4FF] text-xs text-text-primary outline-none py-0.5"
          aria-label="Редактирование задачи"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-xs cursor-text truncate transition-colors ${
            completed ? 'line-through text-[#7BA7CC]/70' : 'text-[#E8F4FF]'
          }`}
        >
          {text}
        </span>
      )}

      <button
        type="button"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#7BA7CC] hover:text-[#FF3366] transition-all"
        aria-label="Удалить задачу"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}
