import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgxCaptureService } from 'ngx-capture';
import { map, takeWhile, tap, timer } from 'rxjs';
import { BrandService } from '../../services/brand/brand.service';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-voucher-image',
  standalone: true,
  imports: [MatIconModule, DragDropModule, FormsModule, QRCodeModule, MatButtonModule, DatePipe, AsyncPipe],
  templateUrl: './voucher-image.component.html',
  styleUrl: './voucher-image.component.scss'
})
export class VoucherImageComponent implements OnInit, OnDestroy {
  @Input('voucher') voucher = <any>{};
  @Input('readonly') readonly: boolean = false;
  @Output() updateQrPosition = new EventEmitter();
  @Output() uploadTick = new EventEmitter();
  @Output() updateImageSize = new EventEmitter();
  @ViewChild('voucherContainer') voucherContainer?: ElementRef;
  downloading: boolean = false
  isPhone: boolean = false
  isShowVoucher: boolean = false
  countDown: any;
  seconds: any = 5;

  constructor(
    private cd: ChangeDetectorRef,
    private captureService: NgxCaptureService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((state: BreakpointState) => {
        this.isPhone = state.matches;
      });
  }

  ngOnInit(): void {
    this.isShowVoucher = false
    this.countDown = timer(0, 1000).pipe(
      map(n => (this.seconds - n) * 1000),
      takeWhile(n => n >= 0),
    )
    this.countDown?.subscribe((n: any) => {
      this.isShowVoucher = false
      if (n === 0) {
        if (this.readonly && !this.voucher.scale) {
          this.updateScale()
        }
        this.cd.detectChanges()
        this.isShowVoucher = true
      }
    })
  }

  ngOnDestroy(): void {
    this.downloading = false
    this.isPhone = false
    this.isShowVoucher = false
    this.countDown = null;
    this.seconds = 5;
  }

  updateScale() {
    if (!this.voucher.scale) {
      const voucherContentWrapper = () => {
        return new Promise((resolve, reject) => {
          const data = document.getElementById('voucherContentWrapper')
          resolve(data);
        });
      }
      voucherContentWrapper().then((res: any) => {
        setTimeout(() => {
          if (res) {
            this.voucher.scale = (res?.offsetWidth - 16) / (parseFloat(this.voucher.size?.split('x')[0]))
            if (this.voucher.scale > 0) {
              this.isShowVoucher = true
            }
          }
        }, 0)
      })
    } else {
      this.isShowVoucher = true
    }
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
    if (this.readonly) {
      this.voucher.ticks = []
      this.voucher.scale = 1
    }
    setTimeout(() => {
      if (!this.voucher.qrData) {
        this.voucher.qrData = `${this.voucher.id}`
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
            link.download = `${this.readonly ? this.voucher?.qrData?.split('/')[this.voucher?.qrData?.split('/')?.length - 1] : this.voucher.id?.toString()?.replace('.', '_')}`
            this.cd.detectChanges()
            link.click()
            this.downloading = false
            this.updateScale()
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
      // this.voucher.height = `${event?.target.height}`
      // this.voucher.width = `${event?.target.width}`
      // this.voucher.size = `${event?.target.width}x${event?.target.height}`
      // this.updateScale()
    }
    this.updateImageSize.emit(event)
  }
}
