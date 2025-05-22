import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

// Create a Redis client with connection handling
let redis;
try {
  redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379", // Adjust if necessary
    legacyMode: true, // Set to true for v3 compatibility
  });

  // Enable better debugging
  console.log("Redis client initialized");

  // Error handling
  redis.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  // Add connection ready event
  redis.on("ready", () => {
    console.log("Redis client connected successfully");
  });
} catch (err) {
  console.error("Failed to create Redis client:", err);
}

// Ensure Prisma is properly initialized
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // Add logging to help with debugging
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const db = prisma;

// Helper to safely execute Redis operations
const safeRedisOperation = async (
  operation: () => Promise<any>,
  fallback: any = null
) => {
  if (!redis) return fallback;

  try {
    return await operation();
  } catch (error) {
    console.error("Redis operation failed:", error);
    return fallback;
  }
};

// Helper to fetch from Redis or fallback to DB with improved error handling
const getFromCacheOrDb = async <T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  console.log(`Attempting to get data for key: ${key}`);

  // Try to get from Redis first
  const cachedData = await safeRedisOperation(async () => {
    return new Promise((resolve, reject) => {
      redis.get(key, (err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });
  });

  if (cachedData) {
    console.log(`Cache hit for key: ${key}`);
    try {
      return JSON.parse(cachedData) as T;
    } catch (e) {
      console.error(`Error parsing cached data for key ${key}:`, e);
      // If parsing fails, fall through to DB query
    }
  }

  // Cache miss or error, fetch from DB
  console.log(`Cache miss for key: ${key}, fetching from DB`);
  const dbData = await fetchFn();

  // Try to store in Redis
  await safeRedisOperation(async () => {
    return new Promise((resolve, reject) => {
      redis.set(key, JSON.stringify(dbData), "EX", 600, (err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });
  });

  console.log(`Data stored in cache for key: ${key}`);
  return dbData;
};

export async function getProjectsByUser(userId: string) {
  console.log(`Getting projects for user: ${userId}`);
  const cacheKey = `projects:${userId}`;

  try {
    return await getFromCacheOrDb(cacheKey, async () => {
      console.log("Fetching projects directly from DB");
      const projects = await db.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      console.log(`Found ${projects.length} projects in DB`);
      return projects;
    });
  } catch (error) {
    console.error(`Error in getProjectsByUser for userId ${userId}:`, error);
    // Fall back to direct DB query on any error
    return db.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export async function getRecentScansByUser(userId: string) {
  console.log(`Getting recent scans for user: ${userId}`);
  const cacheKey = `recentScans:${userId}`;

  try {
    return await getFromCacheOrDb(cacheKey, async () => {
      console.log("Fetching recent scans directly from DB");
      const scans = await db.scan.findMany({
        where: {
          project: {
            userId: userId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });
      console.log(`Found ${scans.length} recent scans in DB`);
      return scans;
    });
  } catch (error) {
    console.error(`Error in getRecentScansByUser for userId ${userId}:`, error);
    // Fall back to direct DB query on any error
    return db.scan.findMany({
      where: {
        project: {
          userId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });
  }
}
