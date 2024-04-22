import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-google-drive-correct-link',
  standalone: true,
  imports: [MatFormFieldModule, MatButtonModule, MatIconModule, MatInputModule, FormsModule],
  templateUrl: './google-drive-correct-link.component.html',
  styleUrl: './google-drive-correct-link.component.scss'
})
export class GoogleDriveCorrectLinkComponent {

  inputValue: any;
  sharedLink: any;

  getLink() {
    if (this.inputValue.includes('http')) {
      this.inputValue = this.inputValue?.split('d/')[1]?.split('/')[0]
    }
    this.sharedLink = `https://lh3.google.com/u/0/d/${this.inputValue}`
  }

}
