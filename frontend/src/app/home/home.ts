import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Review, ReviewService } from '../core/services/review.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  reviews: Review[] = [];

  constructor(
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.reviewService.latest().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviews = [];
        this.cdr.detectChanges();
      },
    });
  }

  getStars(note: number): number[] {
    return Array.from({ length: Number(note) || 0 }, (_, i) => i);
  }
}
