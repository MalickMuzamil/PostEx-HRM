import { Component } from '@angular/core';
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [Header, RouterOutlet, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
