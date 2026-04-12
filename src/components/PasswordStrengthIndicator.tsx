import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Rule {
  label: string;
  test: (p: string) => boolean;
}

const rules: Rule[] = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: '1 uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: '1 number', test: (p) => /\d/.test(p) },
  { label: '1 symbol (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  const passed = rules.filter((r) => r.test(password)).length;
  const strength = passed <= 1 ? 'Weak' : passed <= 2 ? 'Fair' : passed <= 3 ? 'Good' : 'Strong';
  const barColor =
    passed <= 1 ? 'bg-destructive' : passed <= 2 ? 'bg-amber-500' : passed <= 3 ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i <= passed ? barColor : 'bg-muted')}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Strength: <span className="font-medium text-foreground">{strength}</span>
      </p>

      {/* Rule checklist */}
      <div className="space-y-1">
        {rules.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1.5 text-[11px]">
              {ok ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground/50" />
              )}
              <span className={ok ? 'text-green-400' : 'text-muted-foreground'}>{rule.label}</span>
            </div>
          );
        })}
      </div>

      {/* Example */}
      <p className="text-[10px] text-muted-foreground/70">
        Example: <span className="font-mono text-muted-foreground">Titan@123</span>
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
