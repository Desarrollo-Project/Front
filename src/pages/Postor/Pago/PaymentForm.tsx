import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import apiClient from "../../../services/ApiClient";


type PaymentFormProps = {
  onAdded: () => void;
};

const PaymentForm = ({ onAdded }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const userId = localStorage.getItem("user_id") || "";
  const email = localStorage.getItem("email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { email }
    });

    if (error) return console.error(error);

    await apiClient.post("/api/pagos/Agregar_Metodo_Pago", {
      paymentMethodId: paymentMethod.id,
      id_Usuario: userId,
      correoElectronico: email
    });

    alert("Método agregado");
    onAdded();
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Datos de Tarjeta</label>
      <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="submit"
        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
      >
        Guardar Método
      </button>
    </form>
  );
};

export default PaymentForm;