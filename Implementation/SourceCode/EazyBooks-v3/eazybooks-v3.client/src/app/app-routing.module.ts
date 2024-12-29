import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AuthGuard } from './services/auth.guard';
import { MainSiteComponent } from './main-site/main-site.component';
import { DashboardComponent } from './dashboard/dashboard.component';

/**
 * Defines the routes for the application.
 * The routes include paths for signing in, signing up, the main site, and the dashboard.
 */
const routes: Routes = [
  /**
   * Route for the sign-in page.
   */
  { path: 'signin', component: SignInComponent },

  /**
   * Route for the sign-up page.
   */
  { path: 'signup', component: SignUpComponent },

  /**
   * Route for the main site, protected by the AuthGuard.
   */
  { path: 'main', component: MainSiteComponent, canActivate: [AuthGuard] },

  /**
   * Route for the dashboard, protected by the AuthGuard.
   */
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
/**
 * Configures the routing for the application using the defined routes.
 */
export class AppRoutingModule { }
