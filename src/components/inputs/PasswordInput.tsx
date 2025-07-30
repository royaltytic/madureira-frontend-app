// src/components/inputs/PasswordInput.tsx
import { useState } from 'react';
import { UseFormRegister, Path, FieldError } from 'react-hook-form';
import { FormField } from './FormField';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps<TFormValues extends Record<string, unknown>> {
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  register: UseFormRegister<TFormValues>;
  error?: FieldError;
  disabled?: boolean;
}

export const PasswordInput = <TFormValues extends Record<string, unknown>>(
  { name, label, placeholder, register, error, disabled }: PasswordInputProps<TFormValues>
) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      type={showPassword ? 'text' : 'password'}
      name={name}
      label={label}
      placeholder={placeholder}
      register={register}
      error={error}
      disabled={disabled}
      autoComplete="new-password"
    >
      <button 
        type="button" 
        onClick={() => setShowPassword(!showPassword)} 
        className="text-slate-500 hover:text-slate-700"
      >
        {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
      </button>
    </FormField>
  );
};