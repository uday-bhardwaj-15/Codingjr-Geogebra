import { CalculatorShell } from '../../components/shell/CalculatorShell';

export const metadata = {
  title: '3D Calculator - GraphKit',
  description: 'Interactive 3D Geometry and Solid Modeling Calculator',
};

export default function ThreeDPage() {
  return <CalculatorShell appId="3d" />;
}
