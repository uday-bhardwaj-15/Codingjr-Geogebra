import { CalculatorShell } from '../../components/shell/CalculatorShell';

export const metadata = {
  title: 'Scientific Calculator - GraphKit',
  description: 'Interactive Scientific Calculator and Function Table',
};

export default function ScientificPage() {
  return <CalculatorShell appId="scientific" />;
}
