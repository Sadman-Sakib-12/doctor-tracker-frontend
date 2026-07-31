"use client";
import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  // Stable ref — never goes in any dependency array
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Debounce 500ms — only depends on `local`, NOT on `onChange`
  useEffect(() => {
    const t = setTimeout(() => {
      onChangeRef.current(local);
    }, 500);
    return () => clearTimeout(t);
  }, [local]);

  // Sync if parent resets value
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {local && (
        <button
          onClick={() => {
            setLocal("");
            onChangeRef.current("");
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
