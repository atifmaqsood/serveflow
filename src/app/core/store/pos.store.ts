import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  CartLineItem,
  MenuCategory,
  MenuItem,
  OrderRecord,
  OrderType,
  PaymentMethod,
  PosSettings,
  UserRole,
} from '../models/pos.models';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_SETTINGS,
  createInitialOrders,
} from '../data/seed-data';
import { FbrTaxService } from '../services/fbr-tax.service';
import { ThermalPrintService } from '../services/thermal-print.service';

const STORAGE_KEYS = {
  categories: 'serveflow_pos_categories_v1',
  menuItems: 'serveflow_pos_menu_items_v1',
  orders: 'serveflow_pos_orders_v1',
  settings: 'serveflow_pos_settings_v1',
};

export interface PosState {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  orders: OrderRecord[];
  settings: PosSettings;
  activeRole: UserRole;
  cashierName: string;
  selectedCategoryId: string;
  searchQuery: string;
  orderType: OrderType;
  tableOrReference: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  cart: CartLineItem[];
  isProcessingCheckout: boolean;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

const initialMenuItems = loadFromStorage<MenuItem[]>(STORAGE_KEYS.menuItems, INITIAL_MENU_ITEMS);
const initialCategories = loadFromStorage<MenuCategory[]>(
  STORAGE_KEYS.categories,
  INITIAL_CATEGORIES
);
const initialSettings = loadFromStorage<PosSettings>(STORAGE_KEYS.settings, INITIAL_SETTINGS);
const initialOrders = loadFromStorage<OrderRecord[]>(
  STORAGE_KEYS.orders,
  createInitialOrders(initialMenuItems)
);

const initialState: PosState = {
  categories: initialCategories,
  menuItems: initialMenuItems,
  orders: initialOrders,
  settings: initialSettings,
  activeRole: 'admin',
  cashierName: 'Atif (Shift Lead)',
  selectedCategoryId: 'all',
  searchQuery: '',
  orderType: 'dine-in',
  tableOrReference: 'Table 05',
  customerName: '',
  customerPhone: '',
  paymentMethod: 'cash',
  cart: [],
  isProcessingCheckout: false,
};

export const PosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const filteredMenuItems = computed(() => {
      const catId = store.selectedCategoryId();
      const q = store.searchQuery().trim().toLowerCase();
      return store.menuItems().filter((item) => {
        const matchesCat =
          catId === 'all' || (catId === 'cat-combos' ? item.isCombo : item.categoryId === catId);
        const matchesQuery =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      });
    });

    const cartItemCount = computed(() =>
      store.cart().reduce((total, line) => total + line.quantity, 0)
    );

    const cartSubtotal = computed(() =>
      store.cart().reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
    );

    const activeTaxRate = computed(() =>
      store.paymentMethod() === 'cash'
        ? store.settings().cashTaxRate
        : store.settings().cardTaxRate
    );

    const cartTaxAmount = computed(() =>
      Math.round((cartSubtotal() * activeTaxRate()) / 100)
    );

    const cartFbrFee = computed(() =>
      store.cart().length > 0 && store.settings().fbrEnabled
        ? store.settings().fbrServiceFee
        : 0
    );

    const cartGrandTotal = computed(
      () => cartSubtotal() + cartTaxAmount() + cartFbrFee()
    );

    const completedOrders = computed(() =>
      store.orders().filter((o) => o.status === 'completed')
    );

