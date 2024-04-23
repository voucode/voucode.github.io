import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { QRCodeModule } from 'angularx-qrcode';
import { BrandService } from '../shared/services/brand/brand.service';
import { SharedModule } from "../shared/shared.module";
import { VoucherImageComponent } from "../shared/components/voucher-image/voucher-image.component";

@Component({
    selector: 'app-generator',
    standalone: true,
    templateUrl: './generator.component.html',
    styleUrl: './generator.component.scss',
    imports: [MatFormFieldModule, MatDividerModule, MatProgressSpinnerModule, MatExpansionModule, FormsModule, MatIconModule, MatInputModule, MatButtonModule, DragDropModule, DecimalPipe, QRCodeModule, SharedModule, VoucherImageComponent]
})
export class GeneratorComponent implements OnInit, AfterViewChecked {

  @ViewChild('voucherContainer') voucherContainer!: ElementRef;
  @ViewChild('previewVoucher') previewVoucher!: ElementRef;

  voucher = <any>{
    qrPosition: '0:0',
    qrSize: '120',
    ticks: <any>[]
  }
  loggedIn: boolean = false;

  downloading: boolean = false
  googleFormsPath: any = ''
  googleFormsEntry = <any>[]
  generatorBrandSetting = <any>{}

  constructor(
    private cd: ChangeDetectorRef,
    private captureService: NgxCaptureService,
    private brandService: BrandService
  ) {
    this.loggedIn = !!localStorage.getItem('loggedIn')
  }

  ngOnInit(): void {
    this.updateQrPosition()
  }

  ngAfterViewChecked(): void {
    if (!this.generatorBrandSetting?.voucherForms) {
      this.getGeneratorBrandSetting()
    }
  }

  getGeneratorBrandSetting() {
    this.generatorBrandSetting = this.brandService.brandSetting.global
    this.cd.detectChanges()

  }

  updateQr() {
    this.voucher.qrIconSize = ((this.voucher.qrSize / 100) * 0.01)
  }

  onAddBackground() {
    if (this.voucher.background) {
      if (this.voucher.background?.includes('http')) {
        this.voucher.background = this.voucher.background?.split('d/')[1]?.split('/')[0]
      }
      this.voucher.sharedBackground = `https://lh3.google.com/u/0/d/${this.voucher.background}`
    }
    if (this.voucher.correctBackground) {
      if (this.voucher.correctBackground?.includes('http')) {
        this.voucher.backgroundImage = this.voucher.correctBackground
      } else {
        this.voucher.backgroundImage = `https://lh3.googleusercontent.com/fife/${this.voucher.correctBackground}`
      }
    }
  }

  updateImageSize(event: any) {
    this.voucher.height = `${event?.target.height}`
    this.voucher.width = `${event?.target.width}`
    this.voucher.size = `${event?.target.width}x${event?.target.height}`
    this.cd.detectChanges()
  }

  updateQrPosition(event?: any) {
    if (event) {      
      this.voucher.qrPosition = `${event?.event?.layerX - event?.event?.offsetX}:${event?.event?.layerY - event?.event?.offsetY}`
    } else {
      this.voucher.qrX = this.voucher.qrPosition.split(':')[0]
      this.voucher.qrY = this.voucher.qrPosition.split(':')[1]
    }
  }

  updateTickImage() {
    if (this.voucher.tickId) {
      if (this.voucher.tickId?.includes('http')) {
        this.voucher.tickId = this.voucher.tickId?.split('d/')[1]?.split('/')[0]
      }
      this.voucher.shareTick = `https://lh3.google.com/u/0/d/${this.voucher.tickId}`
    }
    if (this.voucher.correctTick) {
      if (this.voucher.correctTick?.includes('http')) {
        this.voucher.tickImage = this.voucher.correctTick
      } else {
        this.voucher.tickImage = `https://lh3.googleusercontent.com/fife/${this.voucher.correctTick}`
      }
    }
  }

  uploadTick(event: any, item?: any) {
    if (event?.target) {
      this.voucher.ticks = []
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
        size: this.voucher.ticks[0]?.size,
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
      item.position = `${event?.event?.layerX - event?.event?.offsetX}:${event?.event?.layerY - event?.event?.offsetY}`
    }
    this.cd.detectChanges()
  }

  saveData() {
    if (this.generatorBrandSetting?.voucherForms) {
      if (this.generatorBrandSetting?.voucherForms?.includes('http')) {
        this.generatorBrandSetting.voucherForms = this.generatorBrandSetting?.voucherForms?.split('e/')[1]?.split('/')[0]
      }
      this.googleFormsPath = `https://docs.google.com/forms/d/e/${this.generatorBrandSetting?.voucherForms}/viewform`

      Object.keys(this.brandService.brandSetting?.voucherDatabase)
        ?.filter((item: any) => item !== 'googleFormsId')
        ?.forEach((k: any, index) => {
          if (k == 'id') {
            if (this.voucher[k]) {
              this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.voucherDatabase[k]}=${this.generatorBrandSetting?.id}-${encodeURIComponent(this.voucher[k])}`
            }
          } else {
            if (k == 'ticks') {
              if (this.voucher[k]) {
                this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.voucherDatabase[k]}=${encodeURIComponent(JSON.stringify(this.voucher[k]?.map((tick: any) => {
                  return {
                    size: tick.size,
                    x: tick.x || tick.position.split(':')[0],
                    y: tick.y || tick.position.split(':')[1],
                  }
                })))}`
              }
            } else {
              if (k == 'background') {
                if (this.voucher.backgroundImage) {
                  this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.voucherDatabase[k]}=${encodeURIComponent(this.voucher.backgroundImage)}`
                }
              } else {
                if (k == 'tickId') {
                  if (this.voucher.tickImage) {
                    this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.voucherDatabase[k]}=${encodeURIComponent(this.voucher.tickImage)}`
                  }
                } else {
                  if (this.voucher[k]) {
                    this.googleFormsPath += `${index === 0 ? '?' : '&'}${this.brandService.brandSetting?.voucherDatabase[k]}=${encodeURIComponent(this.voucher[k])}`
                  }
                }
              }
            }
          }
        })
    }
  }
}
