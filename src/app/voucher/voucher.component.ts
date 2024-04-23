import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
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
export class VoucherComponent implements AfterViewChecked {

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
    this.loggedIn = !!localStorage.getItem('loggedIn')
  }

  ngAfterViewChecked(): void {
    if (!this.customerBrandSetting?.customerForms) {
      this.getBrandSetting()
    }
    if (this.customerBrandSetting?.customerDatabase && this.customers?.length == 0) {
      this.getCustomerList()
    }
    if (this.customerBrandSetting?.voucherDatabase && this.vouchers?.length == 0) {
      this.getVoucherList()
    }
  }

  getBrandSetting() {
    this.customerBrandSetting = this.brandService.brandSetting?.global
    this.cd.detectChanges()
  }

  getCustomerList() {
    this.brandService.getCustomerList(this.customerBrandSetting?.customerDatabase)?.subscribe((res: any) => {
      if (res.code === 200) {
        this.customers = res.data
      }
    })
  }

  getVoucherList() {
    this.brandService.getVoucherList(this.customerBrandSetting?.voucherDatabase)?.subscribe((res: any) => {
      if (res.code === 200) {
        this.vouchers = res.data
      }
    })
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
      this.voucher.voucher.qrData += `${this.voucher.voucherId}-${this.voucher.customerId}`
    }
    console.log(this.voucher);
  }

  onConfirmCreateVoucher() {
    console.log(this.voucher);
    this.voucher = this

  }
}
