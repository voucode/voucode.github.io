import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DecimalPipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { NgxCaptureService } from 'ngx-capture';
import { tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [MatFormFieldModule, MatDividerModule, MatProgressSpinnerModule, MatExpansionModule, FormsModule, MatIconModule, MatInputModule, MatButtonModule, DragDropModule, DecimalPipe],
  templateUrl: './generator.component.html',
  styleUrl: './generator.component.scss'
})
export class GeneratorComponent implements OnInit {

  @ViewChild('voucherContainer') voucherContainer!: ElementRef;
  @ViewChild('previewVoucher') previewVoucher!: ElementRef;

  voucher = <any>{
    qrPosition: '0:0',
    qrSize: '120',
    ticks: <any>[]
  }

  downloading: boolean = false

  constructor(private cd: ChangeDetectorRef,
    private captureService: NgxCaptureService,) {
  }

  ngOnInit(): void {
    this.updateQrPosition()
  }

  onAddBackground() {
    if (this.voucher.background) {
      this.voucher.sharedBackground = `https://lh3.google.com/u/0/d/${this.voucher.background}`
    }
    if (this.voucher.correctBackground) {
      if (this.voucher.correctBackground?.includes('http')) {
        this.voucher.backgroundImage = this.voucher.correctBackground
      } else {
        this.voucher.backgroundImage = `https://lh3.googleusercontent.com/fife/${this.voucher.correctBackground}`
      }
    }
    this.renderPreview()
  }

  updateImageSize(event: any) {
    this.voucher.height = `${event?.target.height}`
    this.voucher.width = `${event?.target.width}`
    this.voucher.size = `${event?.target.width}x${event?.target.height}`
    this.cd.detectChanges()
    this.renderPreview()
  }

  updateQrPosition(event?: any) {
    if (event) {
      this.voucher.qrPosition = `${event?.event?.layerX - this.voucher.qrSize / 2}:${event?.event?.layerY - this.voucher.qrSize / 2}`
    } else {
      this.voucher.qrX = this.voucher.qrPosition.split(':')[0]
      this.voucher.qrY = this.voucher.qrPosition.split(':')[1]
    }
    this.renderPreview()
  }

  renderPreview() {
    if (this.previewVoucher) {
      this.previewVoucher.nativeElement.innerHTML = document.getElementById('voucherContainerId')?.outerHTML
      this.cd.detectChanges()
      console.log(this.voucher);
    }
  }

  updateTickImage() {
    if (this.voucher.tickId) {
      this.voucher.shareTick = `https://lh3.google.com/u/0/d/${this.voucher.tickId}`
    }
    if (this.voucher.correctTick) {
      if (this.voucher.correctTick?.includes('http')) {
        this.voucher.tickImage = this.voucher.correctTick
      } else {
        this.voucher.tickImage = `https://lh3.googleusercontent.com/fife/${this.voucher.correctTick}`
      }
    }
    this.renderPreview()
  }

  uploadTick(event: any, item?: any) {
    if (event?.target) {
      this.voucher.ticks.push({
        tickImage: this.voucher.tickImage,
        size: event?.target.width,
        x: 0,
        y: 0,
        position: '0:0'
      })
    }
    if (event == 'add') {
      this.voucher.ticks.push({
        tickImage: this.voucher.tickImage,
        size: this.voucher.ticks[0].size,
        x: 0,
        y: 0,
        position: '0:0'
      })
    }
    if (event.tickId) {
      event.tickId = event.tickId
      event.size = event.size
      event.x = event.x
      event.y = event.y
      event.position = `${event.x}:${event.y}`
    }
    if (event?.event?.layerX || event?.event?.layerY) {
      item.position = `${event?.event?.layerX - event?.event?.target?.width / 2}:${event?.event?.layerY - event?.event?.target?.height / 2}`
    }
    this.cd.detectChanges()
    this.renderPreview()
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
      this.downloading = true
      const saveItem = document.getElementById('previewVoucher')
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
}
