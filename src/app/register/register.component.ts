import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MasterDataService } from '../shared/services/masterData/master-data.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatDialogModule, SharedModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  registrationInfor = <any>{}
  googleFormsPath: any = ''
  registrationTrigger = <any>{}

  constructor(private matDialog: MatDialog, private masterDataService: MasterDataService) {

  }

  ngOnInit(): void {
    if (!this.registrationTrigger?.googleFormsId) {
      this.getMasterData()
    }
  }

  getMasterData() {
    this.masterDataService.fetchMasterData()
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.registrationTrigger = res.setting
        }
      })
  }

  onSignUp(googleFormsRegistrationDialog: any) {
    this.googleFormsPath = ''
    if (this.registrationTrigger?.googleFormsId) {
      this.googleFormsPath = `https://docs.google.com/forms/d/e/${this.registrationTrigger?.googleFormsId}/viewform`
      Object.keys(this.registrationTrigger)
        ?.filter((item: any) => item !== 'googleFormsId' && item !== 'sheet')
        ?.forEach((k: any, index) => {
          if (this.registrationInfor[k]) {            
            this.googleFormsPath = this.googleFormsPath + `${index === 0 ? '?' : '&'}${this.registrationTrigger[k]}=${encodeURIComponent(this.registrationInfor[k])}`
          }
        })
      const googleFormsRegistrationDialogRef = this.matDialog.open(googleFormsRegistrationDialog);
    }
  }
}
