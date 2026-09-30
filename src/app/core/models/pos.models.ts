export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'cash' | 'card';
export type UserRole = 'cashier' | 'admin';
export type PaperWidth = '80mm' | '58mm';
export type PrintMode = 'receipt' | 'kot' | 'both';

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface ComboItemRef {
  menuItemId: string;
  name: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  pctCode: string;
  station: 'kitchen' | 'grill' | 'beverage' | 'dessert';
  isAvailable: boolean;
  isCombo: boolean;
  comboItems?: ComboItemRef[];
  badge?: string;
}

export interface CartLineItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface FbrInvoiceData {
  fbrInvoiceNumber: string;
  posId: string;
  usin: string;
  dateTime: string;
  taxRate: number;
  taxAmount: number;
  fbrFee: number;
  qrPayload: string;
  syncStatus: 'verified' | 'simulated' | 'failed';
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  kotNumber: string;
  createdAt: string;
  orderType: OrderType;
  tableOrReference?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  fbrServiceFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  changeDue: number;
  cardRefNumber?: string;
  cashierName: string;
  fbr: FbrInvoiceData;
  status: 'completed' | 'voided';
}

export interface PosSettings {
  restaurantName: string;
  branchName: string;
  ntnNumber: string;
  strnNumber: string;
  phone: string;
  address: string;
  receiptFooter: string;
  cashTaxRate: number;
  cardTaxRate: number;
  fbrServiceFee: number;
  fbrEnabled: boolean;
  fbrMode: 'sandbox' | 'live';
  fbrPosId: string;
  fbrApiUrl: string;
  fbrAuthToken: string;
  printerPaperWidth: PaperWidth;
  autoPrintReceipt: boolean;
  autoPrintKot: boolean;
  adminPin: string;
}
