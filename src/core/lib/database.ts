import { PrismaClient } from '@prisma/client'

// Singleton pattern for PrismaClient in development
// This prevents creating multiple connections during hot reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prismaClient: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prismaClient = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prismaClient = global.prisma
}

// Export the full PrismaClient instance directly
// This provides access to ALL models and ALL standard Prisma methods
export const database = prismaClient

// Also export prismaClient for direct access if needed
export { prismaClient }

// Export types for convenience
export type { Prisma } from '@prisma/client'
