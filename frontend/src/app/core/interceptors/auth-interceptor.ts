// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = [
  '/api/login',
  '/api/session/',
  '/api/association'
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    const isPublic = PUBLIC_ENDPOINTS.some(url => req.url.includes(url));
    if (!token || isPublic) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next.handle(authReq);
  }
}