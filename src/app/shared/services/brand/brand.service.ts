import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { read, utils } from 'xlsx';
import { MasterDataService } from '../masterData/master-data.service';

type Mutable<T> = { -readonly [P in keyof T]: T[P] }
@Injectable({
  providedIn: 'root'
})
export class BrandService {


  readonly sheetUrl = `https://docs.google.com/spreadsheets/d/e/{id}/pub?output=xlsx`
  readonly registeredWorkbook: any;
  readonly brandWorkbook: any;
  readonly customerWorkbook: any;
  readonly registeredData = <any>[];
  readonly brandData = <any>[];
  readonly customerData = <any>[];
  isActiveRegistered: boolean = false
  brandSetting = <any>{}

  constructor() {
  }

  fetchBrandData(id: any): Observable<any> {
    return new Observable((observable) => {
      if (!this.brandWorkbook) {
        const ref: Mutable<this> = this;
        const sheetUrl = this.sheetUrl.replace('{id}', id)
        fetch(sheetUrl)
          .then((res: any) => res.arrayBuffer())
          .then((req => {
            const workbook = read(req)
            ref.brandWorkbook = workbook
            const masterData = ref.brandWorkbook.Sheets['Sheet1']
            let data = this.decodeRawSheetData(masterData)
            ref.registeredData = data
            const response = {
              code: data?.length > 0 ? 200 : 404,
              data: data
            }
            observable.next(response)
            observable.complete()
          }))
      }
    });
  }

  fetchRegisteredData(id: any) {
    if (!this.registeredWorkbook) {
      const ref: Mutable<this> = this;
      const sheetUrl = this.sheetUrl.replace('{id}', id)
      fetch(sheetUrl)
        .then((res: any) => res.arrayBuffer())
        .then((req => {
          const workbook = read(req)
          ref.registeredWorkbook = workbook
          this.isActiveRegistered = true
          this.getRegisteredData().subscribe()
        }))
    }
  }

  private decodeRawSheetData(data: any, slice: any = 1, header?: any) {
    const column = [...new Set(Object.keys(data).map((col: any) => {
      let returnData = data[col.replace(/\d+((.|,)\d+)?/, slice)]
      if (returnData) {
        if (!parseFloat(returnData['v'])) {
          return returnData['v']
        } else {
          return new Date(returnData['v']).toString() !== 'Invalid Date' ? returnData['v'] : new Date(returnData['w']).getTime()
        }
      }
    }))]?.filter((col: any) => !!col)
    const responseData = utils.sheet_to_json<any>(data, {
      header: header || column
    })?.slice(slice);
    responseData.forEach((item: any) => {
      if (item?.option?.includes('||')) {
        item.options = item?.option?.split('||')
      }
    })
    return responseData
  }

  getRegisteredData(request?: any): Observable<any> {
    return new Observable((observable) => {
      let querySheet = 'Form Responses 1'
      if (request?.tab) {
        querySheet = request.tab
      }
      const ref: Mutable<this> = this;
      if (this.registeredWorkbook) {
        const masterData = this.registeredWorkbook.Sheets[querySheet]
        let data = this.decodeRawSheetData(masterData)
        ref.registeredData = data
        const response = {
          code: data?.length > 0 ? 200 : 404,
          data: data
        }
        observable.next(response)
        observable.complete()
      }
    })
  }

  getCustomerList(id: any) {
    return new Observable((observable) => {
      if (!this.customerWorkbook) {
        const ref: Mutable<this> = this;
        const sheetUrl = this.sheetUrl.replace('{id}', id)
        fetch(sheetUrl)
          .then((res: any) => res.arrayBuffer())
          .then((req => {
            const workbook = read(req)
            ref.customerWorkbook = workbook
            const customerData = ref.customerWorkbook.Sheets['Form Responses 1']
            let data = this.decodeRawSheetData(customerData)
            ref.customerData = data
            const response = {
              code: data?.length > 0 ? 200 : 404,
              data: data
            }
            observable.next(response)
            observable.complete()
          }))
      }
    });
  }
}