    const todaySummary = computed(() => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todays = completedOrders().filter(
        (o) => new Date(o.createdAt).getTime() >= startOfDay
      );
      const revenue = todays.reduce((sum, o) => sum + o.grandTotal, 0);
      const tax = todays.reduce((sum, o) => sum + o.taxAmount, 0);
      return {
        orderCount: todays.length,
        revenue,
        tax,
      };
    });

    const soldOutCount = computed(
      () => store.menuItems().filter((i) => !i.isAvailable).length
    );

    return {
      filteredMenuItems,
      cartItemCount,
      cartSubtotal,
      activeTaxRate,
      cartTaxAmount,
      cartFbrFee,
      cartGrandTotal,
      completedOrders,
      todaySummary,
      soldOutCount,
    };
  }),
  withMethods((store, fbrService = inject(FbrTaxService), printService = inject(ThermalPrintService)) => ({
    setSelectedCategory(categoryId: string): void {
      patchState(store, { selectedCategoryId: categoryId });
    },

    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },

    setOrderType(orderType: OrderType): void {
      const defaultRef =
        orderType === 'dine-in'
          ? 'Table 05'
          : orderType === 'takeaway'
            ? `Token #${Math.floor(10 + Math.random() * 89)}`
            : 'Delivery Order';
      patchState(store, { orderType, tableOrReference: defaultRef });
    },

    setOrderMeta(meta: {
      tableOrReference?: string;
      customerName?: string;
      customerPhone?: string;
    }): void {
      patchState(store, {
        ...(meta.tableOrReference !== undefined ? { tableOrReference: meta.tableOrReference } : {}),
        ...(meta.customerName !== undefined ? { customerName: meta.customerName } : {}),
        ...(meta.customerPhone !== undefined ? { customerPhone: meta.customerPhone } : {}),
      });
    },

    setPaymentMethod(paymentMethod: PaymentMethod): void {
      patchState(store, { paymentMethod });
    },

    switchRole(role: UserRole, cashierName?: string): void {
      patchState(store, {
        activeRole: role,
        ...(cashierName ? { cashierName } : {}),
      });
    },

    addToCart(item: MenuItem): void {
      if (!item.isAvailable) return;
      const current = store.cart();
      const existingIndex = current.findIndex(
        (line) => line.menuItem.id === item.id && !line.notes
      );

      if (existingIndex > -1) {
        const updated = current.map((line, idx) =>
          idx === existingIndex ? { ...line, quantity: line.quantity + 1 } : line
        );
        patchState(store, { cart: updated });
      } else {
        const newLine: CartLineItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          menuItem: item,
          quantity: 1,
          unitPrice: item.price,
        };
        patchState(store, { cart: [...current, newLine] });
      }
    },

    updateCartQuantity(lineId: string, delta: number): void {
      const updated = store
        .cart()
        .map((line) =>
          line.id === lineId ? { ...line, quantity: line.quantity + delta } : line
        )
        .filter((line) => line.quantity > 0);
      patchState(store, { cart: updated });
    },

    updateCartLineNotes(lineId: string, notes: string): void {
      const updated = store
        .cart()
        .map((line) => (line.id === lineId ? { ...line, notes } : line));
      patchState(store, { cart: updated });
    },

    removeFromCart(lineId: string): void {
      patchState(store, {
        cart: store.cart().filter((line) => line.id !== lineId),
      });
    },

    clearCart(): void {
      patchState(store, {
        cart: [],
        customerName: '',
        customerPhone: '',
      });
    },

    toggleItemAvailability(itemId: string): void {
      const updated = store
        .menuItems()
        .map((item) =>
          item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
        );
      patchState(store, { menuItems: updated });
      saveToStorage(STORAGE_KEYS.menuItems, updated);
    },

    saveMenuItem(item: MenuItem): void {
      const exists = store.menuItems().some((i) => i.id === item.id);
      const updated = exists
        ? store.menuItems().map((i) => (i.id === item.id ? item : i))
        : [item, ...store.menuItems()];
      patchState(store, { menuItems: updated });
      saveToStorage(STORAGE_KEYS.menuItems, updated);
    },

    deleteMenuItem(itemId: string): void {
      const updated = store.menuItems().filter((i) => i.id !== itemId);
      patchState(store, { menuItems: updated });
      saveToStorage(STORAGE_KEYS.menuItems, updated);
    },

    updateSettings(partial: Partial<PosSettings>): void {
      const updated = { ...store.settings(), ...partial };
      patchState(store, { settings: updated });
      saveToStorage(STORAGE_KEYS.settings, updated);
    },

    voidOrder(orderId: string): void {
      const updated = store
        .orders()
        .map((o) => (o.id === orderId ? { ...o, status: 'voided' as const } : o));
      patchState(store, { orders: updated });
      saveToStorage(STORAGE_KEYS.orders, updated);
    },

    resetDemoData(): void {
      const freshOrders = createInitialOrders(INITIAL_MENU_ITEMS);
      saveToStorage(STORAGE_KEYS.categories, INITIAL_CATEGORIES);
      saveToStorage(STORAGE_KEYS.menuItems, INITIAL_MENU_ITEMS);
      saveToStorage(STORAGE_KEYS.settings, INITIAL_SETTINGS);
      saveToStorage(STORAGE_KEYS.orders, freshOrders);
      patchState(store, {
        categories: INITIAL_CATEGORIES,
        menuItems: INITIAL_MENU_ITEMS,
        settings: INITIAL_SETTINGS,
        orders: freshOrders,
        cart: [],
      });
    },

    sendKotPreviewOnly(): OrderRecord | null {
      if (store.cart().length === 0) return null;
      const nextNum = 1001 + store.orders().length;
      const draftOrder: OrderRecord = {
        id: `kot-draft-${Date.now()}`,
        orderNumber: `#SF-${nextNum}`,
        kotNumber: `KOT-${String(nextNum).slice(-3)}`,
        createdAt: new Date().toISOString(),
        orderType: store.orderType(),
        tableOrReference: store.tableOrReference() || 'Counter',
        customerName: store.customerName() || 'Walk-in Guest',
        customerPhone: store.customerPhone(),
        items: [...store.cart()],
        subtotal: store.cartSubtotal(),
        taxRate: store.activeTaxRate(),
        taxAmount: store.cartTaxAmount(),
        fbrServiceFee: store.cartFbrFee(),
        grandTotal: store.cartGrandTotal(),
        paymentMethod: store.paymentMethod(),
        amountTendered: store.cartGrandTotal(),
        changeDue: 0,
        cashierName: store.cashierName(),
        fbr: {
          fbrInvoiceNumber: 'PENDING-BILLING',
          posId: store.settings().fbrPosId,
          usin: `SF-${nextNum}`,
          dateTime: new Date().toISOString(),
          taxRate: store.activeTaxRate(),
          taxAmount: store.cartTaxAmount(),
          fbrFee: store.cartFbrFee(),
          qrPayload: 'PENDING',
          syncStatus: 'simulated',
        },
        status: 'completed',
      };
      printService.openPreview(draftOrder, 'kot');
      return draftOrder;
    },

    async completeCheckout(paymentDetails: {
      paymentMethod: PaymentMethod;
      amountTendered: number;
      cardRefNumber?: string;
      printMode?: 'receipt' | 'kot' | 'both';
    }): Promise<OrderRecord | null> {
      if (store.cart().length === 0) return null;
      patchState(store, {
        isProcessingCheckout: true,
        paymentMethod: paymentDetails.paymentMethod,
      });

      const nextSeq = 1001 + store.orders().length;
      const usin = `SF-${nextSeq}`;
      const subtotal = store.cartSubtotal();
      const taxRate =
        paymentDetails.paymentMethod === 'cash'
          ? store.settings().cashTaxRate
          : store.settings().cardTaxRate;
      const taxAmount = Math.round((subtotal * taxRate) / 100);
      const fbrServiceFee = store.settings().fbrEnabled ? store.settings().fbrServiceFee : 0;
      const grandTotal = subtotal + taxAmount + fbrServiceFee;
      const tendered = Math.max(paymentDetails.amountTendered, grandTotal);
      const changeDue = paymentDetails.paymentMethod === 'cash' ? tendered - grandTotal : 0;

      const fbrData = await fbrService.fiscalizeInvoice({
        usin,
        sequenceNumber: nextSeq,
        items: store.cart(),
        subtotal,
        taxRate,
        taxAmount,
        grandTotal,
        paymentMethod: paymentDetails.paymentMethod,
        customerName: store.customerName(),
        customerPhone: store.customerPhone(),
        settings: store.settings(),
      });

      const newOrder: OrderRecord = {
        id: `ord-${Date.now()}`,
        orderNumber: `#SF-${nextSeq}`,
        kotNumber: `KOT-${String(nextSeq).slice(-3)}`,
        createdAt: new Date().toISOString(),
        orderType: store.orderType(),
        tableOrReference: store.tableOrReference() || 'Counter',
        customerName: store.customerName() || 'Walk-in Guest',
        customerPhone: store.customerPhone(),
        items: [...store.cart()],
        subtotal,
        taxRate,
        taxAmount,
        fbrServiceFee,
        grandTotal,
        paymentMethod: paymentDetails.paymentMethod,
        amountTendered: tendered,
        changeDue,
        cardRefNumber: paymentDetails.cardRefNumber,
        cashierName: store.cashierName(),
        fbr: fbrData,
        status: 'completed',
      };

      const updatedOrders = [newOrder, ...store.orders()];
      saveToStorage(STORAGE_KEYS.orders, updatedOrders);

      const nextTokenRef =
        store.orderType() === 'takeaway'
          ? `Token #${Math.floor(10 + Math.random() * 89)}`
          : store.tableOrReference();

      patchState(store, {
        orders: updatedOrders,
        cart: [],
        customerName: '',
        customerPhone: '',
        tableOrReference: nextTokenRef,
        isProcessingCheckout: false,
      });

      const mode =
        paymentDetails.printMode ??
        (store.settings().autoPrintReceipt && store.settings().autoPrintKot
          ? 'both'
          : 'receipt');

      printService.openPreview(newOrder, mode);
      if (store.settings().autoPrintReceipt || store.settings().autoPrintKot) {
        printService.triggerBrowserPrint(newOrder, mode);
      }

      return newOrder;
    },
  })),
  withHooks({
    onInit(store) {
      saveToStorage(STORAGE_KEYS.categories, store.categories());
      saveToStorage(STORAGE_KEYS.menuItems, store.menuItems());
      saveToStorage(STORAGE_KEYS.settings, store.settings());
      saveToStorage(STORAGE_KEYS.orders, store.orders());
    },
  })
);
