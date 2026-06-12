import {
  IExperienceRepository,
  IProjectRepository,
  ISkillRepository,
  IBlogRepository,
} from "../interfaces";
import { Experience, Project, SkillGroup, BlogPost } from "../types";
import { runWithRedis } from "../redisClient";

// Cache expiration: 1 hour (3600 seconds)
const CACHE_TTL = 3600;

export class CachedExperienceRepository implements IExperienceRepository {
  constructor(private delegate: IExperienceRepository) {}

  async getAll(): Promise<Experience[]> {
    try {
      const cachedData = await runWithRedis(async (client) => {
        return await client.get("portfolio:experiences");
      });

      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.warn("[Redis Cache] Failed to read experiences, falling back to JSON:", error);
    }

    // Cache miss or Redis connection failure: fetch from file
    const data = await this.delegate.getAll();

    // Asynchronously try to populate the cache
    runWithRedis(async (client) => {
      await client.set("portfolio:experiences", JSON.stringify(data), {
        EX: CACHE_TTL,
      });
    }).catch((cacheError) => {
      console.warn("[Redis Cache] Failed to write experiences cache:", cacheError);
    });

    return data;
  }
}

export class CachedProjectRepository implements IProjectRepository {
  constructor(private delegate: IProjectRepository) {}

  async getAll(): Promise<Project[]> {
    try {
      const cachedData = await runWithRedis(async (client) => {
        return await client.get("portfolio:projects");
      });

      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.warn("[Redis Cache] Failed to read projects, falling back to JSON:", error);
    }

    const data = await this.delegate.getAll();

    runWithRedis(async (client) => {
      await client.set("portfolio:projects", JSON.stringify(data), {
        EX: CACHE_TTL,
      });
    }).catch((cacheError) => {
      console.warn("[Redis Cache] Failed to write projects cache:", cacheError);
    });

    return data;
  }
}

export class CachedSkillRepository implements ISkillRepository {
  constructor(private delegate: ISkillRepository) {}

  async getAll(): Promise<SkillGroup[]> {
    try {
      const cachedData = await runWithRedis(async (client) => {
        return await client.get("portfolio:skills");
      });

      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.warn("[Redis Cache] Failed to read skills, falling back to JSON:", error);
    }

    const data = await this.delegate.getAll();

    runWithRedis(async (client) => {
      await client.set("portfolio:skills", JSON.stringify(data), {
        EX: CACHE_TTL,
      });
    }).catch((cacheError) => {
      console.warn("[Redis Cache] Failed to write skills cache:", cacheError);
    });

    return data;
  }
}

export class CachedBlogRepository implements IBlogRepository {
  constructor(private delegate: IBlogRepository) {}

  async getAll(): Promise<BlogPost[]> {
    try {
      const cachedData = await runWithRedis(async (client) => {
        return await client.get("portfolio:blog_posts");
      });

      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.warn("[Redis Cache] Failed to read blog posts, falling back to JSON:", error);
    }

    const data = await this.delegate.getAll();

    runWithRedis(async (client) => {
      await client.set("portfolio:blog_posts", JSON.stringify(data), {
        EX: CACHE_TTL,
      });
    }).catch((cacheError) => {
      console.warn("[Redis Cache] Failed to write blog posts cache:", cacheError);
    });

    return data;
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const cachedData = await runWithRedis(async (client) => {
        return await client.get(`portfolio:blog_post:${slug}`);
      });

      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.warn(`[Redis Cache] Failed to read blog post ${slug}, falling back to JSON:`, error);
    }

    const data = await this.delegate.getBySlug(slug);

    if (data) {
      runWithRedis(async (client) => {
        await client.set(`portfolio:blog_post:${slug}`, JSON.stringify(data), {
          EX: CACHE_TTL,
        });
      }).catch((cacheError) => {
        console.warn(`[Redis Cache] Failed to write blog post ${slug} cache:`, cacheError);
      });
    }

    return data;
  }
}
