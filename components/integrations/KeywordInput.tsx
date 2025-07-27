import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KeywordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "e.g., Total Amount, Due Date, Product ID",
  className = "",
  disabled = false
}) => {
  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor="keywords" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Keywords (optional)
      </Label>
      <Input
        id="keywords"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-2"
      />
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Separate keywords with commas for targeted extraction.
      </p>
    </div>
  );
};

export default KeywordInput;
