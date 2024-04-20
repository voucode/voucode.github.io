import { Routes } from '@angular/router';
import { ScannerComponent } from './scanner/scanner.component';
import { VoucherComponent } from './voucher/voucher.component';
import { GeneratorComponent } from './generator/generator.component';

export const routes: Routes = [
    {
        path: '',
        component: ScannerComponent
    },
    {
        path: 'voucher',
        component: VoucherComponent
    },
    {
        path: 'tao',
        component: GeneratorComponent
    }
];
