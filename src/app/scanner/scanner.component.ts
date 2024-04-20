import { Component } from '@angular/core';
import { CpQrScannerModule } from '../shared/components/cp-qr-scanner/cp-qr-scanner.module';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CpQrScannerModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss'
})
export class ScannerComponent {

  isShowScanner: boolean = true;
  
  scanComplete(event: any) {
    console.log(event);    
  }
}
