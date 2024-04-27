import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  login = <any>{};
  registrationTrigger = <any>{};
  users = <any>[];

  constructor(
    private masterDataService: MasterDataService,
    private brandService: BrandService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    if (!this.registrationTrigger?.sheet) {
      this.getMasterData()
    }
  }

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
        }
      })
  }
  
  errorMessage: any;
  onLogin() {
    this.errorMessage = ''
    if (this.login.brand) {
      if ((this.login.userName == this.login.brand?.email || this.login.userName == this.login.brand?.brand) &&
        this.login.password == this.login.brand?.password) {
        localStorage.setItem('loggedIn', JSON.stringify({ userName: this.login.userName, brand: this.login.brand?.brand, }))
        window.location.reload()
        window.location.href = '/'
      } else {
        this.errorMessage = 'Thông tin đăng nhập không đúng, vui lòng thử lại hoặc liên hệ team IT để được hỗ trợ'
      }
    }
  }
}
