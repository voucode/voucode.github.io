import { Routes } from '@angular/router';
import { ScannerComponent } from './scanner/scanner.component';
import { VoucherComponent } from './voucher/voucher.component';
import { GeneratorComponent } from './generator/generator.component';
import { RegisterComponent } from './register/register.component';
import { GoogleDriveCorrectLinkComponent } from './google-drive-correct-link/google-drive-correct-link.component';
import { CustomerComponent } from './customer/customer.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {
        path: '',
        component: ScannerComponent
    },
    {
        path: 'khuyen-mai',
        component: VoucherComponent
    },
    {
        path: 'tao',
        component: GeneratorComponent
    },
    {
        path: 'dang-ky',
        component: RegisterComponent
    },
    {
        path: 'dang-ky',
        component: RegisterComponent
    },
    {
        path: 'dang-nhap',
        component: LoginComponent
    },
    {
        path: 'google-drive-correct-link',
        component: GoogleDriveCorrectLinkComponent
    },
    {
        path: 'khach-hang',
        component: CustomerComponent,
        canActivate: []
    }
];
