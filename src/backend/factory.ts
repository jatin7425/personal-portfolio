import {
  JsonExperienceRepository,
  JsonProjectRepository,
  JsonSkillRepository,
  JsonBlogRepository,
  JsonContactRepository,
} from "./repositories/jsonRepositories";
import {
  CachedExperienceRepository,
  CachedProjectRepository,
  CachedSkillRepository,
  CachedBlogRepository,
} from "./repositories/cachedRepositories";
import { PortfolioService } from "./services/portfolioService";

// Simple Singleton cache for our service and repositories
let portfolioServiceInstance: PortfolioService | null = null;

export function getPortfolioService(): PortfolioService {
  if (!portfolioServiceInstance) {
    const rawExperienceRepo = new JsonExperienceRepository();
    const rawProjectRepo = new JsonProjectRepository();
    const rawSkillRepo = new JsonSkillRepository();
    const rawBlogRepo = new JsonBlogRepository();
    const contactRepo = new JsonContactRepository();

    // Wrap repositories with caching decorators
    const experienceRepo = new CachedExperienceRepository(rawExperienceRepo);
    const projectRepo = new CachedProjectRepository(rawProjectRepo);
    const skillRepo = new CachedSkillRepository(rawSkillRepo);
    const blogRepo = new CachedBlogRepository(rawBlogRepo);

    portfolioServiceInstance = new PortfolioService(
      experienceRepo,
      projectRepo,
      skillRepo,
      blogRepo,
      contactRepo
    );
  }

  return portfolioServiceInstance;
}
