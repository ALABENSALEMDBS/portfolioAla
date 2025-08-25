import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  displayText = '';
  private texts = ['I\'M A DEVELOPER', 'I\'M A SOFTWARE ENGINEER'];
  private currentIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingSpeed = 150;
  private deletingSpeed = 100;
  private pauseTime = 2000;
  private interval: any;

  ngOnInit() {
    this.typeText();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearTimeout(this.interval);
    }
  }

  private typeText() {
    const currentText = this.texts[this.currentIndex];
    
    if (this.isDeleting) {
      this.displayText = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.displayText = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    let typeSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    if (!this.isDeleting && this.charIndex === currentText.length) {
      typeSpeed = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.currentIndex = (this.currentIndex + 1) % this.texts.length;
    }

    this.interval = setTimeout(() => this.typeText(), typeSpeed);
  }
}
