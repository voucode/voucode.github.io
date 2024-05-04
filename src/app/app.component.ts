import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  title = 'vocode';
  sideNavMode: any = 'side';
  isShowNavBar: boolean = true
  loggedIn: boolean = false
  isToggle: boolean = false
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
        this.isToggle = state.matches;
      });
    this.loggedIn = !!JSON.parse(localStorage.getItem('loggedIn') || '{}')?.userName
  }

  ngOnInit(): void {
    if (!this.registrationTrigger?.sheet) {
      this.getMasterData()
    }
  }

  onLogout() {
    localStorage.removeItem('loggedIn')
    window.location.reload()
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
          this.getCurrentBrand()
        }
      })
  }
  
  getCurrentBrand() {
    let loggedIn = JSON.parse(localStorage.getItem('loggedIn') || '{}')
    if (loggedIn?.brand) {
      if (!this.brandSetting?.global) {
        this.brandSheet = this.users?.find((item: any) => item.brand?.trim() == loggedIn?.brand?.trim())?.brandDatabase
        if (this.brandSheet) {
          this.brandService.fetchBrandData(this.brandSheet)
            .subscribe((res: any) => {
              if (res.status === 200) {
                this.brandSetting = res.setting
                loggedIn.trigger = this.loggedInBrand?.trigger
                localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
              }
            })
        }
      } else {
        this.brandSetting = this.brandService.brandSetting
      }
    }
  }
}
