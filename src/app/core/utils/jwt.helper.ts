import {User} from "../models/auth.model";


export class JwtHelper {

  // Decode JWT token
  static decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decoded.exp);
      return expirationDate.valueOf() < new Date().valueOf();
    } catch (error) {
      return true;
    }
  }

  // Get token expiration date
  static getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }
      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      return date;
    } catch (error) {
      return null;
    }
  }

  // Extract user info from token
  static getUserFromToken(token: string): User | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        return null;
      }

      // Map decoded token to User interface
      // Điều chỉnh theo cấu trúc JWT token của backend bạn
      return {
        id: decoded.id || decoded.sub || decoded.user_id,
        email: decoded.email,
        role: decoded.role || decoded.user_role,
        firstName: decoded.first_name || decoded.firstName,
        lastName: decoded.last_name || decoded.lastName,
        exp: decoded.exp,
        iat: decoded.iat
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }
}
