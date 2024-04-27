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
import { MasterDataService } from '../shared/services/masterData/master-data.service';

@Component({
  selector: 'app-voucher',
  standalone: true,
  templateUrl: './voucher.component.html',
  styleUrl: './voucher.component.scss',
  imports: [MatSelectModule, MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatDialogModule, SharedModule, MatProgressSpinnerModule, MatProgressBarModule, VoucherImageComponent]
})
export class VoucherComponent implements OnInit {

  voucher = <any>{
    voucher: <any>{}
  }
  loggedIn: boolean = false;
  googleFormsPath: any;
  customers = <any>[]
  vouchers = <any>[]
  brandSetting = <any>{}
  constructor(
    private brandService: BrandService,
    private masterDataService: MasterDataService,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
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

  registrationTrigger = <any>{}
  fetchInitData() {    
    if (!this.registrationTrigger?.sheet) {
      this.getMasterData()
    }
  }
  users = <any>[]
  getMasterData() {
    this.masterDataService.fetchMasterData()
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.registrationTrigger = res.setting
          if (this.users?.length === 0) {
            if (this.registrationTrigger?.sheet) {
              this.getRegisteredData()
            }
          }
        }
      })
  }

  getRegisteredData() {
    this.brandService.fetchRegisteredData(this.registrationTrigger?.sheet)
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.users = res.data
          this.getCurrentBrand()
        }
      })
  }
  brandSheet: any;
  loggedInBrand = <any>{}

  getCurrentBrand() {
    let loggedIn = JSON.parse(localStorage.getItem('loggedIn') || '{}')
    if (loggedIn?.brand) {
      this.brandSheet = this.users?.find((item: any) => item.brand?.trim() == loggedIn?.brand?.trim())?.brandDatabase
      if (this.brandSheet) {
        this.brandService.fetchBrandData(this.brandSheet)
          .subscribe((res: any) => {
            if (res.status === 200) {              
              this.brandSetting = this.brandService.brandSetting?.global
              this.getVoucherList()
              loggedIn.trigger = this.loggedInBrand?.trigger
              localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
            }
          })
      }
    }
  }
  customerVouchers = <any>[];
  getCustomerVoucherList() {
    this.brandService.getCustomerVoucherList(this.brandSetting?.customerVoucherDatabase)?.subscribe((res: any) => {
      if (res.status === 200) {
        this.customerVouchers = res.data
        this.customerVouchers?.forEach((item: any) => {
          item.voucher = this.vouchers?.find((v: any) => v?.id === item?.voucherId)
          item.customer = this.customers?.find((v: any) => v?.id === item?.customerId)
        })
        this.customerVouchers = this.customerVouchers?.filter((item: any) => {
          return item?.action === 'add'
        })
        this.cd.detectChanges()
      }
    })
  }

  getCustomerList() {
    if (this.brandSetting?.customerDatabase) {
      try {
        this.brandService.getCustomerList(this.brandSetting?.customerDatabase)?.subscribe((res: any) => {
          if (res.status === 200) {
            this.customers = res.data
            this.getCustomerVoucherList()
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
          if (res.status === 200) {
            this.vouchers = res.data
            this.getCustomerList()
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
    if (this.brandSetting?.customerVoucherForms?.includes('http')) {
      this.brandSetting.customerVoucherForms = this.brandSetting?.customerVoucherForms?.split('e/')[1]?.split('/')[0]
    }
    this.googleFormsPath = `https://docs.google.com/forms/d/e/${this.brandSetting?.customerVoucherForms}/viewform?${this.brandService.brandSetting?.customerVoucherDatabase?.voucherId}=${encodeURIComponent(this.voucher.voucherId)}&${this.brandService.brandSetting?.customerVoucherDatabase?.customerId}=${encodeURIComponent(this.voucher.customerId)}&${this.brandService.brandSetting?.customerVoucherDatabase?.action}=add`
  }
}
