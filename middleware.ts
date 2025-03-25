import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
})

export const config = {
  matcher: [
    '/categories/:path*',
    '/transactions/:path*',
    '/api/categories/:path*',
    '/api/transactions/:path*',
    '/api/stats/:path*',
  ],
} 