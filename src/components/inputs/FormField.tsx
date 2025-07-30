// src/components/inputs/FormField.tsx
import React from 'react';
import { UseFormRegister, Path, FieldError } from 'react-hook-form';

interface FormFieldProps<TFormValues extends Record<string, unknown>> {
  type: string;
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  register: UseFormRegister<TFormValues>;
  error?: FieldError;
  disabled?: boolean;
  autoComplete?: string;
  children?: React.ReactNode; // Para adicionar ícones, etc.
}

export const FormField = <TFormValues extends Record<string, unknown>>(
  { type, name, label, placeholder, register, error, disabled, autoComplete, children }: FormFieldProps<TFormValues>
) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        {...register(name)}
        className={`w-full border p-3 rounded-lg bg-slate-50 border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow ${error ? 'border-red-500' : ''}`}
      />
      {children && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{children}</div>}
    </div>
    {error && <p className="text-red-600 text-xs mt-1">{error.message}</p>}
  </div>
);