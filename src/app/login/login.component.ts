import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { BrandService } from '../shared/services/brand/brand.service';
import { MasterDataService } from '../shared/services/masterData/master-data.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatDialogModule, SharedModule, MatSelectModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewChecked {
  login = <any>{};
  registrationTrigger = <any>{};
  users = <any>[];

  constructor(
    private masterDataService: MasterDataService,
    private brandService: BrandService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngAfterViewChecked(): void {
    if (!this.registrationTrigger?.sheet) {
      this.getMasterData()
    }
    if (this.users?.length === 0) {
      if (this.registrationTrigger?.sheet) {
        this.brandService.fetchRegisteredData(this.registrationTrigger?.sheet)
        this.getRegisteredData()
      }
    }
  }

  getRegisteredData() {
    this.brandService.getRegisteredData()
      .subscribe((res: any) => {
        if (res.code === 200) {
          this.users = res.data
          this.cd.detectChanges()
        }
      })
  }

  getMasterData() {
    this.masterDataService.getMasterData()
      .subscribe((res: any) => {
        if (res.code === 200) {
          const registrationData = res.data?.filter((item: any) => item?.base == "registration")
          if (registrationData?.length > 0) {
            registrationData?.forEach((item: any) => {
              if (item?.trigger) {
                this.registrationTrigger[item?.field] = item?.trigger
              }
            })
          }
        }
      })
  }

  onLogin() {
    if (this.login.brand) {
      if ((this.login.userName == this.login.brand?.email || this.login.userName == this.login.brand?.brand) &&
        this.login.password == this.login.brand?.password) {
        localStorage.setItem('loggedIn', JSON.stringify({ userName: this.login.userName, brand: this.login.brand?.brand, }))
        window.location.reload()
        window.location.href = '/'
      }
    }
  }
}
