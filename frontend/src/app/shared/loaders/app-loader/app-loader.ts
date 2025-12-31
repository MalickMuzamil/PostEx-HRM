import { Component } from '@angular/core';
import { UiLoaderService } from '../../../core/services/ui-loader-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-loader',
  imports: [CommonModule],
  templateUrl: './app-loader.html',
  styleUrl: './app-loader.css',
})
export class AppLoader {
  constructor(public ui: UiLoaderService) {}
}
