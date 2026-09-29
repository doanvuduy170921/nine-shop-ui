import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../../../core/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  constructor(private auth : AuthService,private router : Router) { }
  title = 'e-shop-admin';

  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }


  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  ngOnInit(): void {
  }
}
