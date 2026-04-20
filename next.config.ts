import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['@prisma/client', 'bcryptjs', '@react-pdf/renderer'],
}

export default nextConfig
