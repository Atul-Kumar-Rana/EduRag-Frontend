import React from 'react';

interface SubjectInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SubjectInput: React.FC<SubjectInputProps> = ({ value, onChange, className }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter subject"
      className={className}
    />
  );
};

export default SubjectInput;