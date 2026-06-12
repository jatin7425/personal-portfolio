import {
  IExperienceRepository,
  IProjectRepository,
  ISkillRepository,
  IBlogRepository,
  IContactRepository,
} from "../interfaces";
import { Experience, Project, SkillGroup, BlogPost, ContactMessage } from "../types";

export class PortfolioService {
  constructor(
    private experienceRepo: IExperienceRepository,
    private projectRepo: IProjectRepository,
    private skillRepo: ISkillRepository,
    private blogRepo: IBlogRepository,
    private contactRepo: IContactRepository
  ) {}

  async getExperiences(): Promise<Experience[]> {
    return this.experienceRepo.getAll();
  }

  async getProjects(): Promise<Project[]> {
    return this.projectRepo.getAll();
  }

  async getSkills(): Promise<SkillGroup[]> {
    return this.skillRepo.getAll();
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return this.blogRepo.getAll();
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return this.blogRepo.getBySlug(slug);
  }

  async submitContactMessage(email: string, message: string): Promise<ContactMessage> {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address provided.");
    }
    if (!message || message.trim().length < 5) {
      throw new Error("Message must be at least 5 characters long.");
    }
    return this.contactRepo.save({ email, message });
  }

  async getDashboardData() {
    const [experiences, projects, skills, blogPosts] = await Promise.all([
      this.getExperiences(),
      this.getProjects(),
      this.getSkills(),
      this.getBlogPosts(),
    ]);

    return {
      experiences,
      projects,
      skills,
      blogPosts,
    };
  }
}
