import {
  JsonExperienceRepository,
  JsonProjectRepository,
  JsonSkillRepository,
  JsonBlogRepository,
  JsonContactRepository,
} from "./repositories/jsonRepositories";
import { ContentfulBlogRepository } from "./repositories/contentfulBlogRepository";
import { PortfolioService } from "./services/portfolioService";

// Simple Singleton cache for our service and repositories
let portfolioServiceInstance: PortfolioService | null = null;

export function getPortfolioService(): PortfolioService {
  if (!portfolioServiceInstance) {
    const experienceRepo = new JsonExperienceRepository();
    const projectRepo = new JsonProjectRepository();
    const skillRepo = new JsonSkillRepository();
    const contactRepo = new JsonContactRepository();

    // Conditionally load blog posts from Contentful if credentials are configured
    const isContentfulConfigured =
      !!process.env.CONTENTFUL_SPACE_ID && !!process.env.CONTENTFUL_ACCESS_TOKEN;

    const blogRepo = isContentfulConfigured
      ? new ContentfulBlogRepository()
      : new JsonBlogRepository();

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

