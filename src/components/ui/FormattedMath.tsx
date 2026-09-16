import React from 'react';

interface FormattedMathProps {
  expression: string;
  className?: string;
}

/**
 * Shared math typesetting component used across AlgebraView, CasRow, and tool panels.
 * Transforms symbols like x^2 -> x², x_1 -> x₁, and complex exponents ^(expr) into <sup>.
 */
export const FormattedMath: React.FC<FormattedMathProps> = ({ expression, className }) => {
  if (!expression) return null;

  // Clean raw math strings: convert * to middle dot or space where appropriate
  const cleaned = expression
    .replace(/\s*\*\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim();

  // Parse exponent tokens (^2, ^3, ^(expr), etc.) and subscript tokens (_1, _a, etc.)
  const renderFormattedTokens = (text: string) => {
    // Regex matches:
    // 1. ^([0-9a-zA-Z+-]+) or ^\(([^)]+)\) for superscripts
    // 2. _([0-9a-zA-Z]+) or _\(([^)]+)\) for subscripts
    const regex = /(\^(\([^)]+\)|[0-9a-zA-Z+-]+))|(_(\([^)]+\)|[0-9a-zA-Z]+))/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`txt-${key++}`}>{text.slice(lastIndex, match.index)}</span>
        );
      }

      const fullMatch = match[0];
      if (fullMatch.startsWith('^')) {
        let exponent = fullMatch.slice(1);
        if (exponent.startsWith('(') && exponent.endsWith(')')) {
          exponent = exponent.slice(1, -1);
        }
        // Superscript map for clean Unicode when available
        const superscriptMap: Record<string, string> = {
          '0': '⁰',
          '1': '¹',
          '2': '²',
          '3': '³',
          '4': '⁴',
          '5': '⁵',
          '6': '⁶',
          '7': '⁷',
          '8': '⁸',
          '9': '⁹',
          '+': '⁺',
          '-': '⁻',
        };
        if (/^[0-9+-]+$/.test(exponent)) {
          const unicodeSup = exponent
            .split('')
            .map((ch) => superscriptMap[ch] || ch)
            .join('');
          elements.push(<span key={`sup-${key++}`}>{unicodeSup}</span>);
        } else {
          elements.push(
            <sup key={`sup-${key++}`} className="text-[0.75em] leading-none">
              {exponent}
            </sup>
          );
        }
      } else if (fullMatch.startsWith('_')) {
        let sub = fullMatch.slice(1);
        if (sub.startsWith('(') && sub.endsWith(')')) {
          sub = sub.slice(1, -1);
        }
        elements.push(
          <sub key={`sub-${key++}`} className="text-[0.75em] leading-none">
            {sub}
          </sub>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(<span key={`txt-${key++}`}>{text.slice(lastIndex)}</span>);
    }

    return elements;
  };

  return <span className={className}>{renderFormattedTokens(cleaned)}</span>;
};

export const FormattedLabel: React.FC<{ label: string; className?: string }> = ({
  label,
  className,
}) => {
  return <FormattedMath expression={label} className={className} />;
};
