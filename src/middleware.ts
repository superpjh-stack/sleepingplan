import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/record/:path*',
    '/analytics/:path*',
    '/coaching/:path*',
    '/settings/:path*',
  ],
}
