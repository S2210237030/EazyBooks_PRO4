import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth-service.service';

/**
 * AuthGuard is a route guard that checks if a user is logged in
 * before allowing access to a route. If the user is not logged in,
 * it can redirect them to a sign-in page.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Checks if the user can activate the route.
   * 
   * @param route - The route that is being activated.
   * @param state - The current router state.
   * @returns An observable that emits a boolean value or a UrlTree.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.isUserLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          console.log('User is logged in');
          return true;
        } else {
          // return this.router.createUrlTree(['/signin']);
          return false;
        }
      })
    );
  }
}
