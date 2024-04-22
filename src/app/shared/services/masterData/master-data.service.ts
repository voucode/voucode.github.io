import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { read, utils } from 'xlsx';
type Mutable<T> = { -readonly [P in keyof T]: T[P] }

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

  readonly sheetUrl = `https://docs.google.com/spreadsheets/d/e/{id}/pub?output=xlsx`
  readonly sheetId = `2PACX-1vR1ixGfFrweGMq7dG9zGeO7Zy1bA7K5ePcmlSTAtFqiW6W1bFf0xaIEG6cTT7ATId0J092OJb8YzhGy`
  readonly masterDataWorkbook: any;
  readonly masterData = <any>[];
  isActiveMasterData: boolean = false

  constructor() {
    this.fetchMasterData()
  }

  fetchMasterData() {
    if (!this.masterDataWorkbook) {
      const ref: Mutable<this> = this;
      const sheetUrl = this.sheetUrl.replace('{id}', this.sheetId)
      fetch(sheetUrl)
        .then((res: any) => res.arrayBuffer())
        .then((req => {
          const workbook = read(req)
          ref.masterDataWorkbook = workbook          
          this.isActiveMasterData = true
          this.getMasterData().subscribe()
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

  getMasterData(request?: any): Observable<any> {
    return new Observable((observable) => {
      let querySheet = 'masterDatabase'
      if (request?.tab) {
        querySheet = request.tab
      }
      const ref: Mutable<this> = this;
      if (this.masterDataWorkbook) {
        const masterData = this.masterDataWorkbook.Sheets[querySheet]
        let data = this.decodeRawSheetData(masterData)        
        ref.masterData = data
        const response = {
          code: data?.length > 0 ? 200 : 404,
          data: data
        }
        observable.next(response)
        observable.complete()
      }
    })
  }
}
