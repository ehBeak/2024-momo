import type { InputHTMLAttributes } from 'react';

import { s_input } from './Input.styles';

export type InputVariant = 'default' | 'transparent' | 'floating';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  isError?: boolean;
}

export default function Input({ variant = 'default', type = 'text', ...props }: InputProps) {
  return <input css={s_input[variant]} type={type} spellCheck={false} {...props} />;
}
