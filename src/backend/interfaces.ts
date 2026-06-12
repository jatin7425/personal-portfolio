import { Experience, Project, SkillGroup, BlogPost, ContactMessage } from "./types";

export interface IExperienceRepository {
  getAll(): Promise<Experience[]>;
}

export interface IProjectRepository {
  getAll(): Promise<Project[]>;
}

export interface ISkillRepository {
  getAll(): Promise<SkillGroup[]>;
}

export interface IBlogRepository {
  getAll(): Promise<BlogPost[]>;
  getBySlug(slug: string): Promise<BlogPost | null>;
}

export interface IContactRepository {
  save(message: Omit<ContactMessage, "id" | "createdAt">): Promise<ContactMessage>;
  getAll(): Promise<ContactMessage[]>;
}
