import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Rotas que requerem autenticação
const protectedRoutes = ['/perfil', '/cadastro'];
// Rotas de autenticação (usuários logados não podem acessar)
const authRoutes = ['/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  
  // Verificar se é uma rota protegida
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      const payload = await verifyToken(token);
      if (!payload) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }
  
  // Rotas de autenticação (se já estiver logado, redireciona para home)
  if (authRoutes.includes(pathname) && token) {
    try {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Token inválido, permitir acesso à página de login
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/perfil/:path*', '/cadastro/:path*', '/login'],
};