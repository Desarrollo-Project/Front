import { useEffect, useState } from "react";
import PaymentForm from "./PaymentForm";
import PaymentMethods from "./PaymentMethods";
import apiClient from "../../../services/ApiClient";
import AuctionPayment from "./AuctionPayment"

interface PaymentMethod {
  Id_MP: string;
  Stripe_Mp_Id: string;
  Tarjeta_Marca: string;
  Tarjeta_Ultimos4: string;
  Tarjeta_ExpMes: number;
  Tarjeta_ExpAno: number;
}

const PaymentContainer = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const userId = localStorage.getItem("user_id") || "";
  const defaultMethodId = localStorage.getItem("default_payment_method") || "";

  const fetchMethods = async () => {
    try {
      const response = await apiClient.get(`/api/pagos/Consultar_Metodos_Pagos_Usuario/${userId}`);
      const mapped = Array.isArray(response)
        ? response.map((m: any) => ({
            Id_MP: m.id_MP,
            Stripe_Mp_Id: m.stripe_Mp_Id.valor,
            Tarjeta_Marca: m.tarjeta_Info.brand,
            Tarjeta_Ultimos4: m.tarjeta_Info.last4,
            Tarjeta_ExpMes: m.tarjeta_Info.expMonth,
            Tarjeta_ExpAno: m.tarjeta_Info.expYear,
          }))
        : [];
      setMethods(mapped);
    } catch (err) {
      console.error("Error al cargar métodos:", err);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  return (
    <div className="space-y-8">
      <PaymentForm onAdded={fetchMethods} />
      <PaymentMethods methods={methods} onRefresh={fetchMethods} />
      <AuctionPayment methods={methods} defaultMethodId={defaultMethodId} />
    </div>
  );
};

export default PaymentContainer;