import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
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
export class CustomerComponent implements AfterViewChecked {
  customer = <any>{}
  customers = <any>[]
  customerBrandSetting = <any>{}
  loggedIn: boolean = false;
  googleFormsPath: any;

  constructor(
    private masterDataService: MasterDataService,
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
  }

  getBrandSetting() {
    this.customerBrandSetting = this.brandService.brandSetting?.global
    this.cd.detectChanges()
    console.log(this.customerBrandSetting);
  }

  onConfirmCreateCustomer() {
    this.googleFormsPath = ''
    if (this.customerBrandSetting?.customerForms) {
      if (this.customerBrandSetting?.customerForms?.includes('http')) {
        this.customerBrandSetting.customerForms = this.customerBrandSetting.customerForms?.split('e/')[1]?.split('/')[0]
      }
      this.googleFormsPath = `https://docs.google.com/forms/d/e/${this.customerBrandSetting?.customerForms}/viewform`
      Object.keys(this.brandService.brandSetting?.customerDatabase)
        ?.filter((item: any) => item !== 'googleFormsId')
        ?.forEach((k: any, index) => {
          if (this.customer[k]) {
            if (k == 'id') {
              this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.customerDatabase[k]}=${this.customerBrandSetting?.id}-${encodeURIComponent(this.customer[k])}`
            } else {
              this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.customerDatabase[k]}=${encodeURIComponent(this.customer[k])}`
            }
          }
        })
      console.log(this.googleFormsPath);

    }
  }

  getCustomerList() {
    this.brandService.getCustomerList(this.customerBrandSetting?.customerDatabase)?.subscribe((res: any) => {
      if (res.code === 200) {
        this.customers = res.data
      }
    })
  }
}
