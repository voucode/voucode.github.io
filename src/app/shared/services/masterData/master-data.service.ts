import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { read, utils } from 'xlsx';
import { SheetService } from '../sheet/sheet.service';
type Mutable<T> = { -readonly [P in keyof T]: T[P] }

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

  readonly sheetUrl = `https://docs.google.com/spreadsheets/d/e/{id}/pub?output=xlsx`
  readonly sheetId = `2PACX-1vR1ixGfFrweGMq7dG9zGeO7Zy1bA7K5ePcmlSTAtFqiW6W1bFf0xaIEG6cTT7ATId0J092OJb8YzhGy`
  readonly masterDataWorkbook: any;
  readonly masterData = <any>{};
  isActiveMasterData: boolean = false

  constructor(private sheetService: SheetService) {
  }

  fetchMasterData(): Observable<any> {
    const ref: Mutable<this> = this;
    return new Observable((observable) => {
      const returnData = () => {
        let response = <any>{}        
        this.sheetService.decodeRawSheetData(ref.masterDataWorkbook.Sheets['masterDatabase'])
          .subscribe((res: any) => {
            const setting = res;            
            setting?.forEach((item: any) => {
              this.masterData[item?.field] = item?.trigger
            })            
            if (setting?.length > 0) {
              response.status = 200;
              response.setting = this.masterData
            } else {
              response.status = 400;
            }
            observable.next(response)
            observable.complete()
          })
      }
      if (!ref.masterDataWorkbook) {
        try {
          this.sheetService.fetchSheet(this.sheetId)
            .subscribe((res: any) => {
              if (res.status == 200) {
                if (res?.workbook) {
                  ref.masterDataWorkbook = res?.workbook
                  returnData()
                }
              }
            })
        } catch (e) {
          console.error(e);
        }
      } else {
        returnData()
      }
    })
  }
}
