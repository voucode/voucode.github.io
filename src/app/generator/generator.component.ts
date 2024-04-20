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

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [MatFormFieldModule, MatDividerModule, MatExpansionModule, FormsModule, MatIconModule, MatInputModule, MatButtonModule, DragDropModule, DecimalPipe],
  templateUrl: './generator.component.html',
  styleUrl: './generator.component.scss'
})
export class GeneratorComponent implements OnInit {

  @ViewChild('voucherContainer') voucherContainer!: ElementRef;

  voucher = <any>{
    qrPosition: '0:0',
    qrSize: '120',
    ticks: <any>[]
  }

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.updateQrPosition()
  }

  onAddBackground() {
    this.voucher.backgroundImage = `https://lh3.google.com/u/0/d/${this.voucher.background}`
  }

  updateImageSize(event: any) {
    this.voucher.height = `${event?.target.height}`
    this.voucher.width = `${event?.target.width}`
    this.voucher.size = `${event?.target.width}x${event?.target.height}`
    this.cd.detectChanges()
  }

  updateQrPosition(event?: any) {
    if (event) {
      this.voucher.qrPosition = `${event?.event?.layerX - this.voucher.qrSize / 2}:${event?.event?.layerY - this.voucher.qrSize / 2}`
    } else {
      this.voucher.qrX = this.voucher.qrPosition.split(':')[0]
      this.voucher.qrY = this.voucher.qrPosition.split(':')[1]
    }
  }

  updateTickImage() {
    this.voucher.tickImage = `https://lh3.google.com/u/0/d/${this.voucher.tickId}`
  }

  uploadTick(event: any) {
    if (event?.target) {
      this.voucher.ticks.push({
        tickId: this.voucher.tickId,
        tickImage: this.voucher.tickImage,
        size: event?.target.width,
        x: 0,
        y: 0,
        position: '0:0'
      })
    }
    if (event == 'add') {
      this.voucher.ticks.push({
        tickId: this.voucher.tickId,
        tickImage: this.voucher.tickImage,
        size: this.voucher.ticks[0].size,
        x: 0,
        y: 0,
        position: '0:0'
      })
    }
    if (event.tickId) {
      event.tickId = event.tickId
      event.tickImage = `https://lh3.google.com/u/0/d/${event.tickId}`
      event.size = event.size
      event.x = event.x
      event.y = event.y
      event.position = `${event.x}:${event.y}`
    }

    console.log(this.voucher);

    this.cd.detectChanges()
  }
}
