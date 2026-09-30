import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PosStore } from './core/store/pos.store';
import { ThermalTicketComponent } from './shared/components/thermal-ticket/thermal-ticket.component';

interface NavLink {
  route: string;
  icon: string;
  label: string;
  shortLabel: string;
  badge?: () => number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ThermalTicketComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly store = inject(PosStore);

  readonly darkMode = signal(false);
  readonly roleModalVisible = signal(false);
  readonly enteredPin = signal('');
  readonly pinError = signal('');

  readonly navLinks: NavLink[] = [
    { route: '/pos', icon: 'pi pi-calculator', label: 'Terminal', shortLabel: 'POS', badge: () => this.store.cartItemCount() },
    { route: '/orders', icon: 'pi pi-receipt', label: 'Orders', shortLabel: 'Orders' },
    { route: '/menu', icon: 'pi pi-book', label: 'Menu', shortLabel: 'Menu' },
    { route: '/reports', icon: 'pi pi-chart-bar', label: 'Reports', shortLabel: 'Reports' },
    { route: '/settings', icon: 'pi pi-cog', label: 'Settings', shortLabel: 'Settings' },
  ];

  toggleDarkMode(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    document.documentElement.classList.toggle('dark', next);
  }

  openRoleSwitcher(): void {
    this.enteredPin.set('');
    this.pinError.set('');
    this.roleModalVisible.set(true);
  }

  activateCashierMode(): void {
    this.store.switchRole('cashier', 'Counter Cashier');
    this.roleModalVisible.set(false);
  }

  unlockAdminMode(): void {
    if (this.enteredPin() === this.store.settings().adminPin) {
      this.store.switchRole('admin', 'Atif (Owner / Admin)');
      this.roleModalVisible.set(false);
      this.pinError.set('');
    } else {
      this.pinError.set('Invalid PIN. Default Owner PIN is 1234.');
    }
  }
}
