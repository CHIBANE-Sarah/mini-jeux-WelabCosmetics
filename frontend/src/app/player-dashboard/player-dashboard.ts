import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-dashboard.html',
  styleUrls: ['./player-dashboard.css'],
})
export class PlayerDashboardComponent implements OnInit {
  player: any = null;
  participations: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('welab.participant');
    if (stored) {
      this.player = JSON.parse(stored);
    }

    this.loadHistory();
  }

  loadHistory(): void {
    this.http.get<any[]>('http://localhost:8000/api/participation').subscribe({
      next: (data) => {
        const fullName = `${this.player?.prenom || ''} ${this.player?.nom || ''}`.trim().toLowerCase();

        this.participations = data
          .filter((p) => (p.userName || '').trim().toLowerCase() === fullName)
          .sort((a, b) => Number(b.id) - Number(a.id));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get bestScore(): number {
    if (this.participations.length === 0) return 0;
    return Math.max(...this.participations.map((p) => Number(p.scoreTotal) || 0));
  }

  get averageScore(): number {
    if (this.participations.length === 0) return 0;
    const total = this.participations.reduce((sum, p) => sum + (Number(p.scoreTotal) || 0), 0);
    return Math.round(total / this.participations.length);
  }

  formatSeconds(seconds: number): string {
    const value = Number(seconds) || 0;
    const min = Math.floor(value / 60);
    const sec = value % 60;
    return `${min}m ${sec.toString().padStart(2, '0')}s`;
  }

  goJoin(): void {
    this.router.navigate(['/join']);
  }
}
