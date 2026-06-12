import { createClient } from "redis";

/**
 * Executes a callback block with a connected Redis client instance.
 * Automatically handles connecting, error bubbling, and disconnecting.
 * If the connection fails or an error occurs, it throws the error so that
 * decorators can catch it and fall back to the underlying repository gracefully.
 */
export async function runWithRedis<T>(
  action: (client: any) => Promise<T>
): Promise<T> {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy(retries) {
        // Fail fast if Redis is unreachable to avoid hanging the API
        if (retries >= 1) {
          return new Error("Redis connection refused or timed out.");
        }
        return 200; // Retry once after 200ms
      },
    },
  });

  client.on("error", (err) => {
    // Console log the error, but let client operations manage execution
    console.error("Redis client internal error:", err);
  });

  await client.connect();

  try {
    return await action(client);
  } finally {
    try {
      await client.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from Redis client:", disconnectError);
    }
  }
}
