// src/app/session/session.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService, Session } from '../core/services/session.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session.html',
  styleUrls: ['./session.css']
})
export class SessionComponent implements OnInit {
  session: Session | null = null;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.loadSession(code);
    }
  }

  loadSession(code: string): void {
    this.isLoading = true;
    this.sessionService.getSessionByCode(code).subscribe({
      next: (session) => {
        this.session = session;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Session non trouvée';
        this.isLoading = false;
      }
    });
  }

  copyCode(): void {
    if (this.session) {
      navigator.clipboard.writeText(this.session.code);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}