import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RoutePath } from '../app.routes';

/**
 * Guard for routes requiring authentication.
 * Reference: https://github.com/auth0/auth0-angular/blob/main/projects/auth0-angular/src/lib/auth.guard.ts
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  canActivate(): Observable<boolean> {
    return this.redirectIfUnauthenticated();
  }

  private redirectIfUnauthenticated(): Observable<boolean> {
    return this.auth.isAuthenticated$.pipe(
      tap((loggedIn) => {
        if (!loggedIn) {
          this.router.navigate([RoutePath.LOGIN]);
        }
      }),
    );
  }
}
