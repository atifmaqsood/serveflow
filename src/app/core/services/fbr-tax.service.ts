import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { CartLineItem, FbrInvoiceData, PaymentMethod, PosSettings } from '../models/pos.models';

export interface FbrImsPayload {
  InvoiceNumber: string;
  POSID: number;
  USIN: string;
  DateTime: string;
  BuyerName: string;
  BuyerPhoneNumber: string;
  TotalSaleValue: number;
  TotalTaxCharged: number;
  TotalQuantity: number;
  FurtherTax: number;
  TotalBillAmount: number;
  PaymentMode: number;
  InvoiceType: number;
  Items: Array<{
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    PCTCode: string;
    TaxRate: number;
    SaleValue: number;
    TaxCharged: number;
    TotalAmount: number;
    InvoiceType: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class FbrTaxService {
  private readonly http = inject(HttpClient);

  buildImsPayload(params: {
    usin: string;
    items: CartLineItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    customerName?: string;
    customerPhone?: string;
    settings: PosSettings;
  }): FbrImsPayload {
    const now = new Date();
    const totalQty = params.items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      InvoiceNumber: '',
      POSID: Number(params.settings.fbrPosId) || 154289,
      USIN: params.usin,
      DateTime: now.toISOString().replace('T', ' ').slice(0, 19),
      BuyerName: params.customerName || 'Walk-in Customer',
      BuyerPhoneNumber: params.customerPhone || '00000000000',
      TotalSaleValue: params.subtotal,
      TotalTaxCharged: params.taxAmount,
      TotalQuantity: totalQty,
      FurtherTax: params.settings.fbrServiceFee,
      TotalBillAmount: params.grandTotal,
      PaymentMode: params.paymentMethod === 'cash' ? 1 : 2,
      InvoiceType: 1,
      Items: params.items.map((line) => {
        const lineSale = line.unitPrice * line.quantity;
        const lineTax = Math.round((lineSale * params.taxRate) / 100);
        return {
          ItemCode: line.menuItem.sku,
          ItemName: line.menuItem.name,
          Quantity: line.quantity,
          PCTCode: line.menuItem.pctCode || '9801.2000',
          TaxRate: params.taxRate,
          SaleValue: lineSale,
          TaxCharged: lineTax,
          TotalAmount: lineSale + lineTax,
          InvoiceType: 1,
        };
      }),
    };
  }

  async fiscalizeInvoice(params: {
    usin: string;
    sequenceNumber: number;
    items: CartLineItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    customerName?: string;
    customerPhone?: string;
    settings: PosSettings;
  }): Promise<FbrInvoiceData> {
    const now = new Date();
    const pad = (n: number, len = 2) => String(n).padStart(len, '0');
    const stamp = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(now.getFullYear()).slice(-2)}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const posId = params.settings.fbrPosId || '154289';
    const fallbackInvoiceNo = `${posId}-${stamp}-${pad(params.sequenceNumber, 4)}`;

    if (!params.settings.fbrEnabled || params.settings.fbrMode === 'sandbox') {
      return {
        fbrInvoiceNumber: fallbackInvoiceNo,
        posId,
        usin: params.usin,
        dateTime: now.toISOString(),
        taxRate: params.taxRate,
        taxAmount: params.taxAmount,
        fbrFee: params.settings.fbrServiceFee,
        qrPayload: `https://verify.fbr.gov.pk/pos?inv=${fallbackInvoiceNo}&pos=${posId}&amt=${params.grandTotal}`,
        syncStatus: 'simulated',
      };
    }

    const payload = this.buildImsPayload(params);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.settings.fbrAuthToken}`,
    });

    const response = await firstValueFrom(
      this.http
        .post<{ InvoiceNumber?: string; Response?: string }>(params.settings.fbrApiUrl, payload, {
          headers,
        })
        .pipe(
          timeout(3500),
          catchError(() => of(null))
        )
    );

    if (response?.InvoiceNumber) {
      return {
        fbrInvoiceNumber: response.InvoiceNumber,
        posId,
        usin: params.usin,
        dateTime: now.toISOString(),
        taxRate: params.taxRate,
        taxAmount: params.taxAmount,
        fbrFee: params.settings.fbrServiceFee,
        qrPayload: `https://verify.fbr.gov.pk/pos?inv=${response.InvoiceNumber}&pos=${posId}&amt=${params.grandTotal}`,
        syncStatus: 'verified',
      };
    }

    return {
      fbrInvoiceNumber: fallbackInvoiceNo,
      posId,
      usin: params.usin,
      dateTime: now.toISOString(),
      taxRate: params.taxRate,
      taxAmount: params.taxAmount,
      fbrFee: params.settings.fbrServiceFee,
      qrPayload: `https://verify.fbr.gov.pk/pos?inv=${fallbackInvoiceNo}&pos=${posId}&amt=${params.grandTotal}`,
      syncStatus: 'failed',
    };
  }

  generateQrMatrix(data: string): boolean[][] {
    const size = 21;
    const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
    const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    const placeFinder = (rowOffset: number, colOffset: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[rowOffset + r][colOffset + c] = isBorder || isInner;
          reserved[rowOffset + r][colOffset + c] = true;
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    for (let i = 7; i < size - 7; i++) {
      grid[6][i] = i % 2 === 0;
      reserved[6][i] = true;
      grid[i][6] = i % 2 === 0;
      reserved[i][6] = true;
    }

    let hash = 2166136261;
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (reserved[r][c]) continue;
        if (
          (r === 7 && (c <= 7 || c >= size - 8)) ||
          (c === 7 && (r <= 7 || r >= size - 8)) ||
          (r === size - 8 && c <= 7) ||
          (c === size - 8 && r <= 7)
        ) {
          reserved[r][c] = true;
          grid[r][c] = false;
          continue;
        }
        hash ^= (r * 31 + c * 17 + data.charCodeAt((r + c) % data.length)) & 0xff;
        hash = Math.imul(hash, 16777619);
        grid[r][c] = (Math.abs(hash) & 1) === 1;
      }
    }

    return grid;
  }
}
