import { Routes } from '@angular/router';
import { HomeComponent } from './frontOffice/home/home.component';
import { HeaderComponent } from './frontOffice/header/header.component';
import { FooterComponent } from './frontOffice/footer/footer.component';
import { ProjectsComponent } from './frontOffice/projects/projects.component';
import { ContactComponent } from './frontOffice/contact/contact.component';
import { AboutComponent } from './frontOffice/about/about.component';

export const routes: Routes = [

    { path: '', redirectTo: 'home', pathMatch: 'full' },

  {path:'home',component:HomeComponent},
  {path:'footer',component:FooterComponent},
  {path:'header',component:HeaderComponent},
  {path:'projects',component:ProjectsComponent},
  {path:'contact',component:ContactComponent},
  {path:'about',component:AboutComponent},




];
