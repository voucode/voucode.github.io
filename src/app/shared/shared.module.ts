import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './pipe/safe.pipe';
import { SearchCustomerByKeyWordPipe } from '../customer/searchCustomerByKeyWord.pipe';
import { SearchCustomerVoucherByKeyWordPipe } from '../voucher/searchCustomerVoucherByKeyWord.pipe';



@NgModule({
  declarations: [
    SafePipe,
    SearchCustomerByKeyWordPipe,
    SearchCustomerVoucherByKeyWordPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafePipe,
    SearchCustomerByKeyWordPipe,
    SearchCustomerVoucherByKeyWordPipe
  ]
})
export class SharedModule { }
