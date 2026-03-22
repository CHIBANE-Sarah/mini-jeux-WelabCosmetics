import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';  // ← ajoute RouterModule
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],  // ← ajoute RouterModule ici
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  login = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.login || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.login, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Identifiants incorrects';
      }
    });
  }
}