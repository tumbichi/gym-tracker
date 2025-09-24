import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

try {
  // Test if Prisma client is available
  const testClient = new PrismaClient()
  testClient.$disconnect()
} catch (error) {
  console.error("❌ Prisma client not generated. Run: npx prisma generate")
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
