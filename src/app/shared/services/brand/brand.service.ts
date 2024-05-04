import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { read, utils } from 'xlsx';
import { MasterDataService } from '../masterData/master-data.service';
import { SheetService } from '../sheet/sheet.service';

type Mutable<T> = { -readonly [P in keyof T]: T[P] }
@Injectable({
  providedIn: 'root'
})
export class BrandService {


  readonly sheetUrl = `https://docs.google.com/spreadsheets/d/e/{id}/pub?output=xlsx`
  readonly registeredWorkbook: any;
  readonly brandWorkbook: any;
  readonly customerWorkbook: any;
  readonly voucherWorkbook: any;
  readonly customerVoucherWorkbook: any;
  readonly registeredData = <any>[];
  readonly brandData = <any>[];
  readonly customerData = <any>[];
  readonly voucherData = <any>[];
  readonly customerVoucherData = <any>[];
  isActiveRegistered: boolean = false
  brandSetting = <any>{}

  constructor(private sheetService: SheetService) {
  }

  fetchBrandData(id: any): Observable<any> {
    const ref: Mutable<this> = this;
    return new Observable((observable) => {
      const returnData = () => {
        let response = <any>{}
        this.sheetService.decodeRawSheetData(ref.brandWorkbook.Sheets['setting'])
          .subscribe((res: any) => {
            const setting = [...new Set(res?.map((item: any) => item?.base))]
            setting?.forEach((item: any) => {
              if (!this.brandSetting[item]) {
                this.brandSetting[item] = <any>{}
              }
              res.filter((row: any) => row?.base == item)?.forEach((row: any) => {
                this.brandSetting[item][row?.field] = row?.trigger
              })
            })
            if (setting?.length > 0) {
              response.status = 200;
              response.setting = this.brandSetting
              this.sheetService.decodeRawSheetData(ref.brandWorkbook.Sheets['khach-hang'])
                .subscribe((res: any) => {
                  response.customers = res
                  ref.customerData = res
                })
              this.sheetService.decodeRawSheetData(ref.brandWorkbook.Sheets['chuong-trinh'])
                .subscribe((res: any) => {
                  response.vouchers = res
                  ref.voucherData = res
                })
              this.sheetService.decodeRawSheetData(ref.brandWorkbook.Sheets['phat-khuyen-mai'])
                .subscribe((res: any) => {
                  response.customerVouchers = res
                  ref.customerVoucherData = res
                })

              observable.next(response)
              observable.complete()
            } else {
              response.status = 400;
            }
            observable.next(response)
            observable.complete()
          })
      }
      if (!ref.brandWorkbook) {
        try {
          this.sheetService.fetchSheet(id)
            .subscribe((res: any) => {
              if (res.status == 200) {
                if (res?.workbook) {
                  ref.brandWorkbook = res?.workbook
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

  fetchRegisteredData(id: any): Observable<any> {
    const ref: Mutable<this> = this;
    return new Observable((observable) => {
      const returnData = () => {
        let response = <any>{}
        this.sheetService.decodeRawSheetData(ref.registeredWorkbook.Sheets['Form Responses 1'])
          .subscribe((res: any) => {
            const user = res;
            if (user?.length > 0) {
              response.status = 200;
              response.data = user
              ref.registeredData = user
            } else {
              response.status = 400;
            }
            observable.next(response)
            observable.complete()
          })
      }
      if (!ref.registeredWorkbook) {
        try {
          this.sheetService.fetchSheet(id)
            .subscribe((res: any) => {
              if (res.status == 200) {
                if (res?.workbook) {
                  ref.registeredWorkbook = res?.workbook
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
