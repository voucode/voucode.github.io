import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './pipe/safe.pipe';
import { SearchCustomerByKeyWordPipe } from '../customer/searchCustomerByKeyWord.pipe';



@NgModule({
  declarations: [SafePipe,
    SearchCustomerByKeyWordPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafePipe,
    SearchCustomerByKeyWordPipe
  ]
})
export class SharedModule { }
