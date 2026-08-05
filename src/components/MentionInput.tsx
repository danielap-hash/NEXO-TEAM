import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { AtSign } from 'lucide-react';

interface MentionInputProps {
  value: string;
  onChange: (val: string) => void;
  users: User[];
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  users,
  placeholder = 'Escribe un mensaje o nota...',
  multiline = false,
  rows = 3,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filterText.toLowerCase()) || 
    u.email.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;
    const pos = e.target.selectionStart || 0;
    setCursorPos(pos);
    onChange(text);

    // Look back from current cursor position for '@'
    const lastAtPos = text.lastIndexOf('@', pos - 1);
    if (lastAtPos !== -1 && lastAtPos < pos) {
      const query = text.substring(lastAtPos + 1, pos);
      // Ensure no spaces inside the search query
      if (!query.includes(' ')) {
        setMentionIndex(lastAtPos);
        setFilterText(query);
        setShowDropdown(true);
        return;
      }
    }
    setShowDropdown(false);
  };

  const selectUser = (user: User) => {
    if (mentionIndex === -1) return;
    const before = value.substring(0, mentionIndex);
    const after = value.substring(cursorPos);
    const mentionTag = `@${user.email} `;
    const newText = before + mentionTag + after;
    onChange(newText);
    setShowDropdown(false);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = before.length + mentionTag.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 50);
  };

  return (
    <div className="relative w-full">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleInputChange}
          rows={rows}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition bg-white text-slate-800 ${className}`}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition bg-white text-slate-800 ${className}`}
        />
      )}

      {showDropdown && filteredUsers.length > 0 && (
        <div className="absolute z-50 left-0 bottom-full mb-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto p-1.5 border-t-2 border-t-indigo-500">
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
            <AtSign className="w-3 h-3 text-indigo-500" /> Selecciona usuario para mencionar
          </div>
          {filteredUsers.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => selectUser(user)}
              className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 rounded-lg transition flex items-center gap-2.5 group"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 group-hover:border-indigo-300"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user.email}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
