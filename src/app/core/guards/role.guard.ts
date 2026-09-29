import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { jwtDecode } from 'jwt-decode';
import {TokenStorageService} from "../services/token-storage.service";

interface JwtPayload {
  data: string;
  exp: number;
  iat: number;
  jti: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.tokenStorage.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const role = this.tokenStorage.getRole(); // Lấy role từ localStorage
      const allowedRoles = route.data['roles'] as Array<string>;

      // Nếu route không chỉ định roles thì cho phép
      if (!allowedRoles || allowedRoles.length === 0) {
        return true;
      }

      // Kiểm tra role có trong danh sách cho phép không
      if (allowedRoles.includes(<string>role)) {
        return true;
      }

      // Redirect về trang phù hợp với role
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'customer') {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }

      return false;
    } catch (error) {
      console.error('Error decoding token:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
