import { CalculatorShell } from '../../components/shell/CalculatorShell';

export const metadata = {
  title: 'Probability Calculator - GraphKit',
  description: 'Interactive Probability Distribution Calculator',
};

export default function ProbabilityPage() {
  return <CalculatorShell appId="probability" />;
}
