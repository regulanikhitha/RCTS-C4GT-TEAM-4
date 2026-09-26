import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef(({ className, style, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn('custom-checkbox-root', className)}
    style={{
      width: 20,
      height: 20,
      minWidth: 20,
      minHeight: 20,
      borderRadius: 5,
      border: '2px solid #0f766e',
      backgroundColor: props.checked ? '#0f766e' : '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0,
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.15s ease',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      ...style,
    }}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        width: '100%',
        height: '100%',
      }}
    >
      <Check size={14} strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

