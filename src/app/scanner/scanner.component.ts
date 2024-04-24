import { AfterViewChecked, ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CpQrScannerModule } from '../shared/components/cp-qr-scanner/cp-qr-scanner.module';
import { ActivatedRoute } from '@angular/router';
import { BrandService } from '../shared/services/brand/brand.service';
import { VoucherImageComponent } from "../shared/components/voucher-image/voucher-image.component";
import { DecimalPipe } from '@angular/common';
import { SharedModule } from "../shared/shared.module";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-scanner',
  standalone: true,
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
  imports: [CpQrScannerModule, VoucherImageComponent, DecimalPipe, SharedModule, MatButtonModule, MatIconModule]
})
export class ScannerComponent implements OnInit, AfterViewChecked {

  isShowScanner: boolean = true;
  promotion = <any>{}
  brandSetting = <any>{}
  customerVouchers = <any>[]
  customers = <any>[]
  vouchers = <any>[]
  googleFormsPath: any = ''

  constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef, private brandService: BrandService) {

  }

  ngOnInit(): void {
    this.isShowScanner = true
    this.route.params.subscribe((query) => {
      if (query['data']) {
        this.promotion.voucherId = query['data'].split('_')[0]
        this.promotion.customerId = query['data'].split('_')[1]
        if (this.promotion?.voucherId) {
          let localStorageData = JSON.parse(localStorage.getItem('loggedIn') || '{}')
          if (!localStorageData?.brand || this.promotion?.voucherId?.split('-')[0] != localStorageData?.brand) {
            localStorage.setItem('loggedIn', JSON.stringify({ brand: this.promotion?.voucherId?.split('-')[0] }))
            window.location.reload()
          }
        }
        this.isShowScanner = false
      }
    })
  }

  updatePath() {
    if (this.brandSetting.customerVoucherForms && !this.googleFormsPath) {
      if (this.brandSetting?.customerVoucherForms?.includes('http')) {
        this.brandSetting.customerVoucherForms = this.brandSetting?.customerVoucherForms?.split('e/')[1]?.split('/')[0]
      }
      if (
        this.brandSetting?.customerVoucherForms
        && this.brandService.brandSetting?.customerVoucherDatabase?.voucherId
        && this.promotion.voucherId && this.promotion.customerId
        && this.brandService.brandSetting?.customerVoucherDatabase?.customerId
        && this.brandService.brandSetting?.customerVoucherDatabase?.action
      ) {
        this.googleFormsPath = `https://docs.google.com/forms/d/e/${this.brandSetting?.customerVoucherForms}/viewform?${this.brandService.brandSetting?.customerVoucherDatabase?.voucherId}=${encodeURIComponent(this.promotion.voucherId)}&${this.brandService.brandSetting?.customerVoucherDatabase?.customerId}=${encodeURIComponent(this.promotion.customerId)}&${this.brandService.brandSetting?.customerVoucherDatabase?.action}=log`
      }
    }
  }

  ngAfterViewChecked(): void {
    this.fetchInitData()
    this.cd.detectChanges()
  }

  fetchInitData() {
    if (!this.brandSetting?.customerForms) {
      this.getBrandSetting()
    }
    if (this.brandSetting?.customerForms) {
      if (this.customers?.length == 0) {
        this.getCustomerList()
      }
      if (this.vouchers?.length == 0) {
        this.getVoucherList()
      }
      if (this.promotion?.voucherId && this.promotion?.customerId && !this.promotion.foundData) {
        this.getCustomerVoucherList()
      }
    }
  }

  getBrandSetting() {
    this.brandSetting = this.brandService.brandSetting?.global
    this.cd.detectChanges()
  }

  getCustomerVoucherList() {
    this.brandService.getCustomerVoucherList(this.brandSetting?.customerVoucherDatabase)?.subscribe((res: any) => {
      if (res.code === 200) {
        this.customerVouchers = res.data
        this.updateData()
      }
    })
  }

  getCustomerList() {
    if (this.brandSetting?.customerDatabase) {
      try {
        this.brandService.getCustomerList(this.brandSetting?.customerDatabase)?.subscribe((res: any) => {
          if (res.code === 200) {
            this.customers = res.data
            this.updateData()
          }
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  getVoucherList() {
    if (this.brandSetting?.voucherDatabase) {
      try {
        this.brandService.getVoucherList(this.brandSetting?.voucherDatabase)?.subscribe((res: any) => {
          if (res.code === 200) {
            this.vouchers = res.data
            this.updateData()
          }
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  scanComplete(event: any) {
    let data = event
    if (event?.includes('http')) {
      data = event?.split('/')[event?.split('/')?.length - 1]
      this.cd.detectChanges()
    }
    if (data?.split('_')?.length === 2) {
      this.promotion.voucherId = data?.split('_')[0]
      this.promotion.customerId = data?.split('_')[1]
      if (this.promotion?.voucherId) {
        let localStorageData = JSON.parse(localStorage.getItem('loggedIn') || '{}')
        if (!localStorageData?.brand || this.promotion?.voucherId?.split('-')[0] != localStorageData?.brand) {
          localStorage.setItem('loggedIn', JSON.stringify({ brand: this.promotion?.voucherId?.split('-')[0] }))
          window.location.href = data
        }
      }
      this.isShowScanner = false
      this.cd.detectChanges()
    }
  }

  updateData() {
    if (this.promotion.voucherId && this.promotion.customerId) {
      const foundCustomer = this.customers?.find((item: any) => item?.id == this.promotion?.customerId)
      if (foundCustomer) {
        this.promotion.customer = foundCustomer;
      }
      this.promotion.foundData = this.customerVouchers?.filter((item: any) => item?.voucherId === this.promotion?.voucherId && item?.customerId === this.promotion?.customerId)
      const foundVoucher = this.vouchers?.find((item: any) => item?.id == this.promotion?.voucherId)
      if (foundVoucher) {
        this.promotion.voucher = foundVoucher;
        if (this.promotion.voucher) {
          this.promotion.voucherId = this.promotion?.voucher?.id
          this.promotion.voucher.backgroundImage = this.promotion.voucher.background
          this.promotion.voucher.tickImage = this.promotion.voucher.tickId
          if (this.promotion.voucher?.ticks && typeof this.promotion.voucher?.ticks == 'string') {
            const parsedData = JSON.parse(this.promotion.voucher.ticks)
            this.promotion.voucher.rawTicks = parsedData
            this.promotion.voucher.ticks = <any>[]
            this.cd.detectChanges()
            if (this.promotion?.foundData?.length > 0) {
              this.cd.detectChanges()
              for (let i = 0; i < this.promotion?.foundData?.length - 1; i++) {
                this.cd.detectChanges()
                this.promotion.voucher.ticks.push(parsedData[i])
              }
            }
          }
          if (this.promotion.voucher.qrPosition) {
            this.promotion.voucher.qrX = this.promotion.voucher.qrPosition?.split(':')[0]
            this.promotion.voucher.qrY = this.promotion.voucher.qrPosition?.split(':')[1]
          }
        }
        if (this.promotion.voucherId && this.promotion.customerId) {
          this.promotion.voucher.qrData = `${window.location.origin}/${this.promotion.voucherId}_${this.promotion.customerId}`
        }
      }
    }
  }

  toggleScanner() {
    this.isShowScanner = !this.isShowScanner;
    this.promotion = <any>{}
  }
}
