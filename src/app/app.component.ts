import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { MatMenuModule } from '@angular/material/menu';
import { MasterDataService } from './shared/services/masterData/master-data.service';
import { BrandService } from './shared/services/brand/brand.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatMenuModule, MatToolbarModule, MatIconModule, MatButtonModule, MatSidenavModule, MatListModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewChecked {
  title = 'vocode';
  sideNavMode: any = 'side';
  isShowNavBar: boolean = true
  loggedIn: boolean = false
  registrationTrigger = <any>{}
  loggedInBrand = <any>{}
  brandSetting = <any>{}
  users = <any>[]
  brandSheet: any;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private masterDataService: MasterDataService,
    private cd: ChangeDetectorRef,
    private brandService: BrandService
  ) {
    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((state: BreakpointState) => {
        this.isShowNavBar = !state.matches;
      });
    this.loggedIn = !!JSON.parse(localStorage.getItem('loggedIn') || '{}')?.userName
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
    if (!this.brandService?.brandSetting?.global?.id) {
      this.getCurrentBrand()
    }
  }

  onLogout() {
    localStorage.removeItem('loggedIn')
    window.location.reload()
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

  getRegisteredData() {
    this.brandService.getRegisteredData()
      .subscribe((res: any) => {
        if (res.code === 200) {
          this.users = res.data
          this.getCurrentBrand()
          this.cd.detectChanges()
        }
      })
  }

  getCurrentBrand() {
    let loggedIn = JSON.parse(localStorage.getItem('loggedIn') || '{}')
    if (loggedIn?.brand) {
      this.brandSheet = this.users?.find((item: any) => item.brand == loggedIn?.brand)?.brandDatabase
      if (this.brandSheet) {
        this.brandService.fetchBrandData(this.brandSheet)
          .subscribe((res: any) => {
            if (res.code === 200) {
              const baseList = [...new Set(res?.data?.map((item: any) => item?.base))]
              baseList?.forEach((item: any) => {
                if (!this.brandService.brandSetting[item]) {
                  this.brandService.brandSetting[item] = <any>{}
                }
                res.data?.filter((row: any) => row?.base == item)?.forEach((row: any) => {
                  this.brandService.brandSetting[item][row?.field] = row?.trigger
                })
              })
              this.brandSetting = this.brandService.brandSetting?.global
              // console.log(this.brandSetting);

              loggedIn.trigger = this.loggedInBrand?.trigger
              localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
            }
          })
      }
    }
  }
}
