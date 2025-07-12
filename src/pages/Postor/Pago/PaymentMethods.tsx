import apiClient from "../../../services/ApiClient";

type PaymentMethod = {
  Id_MP: string;
  Stripe_Mp_Id: string;
  Tarjeta_Marca: string;
  Tarjeta_Ultimos4: string;
  Tarjeta_ExpMes: number;
  Tarjeta_ExpAno: number;
};

type PaymentMethodsProps = {
  methods: PaymentMethod[];
  onRefresh: () => void;
};

const PaymentMethods = ({ methods, onRefresh }: PaymentMethodsProps) => {
  const userId = localStorage.getItem("user_id") || "";

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este método?")) return;
    await apiClient.delete(`/api/pagos/Eliminar_Metodo_Pago/${id}`);
    onRefresh();
  };

  const handlePredeterminado = async (stripeId: string) => {
    await apiClient.put("/api/pagos/establecer-metodo-predeterminado", {
      idUsuario: userId,
      metodoPagoId: stripeId
    });
    localStorage.setItem("default_payment_method", stripeId);
    onRefresh();
  };

  const defaultMethodId = localStorage.getItem("default_payment_method");

  return (
    <div className="space-y-4">
      {methods.length === 0 ? (
        <p className="text-gray-600">No tienes métodos guardados.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {methods.map(m => (
            <div
              key={m.Id_MP}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`/icons/${m.Tarjeta_Marca.toLowerCase()}.svg`}
                  alt={m.Tarjeta_Marca}
                  className="w-10 h-auto object-contain"
                  onError={e => (e.currentTarget.src = "/icons/default.svg")}
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    ****** {m.Tarjeta_Ultimos4}
                    {m.Stripe_Mp_Id === defaultMethodId && (
                      <span className="ml-2 text-sm px-2 py-1 bg-primary-100 text-primary-800 rounded-full">
                        Predeterminado
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePredeterminado(m.Stripe_Mp_Id)}
                  className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Predeterminar
                </button>
                <button
                  onClick={() => handleDelete( m.Id_MP)}
                  className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;