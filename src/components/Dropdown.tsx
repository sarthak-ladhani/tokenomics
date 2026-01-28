interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({ options, value, onChange, placeholder = 'Select...', className = '' }: DropdownProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`inline-block px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700 font-medium
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        hover:bg-indigo-100 cursor-pointer transition-colors ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
