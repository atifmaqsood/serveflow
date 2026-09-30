import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PosStore } from '../../../core/store/pos.store';
import { ThermalPrintService } from '../../../core/services/thermal-print.service';
import { FbrTaxService } from '../../../core/services/fbr-tax.service';
import { PrintMode } from '../../../core/models/pos.models';

@Component({
  selector: 'app-thermal-ticket',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [visible]="printService.previewDialogVisible()"
      (visibleChange)="!$event && printService.closePreview()"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '32rem', maxWidth: '95vw' }"
      header="Thermal Receipt & KOT Preview"
      styleClass="no-print"
    >
      @if (printService.activeOrder(); as order) {
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg">
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="setMode('receipt')"
                class="px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer"
                [class]="
                  printService.printMode() === 'receipt'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                "
              >
                <i class="pi pi-receipt mr-1"></i> Tax Receipt
              </button>
              <button
                type="button"
                (click)="setMode('kot')"
                class="px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer"
                [class]="
                  printService.printMode() === 'kot'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                "
              >
                <i class="pi pi-print mr-1"></i> Kitchen KOT
              </button>
              <button
                type="button"
                (click)="setMode('both')"
                class="px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer"
                [class]="
                  printService.printMode() === 'both'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                "
              >
                Both Slips
              </button>
            </div>

            <span class="text-xs font-mono px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              Paper: {{ store.settings().printerPaperWidth }}
            </span>
          </div>

          <div class="max-h-[65vh] overflow-y-auto flex flex-col items-center gap-6 py-3 bg-slate-200/70 dark:bg-slate-900/80 rounded-xl p-4">
            @if (printService.printMode() === 'receipt' || printService.printMode() === 'both') {
              <div
                class="bg-white text-black font-mono shadow-md border border-slate-300 p-4"
                [style.width]="store.settings().printerPaperWidth === '58mm' ? '230px' : '310px'"
              >
                <ng-container *ngTemplateOutlet="receiptTpl; context: { $implicit: order }"></ng-container>
              </div>
            }

            @if (printService.printMode() === 'kot' || printService.printMode() === 'both') {
              <div
                class="bg-white text-black font-mono shadow-md border border-slate-300 p-4"
                [style.width]="store.settings().printerPaperWidth === '58mm' ? '230px' : '310px'"
              >
                <ng-container *ngTemplateOutlet="kotTpl; context: { $implicit: order }"></ng-container>
              </div>
            }
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <p-button
              label="Close"
              severity="secondary"
              [outlined]="true"
              (onClick)="printService.closePreview()"
            />
            <p-button
              label="Print Thermal Slip"
              icon="pi pi-print"
              severity="success"
              (onClick)="printService.triggerBrowserPrint()"
            />
          </div>
        </div>
      }
    </p-dialog>

    @if (printService.activeOrder(); as order) {
      <div id="thermal-print-root" class="only-print font-mono text-black bg-white">
        @if (printService.printMode() === 'receipt' || printService.printMode() === 'both') {
          <div
            class="mx-auto p-2"
            [style.width]="store.settings().printerPaperWidth === '58mm' ? '58mm' : '80mm'"
          >
            <ng-container *ngTemplateOutlet="receiptTpl; context: { $implicit: order }"></ng-container>
          </div>
        }
        @if (printService.printMode() === 'both') {
          <div class="my-4 border-t-2 border-dashed border-black"></div>
        }
        @if (printService.printMode() === 'kot' || printService.printMode() === 'both') {
          <div
            class="mx-auto p-2"
            [style.width]="store.settings().printerPaperWidth === '58mm' ? '58mm' : '80mm'"
          >
            <ng-container *ngTemplateOutlet="kotTpl; context: { $implicit: order }"></ng-container>
          </div>
        }
      </div>
    }

    <ng-template #receiptTpl let-order>
      <div class="text-center border-b border-dashed border-black pb-2 mb-2">
        <div class="font-bold text-base uppercase tracking-tight">
          {{ store.settings().restaurantName }}
        </div>
        <div class="text-[11px] leading-tight">{{ store.settings().branchName }}</div>
        <div class="text-[10px] leading-tight text-neutral-700">{{ store.settings().address }}</div>
        <div class="text-[10px] mt-0.5">Tel: {{ store.settings().phone }}</div>
        <div class="text-[10px] font-semibold mt-1">
          NTN: {{ store.settings().ntnNumber }} | STRN: {{ store.settings().strnNumber }}
        </div>
      </div>

      <div class="text-[11px] space-y-0.5 border-b border-dashed border-black pb-2 mb-2">
        <div class="flex justify-between">
          <span>Invoice: <strong>{{ order.orderNumber }}</strong></span>
          <span class="uppercase font-bold px-1 border border-black text-[10px]">
            {{ order.orderType }}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Ref/Table: {{ order.tableOrReference || 'Counter' }}</span>
          <span>KOT: {{ order.kotNumber }}</span>
        </div>
        <div class="flex justify-between">
          <span>Date: {{ order.createdAt | date: 'dd-MMM-yy HH:mm' }}</span>
        </div>
        <div class="flex justify-between">
          <span>Cashier: {{ order.cashierName }}</span>
          <span>Customer: {{ order.customerName || 'Walk-in' }}</span>
        </div>
      </div>

      <table class="w-full text-[11px] border-b border-dashed border-black pb-2 mb-2">
        <thead>
          <tr class="border-b border-black text-left">
            <th class="py-1">Item</th>
            <th class="py-1 text-center">Qty</th>
            <th class="py-1 text-right">Amt</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dotted divide-neutral-400">
          @for (line of order.items; track line.id) {
            <tr>
              <td class="py-1 pr-1 align-top">
                <div class="font-semibold leading-tight">{{ line.menuItem.name }}</div>
                @if (line.menuItem.isCombo && line.menuItem.comboItems?.length) {
                  <div class="text-[9px] text-neutral-700 pl-1">
                    @for (ci of line.menuItem.comboItems; track ci.menuItemId) {
                      <div>+ {{ ci.quantity }}x {{ ci.name }}</div>
                    }
                  </div>
                }
                @if (line.notes) {
                  <div class="text-[9px] italic">* {{ line.notes }}</div>
                }
              </td>
              <td class="py-1 text-center align-top">{{ line.quantity }}</td>
              <td class="py-1 text-right align-top font-semibold">
                {{ line.unitPrice * line.quantity | number: '1.0-0' }}
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="text-[11px] space-y-1 border-b border-dashed border-black pb-2 mb-2">
        <div class="flex justify-between">
          <span>Subtotal:</span>
          <span>Rs. {{ order.subtotal | number: '1.0-0' }}</span>
        </div>
        <div class="flex justify-between">
          <span>GST ({{ order.taxRate }}% {{ order.paymentMethod | uppercase }}):</span>
          <span>Rs. {{ order.taxAmount | number: '1.0-0' }}</span>
        </div>
        @if (order.fbrServiceFee > 0) {
          <div class="flex justify-between">
            <span>FBR POS Service Fee:</span>
            <span>Rs. {{ order.fbrServiceFee | number: '1.0-0' }}</span>
          </div>
        }
        <div class="flex justify-between text-sm font-bold pt-1 border-t border-black">
          <span>GRAND TOTAL:</span>
          <span>Rs. {{ order.grandTotal | number: '1.0-0' }}</span>
        </div>
        <div class="flex justify-between text-[10px] pt-0.5">
          <span>Paid via {{ order.paymentMethod | uppercase }}:</span>
          <span>Rs. {{ order.amountTendered | number: '1.0-0' }}</span>
        </div>
        @if (order.paymentMethod === 'cash') {
          <div class="flex justify-between text-[10px] font-semibold">
            <span>Change Returned:</span>
            <span>Rs. {{ order.changeDue | number: '1.0-0' }}</span>
          </div>
        }
        @if (order.cardRefNumber) {
          <div class="flex justify-between text-[10px]">
            <span>Card Auth Ref:</span>
            <span>{{ order.cardRefNumber }}</span>
          </div>
        }
      </div>

      @if (store.settings().fbrEnabled) {
        <div class="text-center border-b border-dashed border-black pb-2 mb-2">
          <div class="text-[10px] font-bold uppercase tracking-wider">
            FBR Digital Tax Invoice
          </div>
          <div class="text-[10px] font-semibold mt-0.5">
            FBR Inv #: {{ order.fbr.fbrInvoiceNumber }}
          </div>
          <div class="text-[9px]">POS ID: {{ order.fbr.posId }} | PCT: 9801.2000</div>

          <div class="flex justify-center my-2">
            <svg
              viewBox="0 0 23 23"
              class="w-24 h-24 border border-black p-1 bg-white"
              shape-rendering="crispEdges"
            >
              @for (row of qrMatrix(); track $index; let r = $index) {
                @for (cell of row; track $index; let c = $index) {
                  @if (cell) {
                    <rect [attr.x]="c + 1" [attr.y]="r + 1" width="1" height="1" fill="#000000" />
                  }
                }
              }
            </svg>
          </div>
          <div class="text-[9px] leading-tight">
            Verify at verify.fbr.gov.pk or FBR Tax Asaan App
          </div>
        </div>
      }

      <div class="text-center text-[10px] leading-snug">
        {{ store.settings().receiptFooter }}
      </div>
    </ng-template>

    <ng-template #kotTpl let-order>
      <div class="text-center border-b-2 border-black pb-2 mb-2">
        <div class="text-xs font-bold uppercase tracking-widest bg-black text-white py-1">
          KITCHEN ORDER TICKET
        </div>
        <div class="text-lg font-extrabold mt-1">{{ order.kotNumber }}</div>
        <div class="text-xs font-bold uppercase mt-0.5">
          [ {{ order.orderType }} ] — {{ order.tableOrReference || 'Counter' }}
        </div>
        <div class="text-[10px] mt-0.5">
          Order {{ order.orderNumber }} | {{ order.createdAt | date: 'dd-MMM HH:mm:ss' }}
        </div>
      </div>

      <table class="w-full text-xs border-b-2 border-black pb-2 mb-2">
        <thead>
          <tr class="border-b border-black text-left">
            <th class="py-1 w-10">QTY</th>
            <th class="py-1">ITEM / PREPARATION</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dashed divide-black">
          @for (line of order.items; track line.id) {
            <tr>
              <td class="py-1.5 font-extrabold text-sm align-top">{{ line.quantity }}x</td>
              <td class="py-1.5 align-top">
                <div class="font-bold uppercase leading-tight">{{ line.menuItem.name }}</div>
                <div class="text-[10px] uppercase text-neutral-700">
                  Station: {{ line.menuItem.station }}
                </div>
                @if (line.menuItem.isCombo && line.menuItem.comboItems?.length) {
                  <div class="mt-0.5 pl-1 border-l-2 border-black text-[10px] font-semibold">
                    @for (ci of line.menuItem.comboItems; track ci.menuItemId) {
                      <div>• {{ ci.quantity * line.quantity }}x {{ ci.name }}</div>
                    }
                  </div>
                }
                @if (line.notes) {
                  <div class="mt-1 font-bold text-[11px] bg-neutral-200 px-1 py-0.5">
                    NOTE: {{ line.notes }}
                  </div>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="flex justify-between text-[10px] font-semibold">
        <span>Total Items: {{ getTotalOrderItems(order) }}</span>
        <span>By: {{ order.cashierName }}</span>
      </div>
    </ng-template>
  `,
})
export class ThermalTicketComponent {
  readonly store = inject(PosStore);
  readonly printService = inject(ThermalPrintService);
  private readonly fbrService = inject(FbrTaxService);

  readonly qrMatrix = computed(() => {
    const order = this.printService.activeOrder();
    const payload = order?.fbr?.qrPayload || 'https://verify.fbr.gov.pk';
    return this.fbrService.generateQrMatrix(payload);
  });

  setMode(mode: PrintMode): void {
    this.printService.printMode.set(mode);
  }

  getTotalOrderItems(order: { items: Array<{ quantity: number }> }): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
