import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.tokenStorage.getRole();
    const token = this.tokenStorage.getToken();

    if (token && role === 'admin') {
      return true;
    }

    // không phải admin → về not-found
    this.router.navigate(['/not-found']);
    return false;
  }
}
