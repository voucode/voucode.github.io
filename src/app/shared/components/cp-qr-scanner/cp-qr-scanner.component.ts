import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ScannerQRCodeConfig, ScannerQRCodeSelectedFiles, NgxScannerQrcodeComponent, NgxScannerQrcodeService, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { delay } from 'rxjs';

@Component({
  selector: 'cp-qr-scanner',
  templateUrl: './cp-qr-scanner.component.html',
  styleUrls: ['./cp-qr-scanner.component.scss']
})
export class CpQrScannerComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

  @Output() qrData = new EventEmitter<any>();

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#front_and_back_camera
  public config: ScannerQRCodeConfig = {
    // fps: 1000,
    vibrate: 400,
    // isBeep: true,
    // decode: 'macintosh',
    // deviceActive: 0, // camera front: deviceActive=0  // back camera: deviceActive=1
    constraints: {
      // facingMode: "environment", // 'user' (front camera), and 'environment' (back camera).
      audio: false,
      video: {
        width: window.innerWidth // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      }
    }
  };

  public qrCodeResult: ScannerQRCodeSelectedFiles[] = [];
  public qrCodeResult2: ScannerQRCodeSelectedFiles[] = [];
  // @ts-ignore
  @ViewChild('action') action: NgxScannerQrcodeComponent;
  currentDevice: any;

  constructor(private cd: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.action?.stop()
    this.action?.start();
    // this.action?.isReady?.pipe(delay(3000)).subscribe(() => {
    // });

  }

  ngAfterViewChecked(): void {
    if (!this.currentDevice) {
      if (this.action.devices.value[this.action?.devices?.value?.length - 1]) {
        this.currentDevice = this.action.devices.value[this.action?.devices?.value?.length - 1]['deviceId']
        this.cd.detectChanges()
      }
    }
  }

  ngOnDestroy(): void {
    this.action?.stop()
    console.log('destroy');
  }

  public onEvent(e: ScannerQRCodeResult[]): void {
    console.log(e);
    if (e[0]?.value) {
      this.qrData.emit(e[0].value)
      this.action.play()
    }
  }

  public handle(action: NgxScannerQrcodeComponent, fn: string): void {
    // @ts-ignore
    action[fn]().subscribe(console.log, alert);
  }
}
