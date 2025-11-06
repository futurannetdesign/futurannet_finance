import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Aguardar inicialização da autenticação
    await this.authService.waitForAuthInit();
    
    // isAuthenticated agora é async, precisa await
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Aguardar inicialização da autenticação
    await this.authService.waitForAuthInit();
    
    // isAuthenticated agora é async, precisa await
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const isAdmin = this.authService.isAdmin();
    
    if (!isAdmin) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}

