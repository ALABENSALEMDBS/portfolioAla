import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isFixed = false;
  isVisible = true;
  lastScrollY = 0;

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 50) {
      this.isFixed = true;
      // Si scroll vers le bas, cacher le header
      if (currentScrollY > this.lastScrollY) {
        this.isVisible = false;
      } 
      // Si scroll vers le haut, afficher le header
      else if (currentScrollY < this.lastScrollY) {
        this.isVisible = true;
      }
    } else {
      this.isFixed = false;
      this.isVisible = true;
    }
    
    this.lastScrollY = currentScrollY;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
