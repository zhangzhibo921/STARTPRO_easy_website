/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  images: {
    domains: ['localhost', '10.1.1.55']
  },
  async rewrites() {
    return [
      { source: '/about', destination: '/pages/about' },
      { source: '/services', destination: '/pages/services' },
      { source: '/contact', destination: '/pages/contact' },
      { source: '/api/:path*', destination: 'http://localhost:3003/api/:path*' },
      { source: '/assets/:path*', destination: 'http://localhost:3003/assets/:path*' }
    ]
  }
}

module.exports = nextConfig
