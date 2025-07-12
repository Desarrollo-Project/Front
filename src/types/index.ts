export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  userType: 'bidder' | 'auctioneer' | 'admin' | 'support';
  verificado: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


// Integrar


export interface Auction {
  id: string;
  name: string;
  productName: string;
  productImage: string;
  basePrice: number;
  currentPrice: number; // This field is not directly from your API, we will calculate or initialize it.
  status: string; // "active", "inactive", "completed"
  minIncrement: number;
  endTime: Date; // This will be start_date + auction duration, or simply the end date if your API provides it.
  description: string; // If your API does not provide it, you can set a default value or make it optional.
}

export interface ApiAuction {
  id: string;
  id_Dueño_Subasta: string;
  id_Producto_Asociado: string;
  nombre_Subasta: string;
  estado: string;
  precio_Inicial: number;
  incremento_Minimo: number;
  fecha_Inicio: string; // Comes as a string from the API
  nombre_Producto: string;
  url_Producto: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  amount: number;
  bidder: string;
  timestamp: Date;
  type: 'manual' | 'automatic';
}

export interface AutoBidConfig {
  maxAmount: number;
  increment: number;
  isActive: boolean;
}