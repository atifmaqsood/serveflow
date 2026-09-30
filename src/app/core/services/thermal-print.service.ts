import { Injectable, signal } from '@angular/core';
import { OrderRecord, PrintMode } from '../models/pos.models';

@Injectable({ providedIn: 'root' })
export class ThermalPrintService {
  readonly activeOrder = signal<OrderRecord | null>(null);
  readonly printMode = signal<PrintMode>('receipt');
  readonly previewDialogVisible = signal<boolean>(false);

  openPreview(order: OrderRecord, mode: PrintMode = 'receipt'): void {
    this.activeOrder.set(order);
    this.printMode.set(mode);
    this.previewDialogVisible.set(true);
  }

  closePreview(): void {
    this.previewDialogVisible.set(false);
  }

  triggerBrowserPrint(order?: OrderRecord, mode?: PrintMode): void {
    if (order) {
      this.activeOrder.set(order);
    }
    if (mode) {
      this.printMode.set(mode);
    }
    setTimeout(() => {
      window.print();
    }, 120);
  }
}
