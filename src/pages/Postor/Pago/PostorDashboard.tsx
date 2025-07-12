// src/pages/Postor/Pago/PostorDashboard.tsx
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../lib/stripe';
import TransactionHistory from './TransactionHistory';
import PaymentContainer from './PaymentContainer';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';

const PostorDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Gestión de Pagos
        </h1>

<Card className="animate-fade-in">
  <CardHeader>
    <h2 className="text-xl font-semibold text-gray-900">Tus Métodos de Pago</h2>
  </CardHeader>
  <CardBody>
    <Elements stripe={stripePromise}>
      <PaymentContainer />
    </Elements>
  </CardBody>
</Card>

        {/* Historial de Transacciones */}
        <Card className="animate-fade-in delay-150">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Historial de Transacciones</h2>
          </CardHeader>
          <CardBody>
            <TransactionHistory />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PostorDashboard;