import { CalculatorShell } from '../../components/shell/CalculatorShell';

export const metadata = {
  title: 'Geometry - GraphKit',
  description: 'Interactive Geometry Construction Suite',
};

export default function GeometryPage() {
  return <CalculatorShell appId="geometry" />;
}
