import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgxCaptureService } from 'ngx-capture';
import { tap } from 'rxjs';
import { BrandService } from '../../services/brand/brand.service';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-voucher-image',
  standalone: true,
  imports: [MatIconModule, DragDropModule, FormsModule, QRCodeModule, MatButtonModule],
  templateUrl: './voucher-image.component.html',
  styleUrl: './voucher-image.component.scss'
})
export class VoucherImageComponent {
  @Input('voucher') voucher = <any>{};
  @Input('readonly') readonly: boolean = false;
  @Output() updateQrPosition = new EventEmitter();
  @Output() uploadTick = new EventEmitter();
  @Output() updateImageSize = new EventEmitter();
  downloading: boolean = false

  constructor(
    private cd: ChangeDetectorRef,
    private captureService: NgxCaptureService,
    private brandService: BrandService
  ) {

  }

  private convertBase64ToBlob(Base64Image: string) {
    // split into two parts
    const parts = Base64Image.split(";base64,")
    // hold the content type
    const imageType = parts[0].split(":")[1]
    // decode base64 string
    const decodedData = window.atob(parts[1])
    // create unit8array of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length)
    // insert all character code into uint8array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i)
    }
    // return blob image after conversion
    return new Blob([uInt8Array], { type: imageType })
  }

  saveAsImage(element: any) {
    setTimeout(() => {
      if (!this.voucher?.id?.includes(this.brandService.brandSetting?.global?.id)) {
        this.voucher.qrData = `${this.brandService.brandSetting?.global?.id}-${this.voucher.id}`
      }
    })
    setTimeout(() => {
      this.downloading = true
      const saveItem = document.getElementById(element?.id)
      this.captureService
        //@ts-ignore
        .getImage(saveItem, true)
        .pipe(
          tap((img: string) => {
            // converts base 64 encoded image to blobData
            let blobData = this.convertBase64ToBlob(img)
            // saves as image
            const blob = new Blob([blobData], { type: "image/png" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            // name of the file            
            link.download = `${this.voucher.id?.toString()?.replace('.', '_')}`
            link.click()
            this.downloading = false
          })
        )
        .subscribe();
    }, 0)
  }

  onUpdateQrPosition(event: any) {
    this.updateQrPosition.emit(event)
  }

  onUploadTick(event: any, item: any) {
    this.uploadTick.emit({ event: event, item: item })
  }

  onUpdateImageSize(event: any) {
    if (this.readonly) {
      this.voucher.height = `${event?.target.height}`
      this.voucher.width = `${event?.target.width}`
      this.voucher.size = `${event?.target.width}x${event?.target.height}`
    }
    this.updateImageSize.emit(event)
  }
}
