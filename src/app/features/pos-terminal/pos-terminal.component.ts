import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { PosStore } from '../../core/store/pos.store';
import { CartLineItem, MenuItem, OrderType, PaymentMethod } from '../../core/models/pos.models';

@Component({
  selector: 'app-pos-terminal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    BadgeModule,
  ],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      <!-- LEFT: Menu Catalog (8 cols) -->
      <div class="lg:col-span-8 flex flex-col gap-3">
        <!-- Top Bar: Order Mode + Quick Table/Token + Search -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-3.5 border border-gray-200/80 dark:border-gray-800 shadow-2xs space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <!-- Segmented Order Type Switcher -->
            <div class="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
              @for (type of orderTypes; track type.value) {
                <button
                  type="button"
                  (click)="store.setOrderType(type.value)"
                  class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  [class]="
                    store.orderType() === type.value
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  "
                >
                  <i [class]="type.icon + ' text-xs'"></i>
                  <span>{{ type.label }}</span>
                </button>
              }
            </div>

            <!-- Quick Table Pills (Dine-In) or Reference Input -->
            <div class="flex flex-wrap items-center gap-1.5 flex-1 justify-end">
              @if (store.orderType() === 'dine-in') {
                <div class="hidden xl:flex items-center gap-1 mr-1">
                  @for (tbl of quickTables; track tbl) {
                    <button
                      type="button"
                      (click)="store.setOrderMeta({ tableOrReference: tbl })"
                      class="px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      [class]="
                        store.tableOrReference() === tbl
                          ? 'bg-gray-900 text-white dark:bg-emerald-500 dark:text-gray-950'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      "
                    >
                      {{ tbl.replace('Table ', 'T') }}
                    </button>
                  }
                </div>
              }

              <input
                pInputText
                type="text"
                [ngModel]="store.tableOrReference()"
                (ngModelChange)="store.setOrderMeta({ tableOrReference: $event })"
                [placeholder]="
                  store.orderType() === 'dine-in'
                    ? 'Table #'
                    : store.orderType() === 'takeaway'
                      ? 'Token #'
                      : 'Delivery Rider / Area'
                "
                class="text-xs py-1.5 px-2.5 w-28 sm:w-32 rounded-lg"
              />
              <input
                pInputText
                type="text"
                [ngModel]="store.customerName()"
                (ngModelChange)="store.setOrderMeta({ customerName: $event })"
                placeholder="Guest name (optional)"
                class="text-xs py-1.5 px-2.5 w-36 sm:w-44 rounded-lg"
              />
            </div>
          </div>

          <!-- Search + Category Filter Pills -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div class="relative sm:w-64 shrink-0">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                pInputText
                type="text"
                [ngModel]="store.searchQuery()"
                (ngModelChange)="store.setSearchQuery($event)"
                placeholder="Quick search dish or code..."
                class="pl-8 pr-7 py-1.5 w-full text-xs rounded-xl"
              />
              @if (store.searchQuery()) {
                <button
                  type="button"
                  (click)="store.setSearchQuery('')"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i class="pi pi-times text-xs"></i>
                </button>
              }
            </div>

            <!-- Category Pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1">
              <button
                type="button"
                (click)="store.setSelectedCategory('all')"
                class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer"
                [class]="
                  store.selectedCategoryId() === 'all'
                    ? 'bg-gray-900 text-white dark:bg-emerald-500 dark:text-gray-950 shadow-2xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                "
              >
                All ({{ store.menuItems().length }})
              </button>
              @for (cat of store.categories(); track cat.id) {
                <button
                  type="button"
                  (click)="store.setSelectedCategory(cat.id)"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
                  [class]="
                    store.selectedCategoryId() === cat.id
                      ? 'bg-gray-900 text-white dark:bg-emerald-500 dark:text-gray-950 shadow-2xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  "
                >
                  <i [class]="cat.icon + ' text-[11px]'"></i>
                  <span>{{ cat.name }}</span>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Clean Touch Menu Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          @for (item of store.filteredMenuItems(); track item.id) {
            <div
              (click)="onSelectMenuItem(item)"
              class="group relative rounded-2xl border p-3.5 text-left transition-all select-none flex flex-col justify-between min-h-[124px]"
              [class]="
                !item.isAvailable
                  ? 'bg-gray-100/60 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed'
                  : getItemCartQty(item.id) > 0
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/30 shadow-xs cursor-pointer active:scale-[0.98]'
                    : 'bg-white dark:bg-gray-900 border-gray-200/90 dark:border-gray-800 hover:border-emerald-400 hover:shadow-sm cursor-pointer active:scale-[0.98]'
              "
            >
              <!-- Top Badges -->
              <div>
                <div class="flex items-center justify-between gap-1 mb-1.5">
                  <div class="flex items-center gap-1">
                    @if (item.isCombo) {
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Combo
                      </span>
                    } @else {
                      <span class="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                        {{ item.sku }}
                      </span>
                    }
                    @if (item.badge && item.isAvailable) {
                      <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {{ item.badge }}
                      </span>
                    }
                  </div>

                  @if (!item.isAvailable) {
                    <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                      86'd
                    </span>
                  } @else if (getItemCartQty(item.id) > 0) {
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                      {{ getItemCartQty(item.id) }} in bill
                    </span>
                  }
                </div>

                <!-- Dish Name -->
                <h3 class="font-bold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2">
                  {{ item.name }}
                </h3>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                  {{ item.description }}
                </p>
              </div>

              <!-- Price Row -->
              <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <span class="text-sm font-extrabold text-gray-900 dark:text-white">
                  Rs. {{ item.price | number: '1.0-0' }}
                </span>
                <span class="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-600 group-hover:text-white text-gray-500 flex items-center justify-center transition">
                  <i class="pi pi-plus text-[10px]"></i>
                </span>
              </div>
            </div>
          } @empty {
            <div class="col-span-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
              <i class="pi pi-search text-2xl text-gray-300 mb-2"></i>
              <p class="text-sm font-semibold text-gray-600 dark:text-gray-300">No dishes match your filter</p>
              <button
                type="button"
                (click)="store.setSearchQuery(''); store.setSelectedCategory('all')"
                class="mt-2 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          }
        </div>
      </div>

      <!-- RIGHT: Live Order & Fast Checkout (4 cols) -->
      <div class="lg:col-span-4">
        <div class="sticky top-4 bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl shadow-xs flex flex-col max-h-[calc(100vh-5rem)]">
          <!-- Bill Header -->
          <div class="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                {{ store.cartItemCount() }}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <h2 class="font-bold text-sm text-gray-900 dark:text-white">Current Bill</h2>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {{ store.orderType() }}
                  </span>
                </div>
                <p class="text-[11px] text-gray-400">
                  {{ store.tableOrReference() || 'Counter' }}
                  @if (store.customerName()) {
                    <span>· {{ store.customerName() }}</span>
                  }
                </p>
              </div>
            </div>

            @if (store.cart().length > 0) {
              <button
                type="button"
                (click)="store.clearCart()"
                class="text-xs font-medium text-red-500 hover:text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition"
              >
                Clear
              </button>
            }
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto custom-scroll p-3.5 divide-y divide-gray-100 dark:divide-gray-800/70">
            @for (line of store.cart(); track line.id) {
              <div class="py-2.5 first:pt-0 last:pb-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {{ line.menuItem.name }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                      <span>Rs. {{ line.unitPrice | number: '1.0-0' }}</span>
                      <button
                        type="button"
                        (click)="toggleNoteInput(line.id)"
                        class="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {{ line.notes ? 'Edit note' : '+ Note' }}
                      </button>
                    </div>
                  </div>

                  <!-- Stepper -->
                  <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      (click)="store.updateCartQuantity(line.id, -1)"
                      class="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition"
                    >
                      <i class="pi pi-minus text-[9px]"></i>
                    </button>
                    <span class="text-xs font-bold w-6 text-center">{{ line.quantity }}</span>
                    <button
                      type="button"
                      (click)="store.updateCartQuantity(line.id, 1)"
                      class="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition"
                    >
                      <i class="pi pi-plus text-[9px]"></i>
                    </button>
                  </div>

                  <div class="text-sm font-bold text-gray-900 dark:text-white w-16 text-right shrink-0">
                    {{ line.unitPrice * line.quantity | number: '1.0-0' }}
                  </div>
                </div>

                @if (line.notes && activeNoteLineId() !== line.id) {
                  <div class="mt-1 text-[11px] text-amber-600 dark:text-amber-400 italic">
                    Note: {{ line.notes }}
                  </div>
                }

                @if (activeNoteLineId() === line.id) {
                  <div class="mt-2 space-y-1.5">
                    <div class="flex flex-wrap gap-1">
                      @for (preset of quickNotePresets; track preset) {
                        <button
                          type="button"
                          (click)="applyQuickNote(line, preset)"
                          class="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-gray-600 dark:text-gray-300 cursor-pointer"
                        >
                          {{ preset }}
                        </button>
                      }
                    </div>
                    <input
                      type="text"
                      [ngModel]="line.notes || ''"
                      (ngModelChange)="store.updateCartLineNotes(line.id, $event)"
                      (keyup.enter)="activeNoteLineId.set(null)"
                      placeholder="Kitchen note (e.g. spicy, no mayo)..."
                      class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                }
              </div>
            } @empty {
              <div class="py-12 text-center">
                <div class="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2.5 text-gray-400">
                  <i class="pi pi-shopping-bag text-lg"></i>
                </div>
                <p class="text-sm font-semibold text-gray-600 dark:text-gray-300">No items added yet</p>
                <p class="text-xs text-gray-400 mt-0.5">Tap any dish on the left to build the bill</p>
              </div>
            }
          </div>

          <!-- Totals & Checkout Footer -->
          <div class="p-3.5 bg-gray-50/80 dark:bg-gray-950/60 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl space-y-3">
            <!-- Cash / Card Toggle -->
            <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-gray-200/70 dark:bg-gray-800">
              <button
                type="button"
                (click)="store.setPaymentMethod('cash')"
                class="py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                [class]="
                  store.paymentMethod() === 'cash'
                    ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400'
                "
              >
                <i class="pi pi-money-bill text-xs"></i>
                <span>Cash ({{ store.settings().cashTaxRate }}%)</span>
              </button>
              <button
                type="button"
                (click)="store.setPaymentMethod('card')"
                class="py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                [class]="
                  store.paymentMethod() === 'card'
                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400'
                "
              >
                <i class="pi pi-credit-card text-xs"></i>
                <span>Card ({{ store.settings().cardTaxRate }}%)</span>
              </button>
            </div>

            <!-- Compact Breakdown -->
            <div class="space-y-1 text-xs">
              <div class="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>Rs. {{ store.cartSubtotal() | number: '1.0-0' }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>GST ({{ store.activeTaxRate() }}%) + FBR Fee</span>
                <span>Rs. {{ store.cartTaxAmount() + store.cartFbrFee() | number: '1.0-0' }}</span>
              </div>
              <div class="flex justify-between items-baseline text-base font-extrabold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-800">
                <span>Total Payable</span>
                <span class="text-lg text-emerald-600 dark:text-emerald-400">
                  Rs. {{ store.cartGrandTotal() | number: '1.0-0' }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-12 gap-1.5">
              <button
                type="button"
                [disabled]="store.cart().length === 0"
                (click)="store.sendKotPreviewOnly()"
                title="Print Kitchen Order Ticket only"
                class="col-span-3 py-2.5 rounded-xl font-semibold text-xs border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 disabled:opacity-35 cursor-pointer transition flex items-center justify-center gap-1"
              >
                <i class="pi pi-print text-xs"></i>
                <span>KOT</span>
              </button>

              <button
                type="button"
                [disabled]="store.cart().length === 0 || store.isProcessingCheckout()"
                (click)="quickExactCheckout()"
                title="Instant 1-Click Exact Bill & Receipt"
                class="col-span-4 py-2.5 rounded-xl font-semibold text-xs border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 disabled:opacity-35 cursor-pointer transition flex items-center justify-center gap-1"
              >
                <i class="pi pi-bolt text-xs"></i>
                <span>Quick Bill</span>
              </button>

              <button
                type="button"
                [disabled]="store.cart().length === 0"
                (click)="openCheckoutModal()"
                class="col-span-5 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-35 cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <span>Pay Rs. {{ store.cartGrandTotal() | number: '1.0-0' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clean Payment & Change Calculator Modal -->
    <p-dialog
      [(visible)]="checkoutModalVisible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '26rem', maxWidth: '95vw' }"
      header="Collect Payment"
    >
      <div class="space-y-4">
        <!-- Total Payable Hero -->
        <div class="p-4 rounded-2xl bg-gray-900 text-white flex items-center justify-between">
          <div>
            <div class="text-[11px] text-gray-400 uppercase tracking-wider">Amount Due</div>
            <div class="text-2xl font-extrabold text-emerald-400 mt-0.5">
              Rs. {{ store.cartGrandTotal() | number: '1.0-0' }}
            </div>
          </div>
          <div class="text-right text-xs text-gray-300">
            <div class="font-semibold uppercase text-emerald-300">{{ store.orderType() }}</div>
            <div>{{ store.tableOrReference() }}</div>
          </div>
        </div>

        <!-- Method Switcher -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            (click)="selectModalPaymentMethod('cash')"
            class="p-3 rounded-xl border-2 text-center transition cursor-pointer"
            [class]="
              store.paymentMethod() === 'cash'
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                : 'border-gray-200 dark:border-gray-700'
            "
          >
            <i class="pi pi-money-bill text-lg text-emerald-600"></i>
            <div class="font-bold text-sm mt-0.5">Cash</div>
            <div class="text-[10px] text-gray-400">{{ store.settings().cashTaxRate }}% GST</div>
          </button>
          <button
            type="button"
            (click)="selectModalPaymentMethod('card')"
            class="p-3 rounded-xl border-2 text-center transition cursor-pointer"
            [class]="
              store.paymentMethod() === 'card'
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30'
                : 'border-gray-200 dark:border-gray-700'
            "
          >
            <i class="pi pi-credit-card text-lg text-indigo-600"></i>
            <div class="font-bold text-sm mt-0.5">Card</div>
            <div class="text-[10px] text-gray-400">{{ store.settings().cardTaxRate }}% GST</div>
          </button>
        </div>

        @if (store.paymentMethod() === 'cash') {
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Cash Received (PKR)</label>
            <input
              pInputText
              type="number"
              [(ngModel)]="tenderedAmount"
              class="w-full text-lg font-bold py-2 rounded-xl"
            />
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                (click)="tenderedAmount.set(store.cartGrandTotal())"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 cursor-pointer transition"
              >
                Exact
              </button>
              @for (note of quickCashNotes; track note) {
                @if (note >= store.cartGrandTotal()) {
                  <button
                    type="button"
                    (click)="tenderedAmount.set(note)"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 cursor-pointer transition"
                  >
                    Rs. {{ note | number: '1.0-0' }}
                  </button>
                }
              }
            </div>

            <div
              class="mt-3 p-3 rounded-xl flex items-center justify-between"
              [class]="
                changeDue() >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
              "
            >
              <span class="text-xs font-semibold">
                {{ changeDue() >= 0 ? 'Change to Return' : 'Balance Remaining' }}
              </span>
              <span class="text-lg font-extrabold">
                Rs. {{ Math.abs(changeDue()) | number: '1.0-0' }}
              </span>
            </div>
          </div>
        } @else {
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">Card Approval Ref (Optional)</label>
            <input
              pInputText
              type="text"
              [(ngModel)]="cardRefNumber"
              placeholder="RRN / Last 4 digits"
              class="w-full text-sm py-2 rounded-xl"
            />
          </div>
        }

        <div class="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            class="flex-1"
            (onClick)="checkoutModalVisible.set(false)"
          />
          <p-button
            label="Complete & Print"
            icon="pi pi-check"
            severity="success"
            class="flex-1"
            [disabled]="store.paymentMethod() === 'cash' && tenderedAmount() < store.cartGrandTotal()"
            [loading]="store.isProcessingCheckout()"
            (onClick)="confirmPayment('both')"
          />
        </div>
      </div>
    </p-dialog>
  `,
})
export class PosTerminalComponent {
  readonly store = inject(PosStore);
  readonly Math = Math;

  readonly orderTypes: Array<{ label: string; value: OrderType; icon: string }> = [
    { label: 'Dine-In', value: 'dine-in', icon: 'pi pi-shop' },
    { label: 'Takeaway', value: 'takeaway', icon: 'pi pi-shopping-bag' },
    { label: 'Delivery', value: 'delivery', icon: 'pi pi-truck' },
  ];

  readonly quickTables = ['Table 01', 'Table 02', 'Table 03', 'Table 04', 'Table 05', 'Table 06'];
  readonly quickNotePresets = ['Spicy', 'No Mayo', 'Extra Sauce', 'Less Ice', 'Well Done'];
  readonly quickCashNotes = [500, 1000, 1500, 2000, 3000, 5000, 10000];

  readonly activeNoteLineId = signal<string | null>(null);
  readonly checkoutModalVisible = signal(false);
  readonly tenderedAmount = signal(0);
  readonly cardRefNumber = signal('');

  readonly changeDue = computed(() => this.tenderedAmount() - this.store.cartGrandTotal());

  onSelectMenuItem(item: MenuItem): void {
    if (!item.isAvailable) return;
    this.store.addToCart(item);
  }

  getItemCartQty(menuItemId: string): number {
    return this.store
      .cart()
      .filter((line: CartLineItem) => line.menuItem.id === menuItemId)
      .reduce((sum: number, line: CartLineItem) => sum + line.quantity, 0);
  }

  toggleNoteInput(lineId: string): void {
    this.activeNoteLineId.set(this.activeNoteLineId() === lineId ? null : lineId);
  }

  applyQuickNote(line: CartLineItem, preset: string): void {
    const current = line.notes ? `${line.notes}, ${preset}` : preset;
    this.store.updateCartLineNotes(line.id, current);
  }

  openCheckoutModal(): void {
    this.tenderedAmount.set(this.store.cartGrandTotal());
    this.cardRefNumber.set('');
    this.checkoutModalVisible.set(true);
  }

  async quickExactCheckout(): Promise<void> {
    await this.store.completeCheckout({
      paymentMethod: this.store.paymentMethod(),
      amountTendered: this.store.cartGrandTotal(),
      printMode: 'both',
    });
  }

  selectModalPaymentMethod(method: PaymentMethod): void {
    this.store.setPaymentMethod(method);
    setTimeout(() => {
      this.tenderedAmount.set(this.store.cartGrandTotal());
    });
  }

  async confirmPayment(printMode: 'receipt' | 'kot' | 'both'): Promise<void> {
    await this.store.completeCheckout({
      paymentMethod: this.store.paymentMethod(),
      amountTendered:
        this.store.paymentMethod() === 'cash'
          ? this.tenderedAmount()
          : this.store.cartGrandTotal(),
      cardRefNumber: this.cardRefNumber() || undefined,
      printMode,
    });
    this.checkoutModalVisible.set(false);
  }
}
