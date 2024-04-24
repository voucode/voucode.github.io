import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BrandService } from '../shared/services/brand/brand.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../shared/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { VoucherImageComponent } from "../shared/components/voucher-image/voucher-image.component";

@Component({
  selector: 'app-voucher',
  standalone: true,
  templateUrl: './voucher.component.html',
  styleUrl: './voucher.component.scss',
  imports: [MatSelectModule, MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatDialogModule, SharedModule, MatProgressSpinnerModule, MatProgressBarModule, VoucherImageComponent]
})
export class VoucherComponent implements AfterViewChecked, OnInit {

  customerBrandSetting = <any>{}
  voucher = <any>{
    voucher: <any>{}
  }
  loggedIn: boolean = false;
  googleFormsPath: any;
  customers = <any>[]
  vouchers = <any>[]

  constructor(
    private brandService: BrandService,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.customerBrandSetting = <any>{}
    this.voucher = <any>{
      voucher: <any>{}
    }
    this.loggedIn = false;
    this.googleFormsPath = '';
    this.customers = <any>[]
    this.vouchers = <any>[]
    this.loggedIn = !!localStorage.getItem('loggedIn')
    this.fetchInitData()
  }

  ngAfterViewChecked(): void {
    this.fetchInitData()
  }

  fetchInitData() {
    if (!this.customerBrandSetting?.customerForms) {
      this.getBrandSetting()
    }
    if (this.customerBrandSetting?.customerForms) {
      if (this.customers?.length == 0) {
        this.getCustomerList()
      }
      if (this.vouchers?.length == 0) {
        this.getVoucherList()
      }
    }
  }

  getBrandSetting() {
    this.customerBrandSetting = this.brandService.brandSetting?.global
    this.cd.detectChanges()
  }

  getCustomerList() {
    if (this.customerBrandSetting?.customerDatabase) {
      try {
        this.brandService.getCustomerList(this.customerBrandSetting?.customerDatabase)?.subscribe((res: any) => {
          if (res.code === 200) {
            this.customers = res.data
          }
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  getVoucherList() {
    if (this.customerBrandSetting?.voucherDatabase) {
      try {
        this.brandService.getVoucherList(this.customerBrandSetting?.voucherDatabase)?.subscribe((res: any) => {
          if (res.code === 200) {
            this.vouchers = res.data
          }
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  updateValue() {
    if (this.voucher.voucher) {
      this.voucher.voucherId = this.voucher?.voucher?.id
      this.voucher.voucher.backgroundImage = this.voucher.voucher.background
      this.voucher.voucher.tickImage = this.voucher.voucher.tickId
      if (this.voucher.voucher?.ticks && typeof this.voucher.voucher?.ticks == 'string') {
        this.voucher.voucher.ticks = JSON.parse(this.voucher.voucher.ticks)
      }
      if (this.voucher.voucher.qrPosition) {
        this.voucher.voucher.qrX = this.voucher.voucher.qrPosition?.split(':')[0]
        this.voucher.voucher.qrY = this.voucher.voucher.qrPosition?.split(':')[1]
      }
    }
    if (this.voucher.voucherId && this.voucher.customerId) {
      this.voucher.voucher.qrData = `${window.location.origin}/${this.voucher.voucherId}_${this.voucher.customerId}`
    }
  }

  onConfirmCreateVoucher() {
    if (this.customerBrandSetting?.customerVoucherForms?.includes('http')) {
      this.customerBrandSetting.customerVoucherForms = this.customerBrandSetting?.customerVoucherForms?.split('e/')[1]?.split('/')[0]
    }
    this.googleFormsPath = `https://docs.google.com/forms/d/e/${this.customerBrandSetting?.customerVoucherForms}/viewform?${this.brandService.brandSetting?.customerVoucherDatabase?.voucherId}=${encodeURIComponent(this.voucher.voucherId)}&${this.brandService.brandSetting?.customerVoucherDatabase?.customerId}=${encodeURIComponent(this.voucher.customerId)}&${this.brandService.brandSetting?.customerVoucherDatabase?.action}=add`
  }
}
