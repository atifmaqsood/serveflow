import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { PosStore } from '../../core/store/pos.store';
import { ComboItemRef, MenuItem } from '../../core/models/pos.models';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToggleSwitchModule,
    TagModule,
  ],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">Menu Management</h1>
          <p class="text-xs text-gray-400">{{ store.menuItems().length }} items · {{ store.soldOutCount() }} sold out</p>
        </div>
        <div class="flex items-center gap-2">
          <p-button label="New Item" icon="pi pi-plus" severity="success" size="small" (onClick)="openItemDialog(false)" />
          <p-button label="New Combo" icon="pi pi-sparkles" severity="help" size="small" (onClick)="openItemDialog(true)" />
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            (click)="categoryFilter.set('all')"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap"
            [class]="categoryFilter() === 'all' ? 'bg-gray-900 text-white dark:bg-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'"
          >
            All ({{ store.menuItems().length }})
          </button>
          @for (cat of store.categories(); track cat.id) {
            <button
              type="button"
              (click)="categoryFilter.set(cat.id)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap"
              [class]="categoryFilter() === cat.id ? 'bg-gray-900 text-white dark:bg-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'"
            >
              {{ cat.name }}
            </button>
          }
        </div>

        <div class="relative min-w-[200px]">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input
            pInputText
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Search..."
            class="pl-8 py-1.5 text-xs w-full rounded-lg"
          />
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-800/60 text-gray-400 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th class="py-3 px-4 text-left">Item</th>
              <th class="py-3 px-4 text-left">Category</th>
              <th class="py-3 px-4 text-left">Price</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
            @for (item of filteredItems(); track item.id) {
              <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</span>
                    @if (item.isCombo) {
                      <span class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Combo</span>
                    }
                  </div>
                  <div class="text-xs text-gray-400 mt-0.5">{{ item.sku }} · {{ item.description }}</div>
                </td>
                <td class="py-3 px-4 text-xs text-gray-500">{{ getCategoryName(item.categoryId) }}</td>
                <td class="py-3 px-4 font-bold text-gray-900 dark:text-white">Rs. {{ item.price | number: '1.0-0' }}</td>
                <td class="py-3 px-4 text-center">
                  <div class="inline-flex items-center gap-2">
                    <p-toggleswitch
                      [ngModel]="item.isAvailable"
                      (ngModelChange)="store.toggleItemAvailability(item.id)"
                    />
                    <span class="text-xs font-medium" [class]="item.isAvailable ? 'text-emerald-600' : 'text-red-500'">
                      {{ item.isAvailable ? 'In Stock' : 'Sold Out' }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    type="button"
                    (click)="editItem(item)"
                    class="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <i class="pi pi-pencil text-xs"></i>
                  </button>
                  <button
                    type="button"
                    (click)="store.deleteMenuItem(item.id)"
                    class="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    <i class="pi pi-trash text-xs"></i>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Dialog -->
    <p-dialog
      [(visible)]="dialogVisible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '32rem', maxWidth: '95vw' }"
      [header]="draftItem().isCombo ? 'Combo Deal' : 'Menu Item'"
    >
      <div class="space-y-3">
        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-500 mb-1">Name *</label>
            <input pInputText type="text" [(ngModel)]="draftItem().name" placeholder="Item name" class="w-full text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">SKU *</label>
            <input pInputText type="text" [(ngModel)]="draftItem().sku" placeholder="BRG-01" class="w-full text-sm font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Price (PKR) *</label>
            <input pInputText type="number" [(ngModel)]="draftItem().price" class="w-full text-sm font-bold" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select [(ngModel)]="draftItem().categoryId" class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
              @for (cat of store.categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Station</label>
            <select [(ngModel)]="draftItem().station" class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
              <option value="kitchen">Kitchen</option>
              <option value="grill">Grill</option>
              <option value="beverage">Beverage</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input pInputText type="text" [(ngModel)]="draftItem().description" placeholder="Short description..." class="w-full text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Badge</label>
            <input pInputText type="text" [(ngModel)]="draftItem().badge" placeholder="e.g. Bestseller" class="w-full text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">FBR PCT</label>
            <input pInputText type="text" [(ngModel)]="draftItem().pctCode" placeholder="9801.2000" class="w-full text-sm font-mono" />
          </div>
        </div>

        @if (draftItem().isCombo) {
          <div class="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 space-y-2">
            <div class="text-xs font-bold text-purple-700 dark:text-purple-300">Combo Items</div>
            <div class="flex gap-2">
              <select [(ngModel)]="selectedComboSubItemId" class="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs">
                @for (single of nonComboItems(); track single.id) {
                  <option [value]="single.id">{{ single.name }} (Rs. {{ single.price }})</option>
                }
              </select>
              <input pInputText type="number" [(ngModel)]="selectedComboQty" min="1" class="w-14 text-xs text-center" />
              <p-button label="Add" icon="pi pi-plus" size="small" (onClick)="addComboSubItem()" />
            </div>
            @for (ci of draftItem().comboItems; track ci.menuItemId; let idx = $index) {
              <div class="flex items-center justify-between text-xs bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded border border-gray-200 dark:border-gray-800">
                <span>{{ ci.quantity }}× {{ ci.name }}</span>
                <button type="button" (click)="removeComboSubItem(idx)" class="text-red-400 hover:text-red-600 cursor-pointer">
                  <i class="pi pi-times text-xs"></i>
                </button>
              </div>
            }
          </div>
        }

        <div class="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="dialogVisible.set(false)" />
          <p-button label="Save" icon="pi pi-check" severity="success" (onClick)="saveDraftItem()" />
        </div>
      </div>
    </p-dialog>
  `,
})
export class MenuManagementComponent {
  readonly store = inject(PosStore);

  readonly categoryFilter = signal<string>('all');
  readonly searchTerm = signal<string>('');
  readonly dialogVisible = signal<boolean>(false);

  readonly selectedComboSubItemId = signal<string>('item-zinger');
  readonly selectedComboQty = signal<number>(1);

  readonly draftItem = signal<MenuItem>(this.createEmptyItem(false));

  readonly nonComboItems = computed(() =>
    this.store.menuItems().filter((i) => !i.isCombo)
  );

  readonly filteredItems = computed(() => {
    const cat = this.categoryFilter();
    const q = this.searchTerm().trim().toLowerCase();
    return this.store.menuItems().filter((item) => {
      const matchCat =
        cat === 'all' || (cat === 'cat-combos' ? item.isCombo : item.categoryId === cat);
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  });

  getCategoryName(categoryId: string): string {
    return (
      this.store.categories().find((c) => c.id === categoryId)?.name ?? 'General'
    );
  }

  openItemDialog(isCombo: boolean): void {
    this.draftItem.set(this.createEmptyItem(isCombo));
    this.dialogVisible.set(true);
  }

  editItem(item: MenuItem): void {
    this.draftItem.set({
      ...item,
      comboItems: item.comboItems ? [...item.comboItems] : [],
    });
    this.dialogVisible.set(true);
  }

  addComboSubItem(): void {
    const target = this.store
      .menuItems()
      .find((i) => i.id === this.selectedComboSubItemId());
    if (!target) return;
    const current = this.draftItem();
    const list: ComboItemRef[] = [...(current.comboItems ?? [])];
    list.push({
      menuItemId: target.id,
      name: target.name,
      quantity: Math.max(1, this.selectedComboQty()),
    });
    this.draftItem.set({ ...current, comboItems: list });
  }

  removeComboSubItem(index: number): void {
    const current = this.draftItem();
    const list = [...(current.comboItems ?? [])];
    list.splice(index, 1);
    this.draftItem.set({ ...current, comboItems: list });
  }

  saveDraftItem(): void {
    const item = this.draftItem();
    if (!item.name.trim() || item.price <= 0) return;
    this.store.saveMenuItem({
      ...item,
      name: item.name.trim(),
      sku: item.sku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
    });
    this.dialogVisible.set(false);
  }

  private createEmptyItem(isCombo: boolean): MenuItem {
    return {
      id: `item-${Date.now()}`,
      categoryId: isCombo ? 'cat-combos' : 'cat-burgers',
      name: '',
      description: '',
      price: 550,
      sku: isCombo ? `CMB-0${this.store.menuItems().length + 1}` : `ITM-${this.store.menuItems().length + 1}`,
      pctCode: '9801.2000',
      station: 'kitchen',
      isAvailable: true,
      isCombo,
      comboItems: isCombo ? [] : undefined,
      badge: isCombo ? 'Value Deal' : '',
    };
  }
}
