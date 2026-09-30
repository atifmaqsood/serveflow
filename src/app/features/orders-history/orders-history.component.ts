import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PosStore } from '../../core/store/pos.store';
import { ThermalPrintService } from '../../core/services/thermal-print.service';
import { OrderRecord } from '../../core/models/pos.models';

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">Orders & FBR Log</h1>
          <p class="text-xs text-gray-400">{{ store.orders().length }} invoices · POS {{ store.settings().fbrPosId }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          @for (f of paymentFilters; track f.value) {
            <button
              type="button"
              (click)="paymentFilter.set(f.value)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
              [class]="
                paymentFilter() === f.value
                  ? 'bg-gray-900 text-white dark:bg-emerald-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              "
            >
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <!-- Search -->
      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input
          pInputText
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search order #, FBR invoice, customer..."
          class="pl-8 py-2 text-sm w-full max-w-md rounded-lg"
        />
      </div>

      <!-- Orders Table -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-800/60 text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th class="py-3 px-4 text-left">Order</th>
                <th class="py-3 px-4 text-left">Type</th>
                <th class="py-3 px-4 text-left">Items</th>
                <th class="py-3 px-4 text-left">FBR Invoice</th>
                <th class="py-3 px-4 text-left">Payment</th>
                <th class="py-3 px-4 text-right">Total</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
              @for (order of filteredOrders(); track order.id) {
                <tr
                  class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                  [class.opacity-40]="order.status === 'voided'"
                >
                  <td class="py-3 px-4">
                    <div class="font-semibold text-gray-900 dark:text-white">{{ order.orderNumber }}</div>
                    <div class="text-xs text-gray-400">{{ order.createdAt | date: 'dd MMM, hh:mm a' }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      class="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full"
                      [class]="
                        order.orderType === 'dine-in'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : order.orderType === 'takeaway'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400'
                      "
                    >
                      {{ order.orderType }}
                    </span>
                    <div class="text-xs text-gray-400 mt-0.5">{{ order.tableOrReference }}</div>
                  </td>
                  <td class="py-3 px-4 max-w-[200px]">
                    <div class="text-xs text-gray-600 dark:text-gray-300 truncate">{{ formatItemsSummary(order) }}</div>
                    <div class="text-[10px] text-gray-400">{{ getTotalItems(order) }} items</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ order.fbr.fbrInvoiceNumber }}</div>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        [class]="
                          order.fbr.syncStatus === 'verified' ? 'bg-emerald-500'
                            : order.fbr.syncStatus === 'simulated' ? 'bg-sky-500'
                            : 'bg-amber-500'
                        "
                      ></span>
                      <span class="text-[10px] text-gray-400 capitalize">{{ order.fbr.syncStatus }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      class="text-xs font-medium uppercase px-2 py-0.5 rounded"
                      [class]="order.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'"
                    >
                      {{ order.paymentMethod }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="font-bold text-gray-900 dark:text-white">Rs. {{ order.grandTotal | number: '1.0-0' }}</div>
                    <div class="text-[10px] text-gray-400">Tax: Rs. {{ order.taxAmount | number: '1.0-0' }}</div>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="inline-flex items-center gap-1">
                      <button
                        type="button"
                        (click)="printService.openPreview(order, 'receipt')"
                        class="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                        title="Receipt"
                      >
                        <i class="pi pi-receipt text-xs"></i>
                      </button>
                      <button
                        type="button"
                        (click)="printService.openPreview(order, 'kot')"
                        class="p-1.5 rounded text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
                        title="KOT"
                      >
                        <i class="pi pi-print text-xs"></i>
                      </button>
                      @if (store.activeRole() === 'admin' && order.status === 'completed') {
                        <button
                          type="button"
                          (click)="store.voidOrder(order.id)"
                          class="p-1.5 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                          title="Void"
                        >
                          <i class="pi pi-ban text-xs"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class OrdersHistoryComponent {
  readonly store = inject(PosStore);
  readonly printService = inject(ThermalPrintService);

  readonly paymentFilter = signal<'all' | 'cash' | 'card'>('all');
  readonly searchQuery = signal<string>('');

  readonly paymentFilters: Array<{ label: string; value: 'all' | 'cash' | 'card' }> = [
    { label: 'All', value: 'all' },
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
  ];

  readonly filteredOrders = computed(() => {
    const pf = this.paymentFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.store.orders().filter((o) => {
      const matchPay = pf === 'all' || o.paymentMethod === pf;
      const matchQ =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.fbr.fbrInvoiceNumber.toLowerCase().includes(q) ||
        (o.customerName ?? '').toLowerCase().includes(q) ||
        (o.tableOrReference ?? '').toLowerCase().includes(q);
      return matchPay && matchQ;
    });
  });

  formatItemsSummary(order: OrderRecord): string {
    return order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ');
  }

  getTotalItems(order: OrderRecord): number {
    return order.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}
