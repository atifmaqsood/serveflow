import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import 'chart.js/auto';
import { PosStore } from '../../core/store/pos.store';

type ReportPeriod = 'today' | '7d' | '30d' | 'all';

@Component({
  selector: 'app-sales-reports',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ChartModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">Sales Reports</h1>
          <p class="text-xs text-gray-400">Revenue, orders, and tax analytics</p>
        </div>
        <div class="inline-flex p-0.5 rounded-lg bg-gray-100 dark:bg-gray-800">
          @for (p of periods; track p.value) {
            <button
              type="button"
              (click)="selectedPeriod.set(p.value)"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
              [class]="
                selectedPeriod() === p.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500'
              "
            >
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Revenue</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white mt-1">
            Rs. {{ metrics().grossRevenue | number: '1.0-0' }}
          </div>
          <div class="text-xs text-emerald-500 mt-0.5">Incl. GST & fees</div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Net Sales</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white mt-1">
            Rs. {{ metrics().netSales | number: '1.0-0' }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">Avg: Rs. {{ metrics().avgTicket | number: '1.0-0' }}</div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Orders</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {{ metrics().orderCount }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">{{ metrics().cashCount }} cash · {{ metrics().cardCount }} card</div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">FBR Tax</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white mt-1">
            Rs. {{ metrics().totalTax | number: '1.0-0' }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">+ Rs. {{ metrics().totalFbrFee | number: '1.0-0' }} fees</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h2 class="font-semibold text-sm text-gray-900 dark:text-white mb-3">Daily Sales (PKR)</h2>
          <div class="h-56">
            <p-chart type="bar" [data]="dailyRevenueChartData()" [options]="barChartOptions" height="100%" />
          </div>
        </div>

        <div class="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h2 class="font-semibold text-sm text-gray-900 dark:text-white mb-3">By Order Type</h2>
          <div class="h-56 flex items-center justify-center">
            <p-chart type="doughnut" [data]="orderTypeChartData()" [options]="doughnutOptions" height="100%" />
          </div>
        </div>
      </div>

      <!-- Top Selling -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h2 class="font-semibold text-sm text-gray-900 dark:text-white mb-3">Top Selling Items</h2>
        <table class="w-full text-sm">
          <thead class="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th class="py-2 px-3 text-left">#</th>
              <th class="py-2 px-3 text-left">Item</th>
              <th class="py-2 px-3 text-left">Qty</th>
              <th class="py-2 px-3 text-left">Revenue</th>
              <th class="py-2 px-3 w-40"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
            @for (row of topSellingItems(); track row.id; let idx = $index) {
              <tr>
                <td class="py-2 px-3 text-gray-400 font-medium">{{ idx + 1 }}</td>
                <td class="py-2 px-3 font-medium text-gray-900 dark:text-white">
                  {{ row.name }}
                  @if (row.isCombo) {
                    <span class="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Combo</span>
                  }
                </td>
                <td class="py-2 px-3 text-gray-600 dark:text-gray-400">{{ row.qty }}</td>
                <td class="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">Rs. {{ row.revenue | number: '1.0-0' }}</td>
                <td class="py-2 px-3">
                  <div class="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full" [style.width.%]="row.sharePercent"></div>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class SalesReportsComponent {
  readonly store = inject(PosStore);
  readonly selectedPeriod = signal<ReportPeriod>('7d');

  readonly periods: Array<{ label: string; value: ReportPeriod }> = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: 'All', value: 'all' },
  ];

  readonly periodOrders = computed(() => {
    const p = this.selectedPeriod();
    const completed = this.store.completedOrders();
    if (p === 'all') return completed;

    const now = Date.now();
    const cutoff =
      p === 'today'
        ? new Date(new Date().setHours(0, 0, 0, 0)).getTime()
        : p === '7d'
          ? now - 7 * 24 * 3600 * 1000
          : now - 30 * 24 * 3600 * 1000;

    return completed.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  });

  readonly metrics = computed(() => {
    const list = this.periodOrders();
    const grossRevenue = list.reduce((s, o) => s + o.grandTotal, 0);
    const netSales = list.reduce((s, o) => s + o.subtotal, 0);
    const totalTax = list.reduce((s, o) => s + o.taxAmount, 0);
    const totalFbrFee = list.reduce((s, o) => s + o.fbrServiceFee, 0);
    const orderCount = list.length;
    const avgTicket = orderCount > 0 ? Math.round(grossRevenue / orderCount) : 0;
    const cashCount = list.filter((o) => o.paymentMethod === 'cash').length;
    const cardCount = list.filter((o) => o.paymentMethod === 'card').length;

    return { grossRevenue, netSales, totalTax, totalFbrFee, orderCount, avgTicket, cashCount, cardCount };
  });

  readonly topSellingItems = computed(() => {
    const map = new Map<
      string,
      { id: string; name: string; isCombo: boolean; qty: number; revenue: number }
    >();

    for (const order of this.periodOrders()) {
      for (const line of order.items) {
        const prev = map.get(line.menuItem.id);
        const lineRev = line.unitPrice * line.quantity;
        if (prev) {
          prev.qty += line.quantity;
          prev.revenue += lineRev;
        } else {
          map.set(line.menuItem.id, {
            id: line.menuItem.id,
            name: line.menuItem.name,
            isCombo: line.menuItem.isCombo,
            qty: line.quantity,
            revenue: lineRev,
          });
        }
      }
    }

    const sorted = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
    const maxRev = sorted[0]?.revenue || 1;
    return sorted.map((item) => ({
      ...item,
      sharePercent: Math.round((item.revenue / maxRev) * 100),
    }));
  });

  readonly dailyRevenueChartData = computed(() => {
    const byDay = new Map<string, { net: number; tax: number }>();
    const ordered = [...this.periodOrders()].reverse();

    for (const o of ordered) {
      const d = new Date(o.createdAt).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
      });
      const current = byDay.get(d) ?? { net: 0, tax: 0 };
      current.net += o.subtotal;
      current.tax += o.taxAmount;
      byDay.set(d, current);
    }

    const labels = Array.from(byDay.keys());
    return {
      labels,
      datasets: [
        {
          label: 'Net Sales',
          backgroundColor: '#10b981',
          borderRadius: 4,
          data: labels.map((l) => byDay.get(l)?.net ?? 0),
        },
        {
          label: 'GST',
          backgroundColor: '#6366f1',
          borderRadius: 4,
          data: labels.map((l) => byDay.get(l)?.tax ?? 0),
        },
      ],
    };
  });

  readonly orderTypeChartData = computed(() => {
    let dineIn = 0;
    let takeaway = 0;
    let delivery = 0;

    for (const o of this.periodOrders()) {
      if (o.orderType === 'dine-in') dineIn += o.grandTotal;
      else if (o.orderType === 'takeaway') takeaway += o.grandTotal;
      else delivery += o.grandTotal;
    }

    return {
      labels: ['Dine-In', 'Takeaway', 'Delivery'],
      datasets: [
        {
          data: [dineIn, takeaway, delivery],
          backgroundColor: ['#10b981', '#f59e0b', '#0ea5e9'],
        },
      ],
    };
  });

  readonly barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 11 } } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } },
  };

  readonly doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 11 } } } },
  };
}
