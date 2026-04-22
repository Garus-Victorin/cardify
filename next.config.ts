import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', '@react-pdf/renderer'],
  devIndicators: {
    position: 'bottom-right',
  },
}

export default nextConfig
