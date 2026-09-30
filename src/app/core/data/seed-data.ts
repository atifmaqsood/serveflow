import { MenuCategory, MenuItem, OrderRecord, PosSettings } from '../models/pos.models';

export const INITIAL_SETTINGS: PosSettings = {
  restaurantName: 'ServeFlow Grill & Cafe',
  branchName: 'Gulberg Main Counter - Lahore',
  ntnNumber: '7482910-4',
  strnNumber: '32-77-8761-012-45',
  phone: '042-35714890 / 0300-8412900',
  address: 'Plot 42-C, MM Alam Road, Gulberg III, Lahore',
  receiptFooter: 'Thank you for dining with us! Verify your FBR Tax Invoice via QR code above.',
  cashTaxRate: 16,
  cardTaxRate: 5,
  fbrServiceFee: 1,
  fbrEnabled: true,
  fbrMode: 'sandbox',
  fbrPosId: '154289',
  fbrApiUrl: 'http://localhost:8524/api/IMSFiscal/GetInvoiceNumberByModel',
  fbrAuthToken: 'fbr-sandbox-token-99412-pk',
  printerPaperWidth: '80mm',
  autoPrintReceipt: false,
  autoPrintKot: false,
  adminPin: '1234',
};

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'cat-combos', name: 'Combo Deals', icon: 'pi pi-sparkles', sortOrder: 1 },
  { id: 'cat-burgers', name: 'Burgers & Wraps', icon: 'pi pi-star', sortOrder: 2 },
  { id: 'cat-bbq', name: 'Karahi & BBQ', icon: 'pi pi-prime', sortOrder: 3 },
  { id: 'cat-rice', name: 'Biryani & Pulao', icon: 'pi pi-box', sortOrder: 4 },
  { id: 'cat-sides', name: 'Sides & Naan', icon: 'pi pi-th-large', sortOrder: 5 },
  { id: 'cat-drinks', name: 'Beverages & Chai', icon: 'pi pi-bolt', sortOrder: 6 },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-zinger',
    categoryId: 'cat-burgers',
    name: 'Mighty Zinger Burger',
    description: 'Double crispy thigh fillet, cheddar slice, jalapenos & signature garlic mayo.',
    price: 680,
    sku: 'BRG-01',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: false,
    badge: 'Bestseller',
  },
  {
    id: 'item-smash',
    categoryId: 'cat-burgers',
    name: 'Double Beef Smash Burger',
    description: 'Two 100g smashed beef patties, caramelized onions, American cheese & smoky sauce.',
    price: 850,
    sku: 'BRG-02',
    pctCode: '9801.2000',
    station: 'grill',
    isAvailable: true,
    isCombo: false,
    badge: 'Chef Special',
  },
  {
    id: 'item-paratha-roll',
    categoryId: 'cat-burgers',
    name: 'Chicken Malai Boti Paratha Roll',
    description: 'Charcoal-grilled malai boti wrapped in flaky lacha paratha with mint chutney.',
    price: 420,
    sku: 'BRG-03',
    pctCode: '9801.2000',
    station: 'grill',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-gyro-wrap',
    categoryId: 'cat-burgers',
    name: 'Crispy Shawarma Platter',
    description: 'Sliced grilled chicken with hummus, garlic toum, pickled chilies & 2 pita breads.',
    price: 590,
    sku: 'BRG-04',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-karahi-half',
    categoryId: 'cat-bbq',
    name: 'Lahori Chicken Karahi (Half)',
    description: 'Freshly wok-cooked organic chicken in tomatoes, ginger, black pepper & green chilies.',
    price: 1350,
    sku: 'BBQ-01',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: false,
    badge: 'Popular',
  },
  {
    id: 'item-mutton-karahi',
    categoryId: 'cat-bbq',
    name: 'Charsi Mutton Karahi (Half)',
    description: 'Tender mutton cooked in traditional Peshawari style with tomatoes and rock salt.',
    price: 2450,
    sku: 'BBQ-02',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-seekh-kabab',
    categoryId: 'cat-bbq',
    name: 'Reshmi Chicken Seekh Kabab (4 Pcs)',
    description: 'Juicy minced chicken skewers infused with fresh coriander, cheese & spices.',
    price: 690,
    sku: 'BBQ-03',
    pctCode: '9801.2000',
    station: 'grill',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-tikka-chest',
    categoryId: 'cat-bbq',
    name: 'Charcoal Chicken Tikka (Chest)',
    description: 'Quarter chicken marinated in tandoori spices, served with tamarind & mint sauce.',
    price: 480,
    sku: 'BBQ-04',
    pctCode: '9801.2000',
    station: 'grill',
    isAvailable: false,
    isCombo: false,
  },
  {
    id: 'item-biryani-single',
    categoryId: 'cat-rice',
    name: 'Special Sindhi Chicken Biryani',
    description: 'Aromatic basmati rice layered with spiced chicken, potato & raita.',
    price: 490,
    sku: 'RIC-01',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: false,
    badge: 'Hot',
  },
  {
    id: 'item-kabuli-pulao',
    categoryId: 'cat-rice',
    name: 'Afghani Beef Kabuli Pulao',
    description: 'Slow-cooked beef shank rice topped with caramelized carrots and black raisins.',
    price: 890,
    sku: 'RIC-02',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-loaded-fries',
    categoryId: 'cat-sides',
    name: 'Masala Loaded Cheese Fries',
    description: 'Crispy skin-on fries topped with jalapeno cheese sauce & crispy chicken chunks.',
    price: 460,
    sku: 'SID-01',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-garlic-naan',
    categoryId: 'cat-sides',
    name: 'Butter Garlic Roghni Naan',
    description: 'Clay-oven baked naan brushed with desi ghee, roasted garlic & sesame seeds.',
    price: 120,
    sku: 'SID-02',
    pctCode: '9801.2000',
    station: 'grill',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-mint-margarita',
    categoryId: 'cat-drinks',
    name: 'Fresh Mint Margarita',
    description: 'Blended garden mint, lime juice, black salt, crushed ice & soda.',
    price: 280,
    sku: 'DRK-01',
    pctCode: '9801.2000',
    station: 'beverage',
    isAvailable: true,
    isCombo: false,
    badge: 'Refreshing',
  },
  {
    id: 'item-karak-chai',
    categoryId: 'cat-drinks',
    name: 'Cardamom Matka Karak Chai',
    description: 'Slow-brewed strong milk tea with crushed green cardamom served in clay matka.',
    price: 180,
    sku: 'DRK-02',
    pctCode: '9801.2000',
    station: 'beverage',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'item-soft-drink',
    categoryId: 'cat-drinks',
    name: 'Chilled Soft Drink (345ml)',
    description: 'Regular Cola / Lemon-Lime / Orange chilled bottle.',
    price: 130,
    sku: 'DRK-03',
    pctCode: '9801.2000',
    station: 'beverage',
    isAvailable: true,
    isCombo: false,
  },
  {
    id: 'combo-solo-crunch',
    categoryId: 'cat-combos',
    name: 'Deal 1: Zinger Crunch Meal',
    description: '1x Mighty Zinger Burger + 1x Masala Loaded Fries + 1x Soft Drink (Save Rs. 180)',
    price: 1090,
    sku: 'CMB-01',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: true,
    badge: 'Save Rs. 180',
    comboItems: [
      { menuItemId: 'item-zinger', name: 'Mighty Zinger Burger', quantity: 1 },
      { menuItemId: 'item-loaded-fries', name: 'Masala Loaded Cheese Fries', quantity: 1 },
      { menuItemId: 'item-soft-drink', name: 'Chilled Soft Drink (345ml)', quantity: 1 },
    ],
  },
  {
    id: 'combo-desi-feast',
    categoryId: 'cat-combos',
    name: 'Deal 2: Desi Karahi & BBQ Platter',
    description: 'Half Chicken Karahi + 4 Pcs Seekh Kabab + 3x Butter Garlic Naan + 2x Mint Margarita',
    price: 2590,
    sku: 'CMB-02',
    pctCode: '9801.2000',
    station: 'kitchen',
    isAvailable: true,
    isCombo: true,
    badge: 'Family Value',
    comboItems: [
      { menuItemId: 'item-karahi-half', name: 'Lahori Chicken Karahi (Half)', quantity: 1 },
      { menuItemId: 'item-seekh-kabab', name: 'Reshmi Chicken Seekh Kabab (4 Pcs)', quantity: 1 },
      { menuItemId: 'item-garlic-naan', name: 'Butter Garlic Roghni Naan', quantity: 3 },
      { menuItemId: 'item-mint-margarita', name: 'Fresh Mint Margarita', quantity: 2 },
    ],
  },
  {
    id: 'combo-roll-chai',
    categoryId: 'cat-combos',
    name: 'Deal 3: Evening Roll & Karak Duo',
    description: '2x Chicken Malai Boti Paratha Rolls + 2x Cardamom Matka Karak Chai',
    price: 1050,
    sku: 'CMB-03',
    pctCode: '9801.2000',
    station: 'grill',
    isAvailable: true,
    isCombo: true,
    badge: 'Tea Time',
    comboItems: [
      { menuItemId: 'item-paratha-roll', name: 'Chicken Malai Boti Paratha Roll', quantity: 2 },
      { menuItemId: 'item-karak-chai', name: 'Cardamom Matka Karak Chai', quantity: 2 },
    ],
  },
];

