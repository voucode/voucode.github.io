import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { BrandService } from '../shared/services/brand/brand.service';
import { MasterDataService } from '../shared/services/masterData/master-data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-customer',
  standalone: true,
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatDialogModule, SharedModule, MatProgressSpinnerModule]
})
export class CustomerComponent implements OnInit {
  customer = <any>{}
  customers = <any>[]
  brandSetting = <any>{}
  loggedIn: boolean = false;
  googleFormsPath: any;

  constructor(
    private brandService: BrandService,
    private masterDataService: MasterDataService,
    private cd: ChangeDetectorRef
  ) {
    this.loggedIn = !!localStorage.getItem('loggedIn')
  }

  ngOnInit(): void {
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
  loggedInBrand = <any>{}
  brandSheet: any;

  getCurrentBrand() {
    let loggedIn = JSON.parse(localStorage.getItem('loggedIn') || '{}')
    if (loggedIn?.brand) {
      this.brandSheet = this.users?.find((item: any) => item.brand?.trim() == loggedIn?.brand?.trim())?.brandDatabase
      if (this.brandSheet) {
        this.brandService.fetchBrandData(this.brandSheet)
          .subscribe((res: any) => {            
            if (res.status === 200) {              
              this.brandSetting = this.brandService.brandSetting?.global
              this.getCustomerList()
            }
          })
      }
    }
  }

  onConfirmCreateCustomer() {
    this.googleFormsPath = ''
    if (this.brandSetting?.customerForms) {
      if (this.brandSetting?.customerForms?.includes('http')) {
        this.brandSetting.customerForms = this.brandSetting.customerForms?.split('e/')[1]?.split('/')[0]
      }
      this.googleFormsPath = `https://docs.google.com/forms/d/e/${this.brandSetting?.customerForms}/viewform`
      Object.keys(this.brandService.brandSetting?.customerDatabase)
        ?.filter((item: any) => item !== 'googleFormsId')
        ?.forEach((k: any, index) => {
          if (this.customer[k]) {
            if (k == 'id') {
              this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.customerDatabase[k]}=${this.brandSetting?.id}-${encodeURIComponent(this.customer[k])}`
            } else {
              this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.customerDatabase[k]}=${encodeURIComponent(this.customer[k])}`
            }
          }
        })
    }
  }

  getCustomerList() {
    if (this.brandSetting?.customerDatabase) {
      try {
        this.brandService.getCustomerList(this.brandSetting?.customerDatabase)?.subscribe((res: any) => {          
          if (res.status === 200) {            
            this.customers = res.data
          }
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  onPress(evt: any) {
    var charCode = evt.charCode;    
    if (charCode == 32 || charCode == 47 || charCode == 95)
      return false;
    return true;
  }
}
