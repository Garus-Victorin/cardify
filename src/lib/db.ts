import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function buildClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL manquant dans .env')
  const adapter = new PrismaNeonHttp(url)
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? buildClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