function hoursAgoIso(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
}

export function createInitialOrders(items: MenuItem[]): OrderRecord[] {
  const byId = (id: string) => items.find((m) => m.id === id) ?? items[0];

  const rawOrders: Array<{
    seq: number;
    hoursAgo: number;
    orderType: 'dine-in' | 'takeaway' | 'delivery';
    tableOrRef: string;
    customerName?: string;
    paymentMethod: 'cash' | 'card';
    lines: Array<{ id: string; qty: number; notes?: string }>;
  }> = [
    {
      seq: 1001,
      hoursAgo: 138,
      orderType: 'dine-in',
      tableOrRef: 'Table 04',
      customerName: 'Bilal Ahmed',
      paymentMethod: 'cash',
      lines: [
        { id: 'combo-desi-feast', qty: 1 },
        { id: 'item-biryani-single', qty: 2 },
      ],
    },
    {
      seq: 1002,
      hoursAgo: 115,
      orderType: 'takeaway',
      tableOrRef: 'Token #12',
      customerName: 'Usman Tariq',
      paymentMethod: 'card',
      lines: [
        { id: 'combo-solo-crunch', qty: 2 },
        { id: 'item-mint-margarita', qty: 2 },
      ],
    },
    {
      seq: 1003,
      hoursAgo: 92,
      orderType: 'delivery',
      tableOrRef: 'DHA Phase 5 - 0321-4455123',
      customerName: 'Ayesha Khan',
      paymentMethod: 'card',
      lines: [
        { id: 'item-smash', qty: 2, notes: 'Extra smoky sauce' },
        { id: 'item-loaded-fries', qty: 2 },
        { id: 'item-soft-drink', qty: 2 },
      ],
    },
    {
      seq: 1004,
      hoursAgo: 68,
      orderType: 'dine-in',
      tableOrRef: 'Table 02',
      customerName: 'Walk-in Guest',
      paymentMethod: 'cash',
      lines: [
        { id: 'item-mutton-karahi', qty: 1, notes: 'Less oil, medium spicy' },
        { id: 'item-garlic-naan', qty: 4 },
        { id: 'item-karak-chai', qty: 3 },
      ],
    },
    {
      seq: 1005,
      hoursAgo: 45,
      orderType: 'takeaway',
      tableOrRef: 'Token #19',
      customerName: 'Hamza Raza',
      paymentMethod: 'cash',
      lines: [
        { id: 'combo-roll-chai', qty: 2 },
        { id: 'item-zinger', qty: 1 },
      ],
    },
    {
      seq: 1006,
      hoursAgo: 26,
      orderType: 'dine-in',
      tableOrRef: 'Table 07',
      customerName: 'Zainab & Family',
      paymentMethod: 'card',
      lines: [
        { id: 'combo-desi-feast', qty: 1 },
        { id: 'item-kabuli-pulao', qty: 2 },
        { id: 'item-mint-margarita', qty: 2 },
      ],
    },
    {
      seq: 1007,
      hoursAgo: 5,
      orderType: 'dine-in',
      tableOrRef: 'Table 01',
      customerName: 'Saad Mahmood',
      paymentMethod: 'cash',
      lines: [
        { id: 'combo-solo-crunch', qty: 1 },
        { id: 'item-smash', qty: 1 },
        { id: 'item-karak-chai', qty: 2 },
      ],
    },
    {
      seq: 1008,
      hoursAgo: 2,
      orderType: 'takeaway',
      tableOrRef: 'Token #24',
      customerName: 'Farhan Ali',
      paymentMethod: 'card',
      lines: [
        { id: 'item-zinger', qty: 3, notes: '1 without jalapenos' },
        { id: 'item-loaded-fries', qty: 2 },
        { id: 'item-mint-margarita', qty: 3 },
      ],
    },
  ];

  return rawOrders
    .map((o, idx): OrderRecord => {
      const createdAt = hoursAgoIso(o.hoursAgo);
      const cartItems = o.lines.map((l, lineIdx) => {
        const menuItem = byId(l.id);
        return {
          id: `line-${o.seq}-${lineIdx}`,
          menuItem,
          quantity: l.qty,
          unitPrice: menuItem.price,
          notes: l.notes,
        };
      });

      const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const taxRate = o.paymentMethod === 'cash' ? 16 : 5;
      const taxAmount = Math.round((subtotal * taxRate) / 100);
      const fbrServiceFee = 1;
      const grandTotal = subtotal + taxAmount + fbrServiceFee;
      const amountTendered =
        o.paymentMethod === 'card' ? grandTotal : Math.ceil(grandTotal / 500) * 500;
      const changeDue = amountTendered - grandTotal;
      const fbrInvoiceNumber = `154289-${createdAt.slice(2, 10).replace(/-/g, '')}${String(idx + 10).padStart(2, '0')}-${String(o.seq).slice(-4)}`;

      return {
        id: `ord-${o.seq}`,
        orderNumber: `#SF-${o.seq}`,
        kotNumber: `KOT-${String(o.seq).slice(-3)}`,
        createdAt,
        orderType: o.orderType,
        tableOrReference: o.tableOrRef,
        customerName: o.customerName,
        items: cartItems,
        subtotal,
        taxRate,
        taxAmount,
        fbrServiceFee,
        grandTotal,
        paymentMethod: o.paymentMethod,
        amountTendered,
        changeDue,
        cardRefNumber: o.paymentMethod === 'card' ? `AUTH-${8820 + idx}` : undefined,
        cashierName: 'Counter Cashier',
        fbr: {
          fbrInvoiceNumber,
          posId: '154289',
          usin: `SF-${o.seq}`,
          dateTime: createdAt,
          taxRate,
          taxAmount,
          fbrFee: fbrServiceFee,
          qrPayload: `https://verify.fbr.gov.pk/pos?inv=${fbrInvoiceNumber}&pos=154289&amt=${grandTotal}`,
          syncStatus: 'simulated',
        },
        status: 'completed',
      };
    })
    .reverse();
}
