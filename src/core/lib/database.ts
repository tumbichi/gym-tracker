import { Prisma, PrismaClient, Routine } from "@prisma/client";
import { db as mockDb } from "./db";

// Try to create Prisma client, fall back to mock if it fails
let prismaClient: PrismaClient | null = null;

try {
  prismaClient = new PrismaClient();
} catch (error) {
  console.log("⚠️ Prisma client not available, using mock data");
}

// Hybrid database that tries Prisma first, falls back to mock
export const database = {
  exercise: {
    findMany: async (args?: Prisma.ExerciseFindManyArgs) => {
      try {
        if (prismaClient) {
          return await prismaClient.exercise.findMany({
            ...args,
            orderBy: args?.orderBy ? args.orderBy : { name: "asc" },
          });
        }
      } catch (error) {
        console.log("Using mock data for exercises");
      }
      return mockDb.exercise.findMany();
    },

    findUnique: async ({ where }: { where: { id: number } }) => {
      try {
        if (prismaClient) {
          return await prismaClient.exercise.findUnique({ where });
        }
      } catch (error) {
        console.log("Using mock data for exercise");
      }
      return mockDb.exercise.findUnique({ where });
    },

    create: async ({ data }: { data: any }) => {
      try {
        if (prismaClient) {
          return await prismaClient.exercise.create({ data });
        }
      } catch (error) {
        console.log("Using mock data for exercise creation");
      }
      return mockDb.exercise.create({ data });
    },

    update: async ({ where, data }: { where: { id: number }; data: any }) => {
      try {
        if (prismaClient) {
          return await prismaClient.exercise.update({ where, data });
        }
      } catch (error) {
        console.log("Using mock data for exercise update");
      }
      return mockDb.exercise.update({ where, data });
    },

    delete: async ({ where }: { where: { id: number } }) => {
      try {
        if (prismaClient) {
          return await prismaClient.exercise.delete({ where });
        }
      } catch (error) {
        console.log("Using mock data for exercise deletion");
      }
      return mockDb.exercise.delete({ where });
    },
  },

  workoutSession: {
    findMany: async ({
      include,
      where,
      select,
    }: { include?: any; where?: Prisma.WorkoutSessionWhereInput; select?: Prisma.WorkoutSessionSelect } = {}) => {
      try {
        if (prismaClient) {
          return await prismaClient.workoutSession.findMany({
            where,
            include: {
              routine: true,
              setEntries: {
                include: {
                  exercise: true,
                },
              },
            },
            orderBy: { date: "desc" },
          });
        }
      } catch (error) {
        console.log("Using mock data for workout sessions");
      }
      return mockDb.workoutSession.findMany({ include });
    },

    count: async ({ where }: { where?: any } = {}) => {
      try {
        if (prismaClient) {
          return await prismaClient.workoutSession.count({ where });
        }
      } catch (error) {
        console.log("Using mock data for session count");
      }
      return mockDb.workoutSession.count({ where });
    },
  },

  setEntry: {
    findMany: async ({ where, include }: { where?: any; include?: any } = {}) => {
      try {
        if (prismaClient) {
          return await prismaClient.setEntry.findMany({
            where,
            include: include || {
              exercise: true,
              workoutSession: true,
            },
            orderBy: { createdAt: "desc" },
          });
        }
      } catch (error) {
        console.log("Using mock data for set entries");
      }
      return mockDb.setEntry.findMany({ where, include });
    },

    aggregate: async ({ where, _sum }: { where?: any; _sum?: any } = {}) => {
      try {
        if (prismaClient) {
          return await prismaClient.setEntry.aggregate({ where, _sum });
        }
      } catch (error) {
        console.log("Using mock data for set entry aggregation");
      }
      return mockDb.setEntry.aggregate({ where, _sum });
    },

    groupBy: async ({ by, where }: Prisma.SetEntryGroupByArgs) => {
      try {
        if (prismaClient) {
          return await prismaClient.setEntry.groupBy({ by, where });
        }
      } catch (error) {
        console.log("Using mock data for set entry grouping");
      }
      return mockDb.setEntry.groupBy();
    },
  },

  routine: {
    findMany: async ({ include, ...restArgs }: Prisma.RoutineFindManyArgs = {}) => {
      try {
        if (prismaClient) {
          return await prismaClient.routine.findMany({
            ...restArgs,
            include: include
              ? include
              : {
                  days: {
                    include: {
                      items: {
                        include: {
                          exercise: true,
                        },
                      },
                    },
                  },
                },
          });
        }
      } catch (error) {
        console.log("Using mock data for routines");
      }
      return mockDb.routine.findMany();
    },

    findFirst: async ({ where, include }: { where?: any; include?: any } = {}) => {
      try {
        if (prismaClient) {
          return await prismaClient.routine.findFirst({ where, include });
        }
      } catch (error) {
        console.log("Using mock data for routine");
      }
      // Mock implementation for findFirst if needed
      const results = await mockDb.routine.findMany();
      return results.length > 0 ? results[0] : null;
    },
  },
};
