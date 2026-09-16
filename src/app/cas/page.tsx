import { CalculatorShell } from '../../components/shell/CalculatorShell';

export const metadata = {
  title: 'CAS Calculator - GraphKit',
  description: 'Interactive Computer Algebra System and Symbolic Math',
};

export default function CasPage() {
  return <CalculatorShell appId="cas" />;
}
