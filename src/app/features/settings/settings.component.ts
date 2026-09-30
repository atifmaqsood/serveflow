import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PosStore } from '../../core/store/pos.store';
import { ThermalPrintService } from '../../core/services/thermal-print.service';
import { PosSettings } from '../../core/models/pos.models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToggleSwitchModule],
  template: `
    <div class="space-y-4 max-w-4xl">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
          <p class="text-xs text-gray-400">FBR integration, printer setup, and restaurant details</p>
        </div>
        <div class="flex items-center gap-2">
          @if (savedBanner()) {
            <span class="text-xs font-medium text-emerald-600">
              <i class="pi pi-check-circle mr-1"></i>Saved
            </span>
          }
          <p-button label="Test Print" icon="pi pi-print" severity="info" [outlined]="true" size="small" (onClick)="previewSampleReceipt()" />
          <p-button label="Save" icon="pi pi-save" severity="success" size="small" (onClick)="saveAll()" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- FBR Config -->
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <i class="pi pi-verified text-emerald-600"></i>
              <h2 class="font-semibold text-sm text-gray-900 dark:text-white">FBR Tax Integration</h2>
            </div>
            <p-toggleswitch [(ngModel)]="form.fbrEnabled" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1.5">Mode</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="form.fbrMode = 'sandbox'"
                class="p-2.5 rounded-lg border text-left transition cursor-pointer"
                [class]="form.fbrMode === 'sandbox' ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-700'"
              >
                <div class="font-medium text-xs">Sandbox</div>
                <div class="text-[10px] text-gray-400 mt-0.5">Local simulation</div>
              </button>
              <button
                type="button"
                (click)="form.fbrMode = 'live'"
                class="p-2.5 rounded-lg border text-left transition cursor-pointer"
                [class]="form.fbrMode === 'live' ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700'"
              >
                <div class="font-medium text-xs">Live SDC</div>
                <div class="text-[10px] text-gray-400 mt-0.5">FBR IMS endpoint</div>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">POS ID</label>
              <input pInputText type="text" [(ngModel)]="form.fbrPosId" class="w-full text-sm font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">POS Fee (PKR)</label>
              <input pInputText type="number" [(ngModel)]="form.fbrServiceFee" class="w-full text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Cash GST %</label>
              <input pInputText type="number" [(ngModel)]="form.cashTaxRate" class="w-full text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Card GST %</label>
              <input pInputText type="number" [(ngModel)]="form.cardTaxRate" class="w-full text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">SDC Endpoint</label>
            <input pInputText type="text" [(ngModel)]="form.fbrApiUrl" class="w-full text-xs font-mono" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Auth Token</label>
            <input pInputText type="password" [(ngModel)]="form.fbrAuthToken" class="w-full text-xs font-mono" />
          </div>
        </div>

        <div class="space-y-4">
          <!-- Printer Setup -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <i class="pi pi-print text-amber-500"></i>
              <h2 class="font-semibold text-sm text-gray-900 dark:text-white">Printer</h2>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="form.printerPaperWidth = '80mm'"
                class="p-2.5 rounded-lg border text-left transition cursor-pointer"
                [class]="form.printerPaperWidth === '80mm' ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-700'"
              >
                <div class="font-medium text-xs">80mm</div>
                <div class="text-[10px] text-gray-400">Standard</div>
              </button>
              <button
                type="button"
                (click)="form.printerPaperWidth = '58mm'"
                class="p-2.5 rounded-lg border text-left transition cursor-pointer"
                [class]="form.printerPaperWidth === '58mm' ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-700'"
              >
                <div class="font-medium text-xs">58mm</div>
                <div class="text-[10px] text-gray-400">Compact</div>
              </button>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm">Auto-print receipt</span>
                <p-toggleswitch [(ngModel)]="form.autoPrintReceipt" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm">Auto-print KOT</span>
                <p-toggleswitch [(ngModel)]="form.autoPrintKot" />
              </div>
            </div>
          </div>

          <!-- Restaurant Details -->
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
            <h2 class="font-semibold text-sm text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
              Restaurant Details
            </h2>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input pInputText type="text" [(ngModel)]="form.restaurantName" class="w-full text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Branch</label>
                <input pInputText type="text" [(ngModel)]="form.branchName" class="w-full text-sm" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">NTN</label>
                <input pInputText type="text" [(ngModel)]="form.ntnNumber" class="w-full text-sm font-mono" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">STRN</label>
                <input pInputText type="text" [(ngModel)]="form.strnNumber" class="w-full text-sm font-mono" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Address</label>
              <input pInputText type="text" [(ngModel)]="form.address" class="w-full text-sm mb-2" />
              <input pInputText type="text" [(ngModel)]="form.phone" placeholder="Phone" class="w-full text-sm" />
            </div>

            <div class="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span class="text-xs text-gray-400">Reset demo data</span>
              <p-button label="Reset" icon="pi pi-refresh" severity="danger" [outlined]="true" size="small" (onClick)="resetDemo()" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  readonly store = inject(PosStore);
  readonly printService = inject(ThermalPrintService);

  form: PosSettings = { ...this.store.settings() };
  readonly savedBanner = signal(false);

  saveAll(): void {
    this.store.updateSettings(this.form);
    this.savedBanner.set(true);
    setTimeout(() => this.savedBanner.set(false), 3000);
  }

  previewSampleReceipt(): void {
    this.store.updateSettings(this.form);
    const sample = this.store.orders()[0];
    if (sample) {
      this.printService.openPreview(sample, 'both');
    }
  }

  resetDemo(): void {
    this.store.resetDemoData();
    this.form = { ...this.store.settings() };
  }
}
