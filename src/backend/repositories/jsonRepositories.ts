import fs from "fs/promises";
import path from "path";
import {
  IExperienceRepository,
  IProjectRepository,
  ISkillRepository,
  IBlogRepository,
  IContactRepository,
} from "../interfaces";
import { Experience, Project, SkillGroup, BlogPost, ContactMessage } from "../types";

// DB structure helper
interface DatabaseSchema {
  experiences: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  blogPosts: BlogPost[];
  contactMessages: ContactMessage[];
}

export class JsonRepositoryBase {
  protected filePath: string;

  constructor() {
    // Determine path dynamically based on project root
    this.filePath = path.join(process.cwd(), "src", "backend", "data", "db.json");
  }

  protected async readDb(): Promise<DatabaseSchema> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading JSON database:", error);
      return {
        experiences: [],
        projects: [],
        skills: [],
        blogPosts: [],
        contactMessages: [],
      };
    }
  }

  protected async writeDb(data: DatabaseSchema): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing to JSON database:", error);
    }
  }
}

export class JsonExperienceRepository extends JsonRepositoryBase implements IExperienceRepository {
  async getAll(): Promise<Experience[]> {
    const db = await this.readDb();
    return db.experiences;
  }
}

export class JsonProjectRepository extends JsonRepositoryBase implements IProjectRepository {
  async getAll(): Promise<Project[]> {
    const db = await this.readDb();
    return db.projects;
  }
}

export class JsonSkillRepository extends JsonRepositoryBase implements ISkillRepository {
  async getAll(): Promise<SkillGroup[]> {
    const db = await this.readDb();
    return db.skills;
  }
}

export class JsonBlogRepository extends JsonRepositoryBase implements IBlogRepository {
  async getAll(): Promise<BlogPost[]> {
    const db = await this.readDb();
    return db.blogPosts;
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const db = await this.readDb();
    const post = db.blogPosts.find((p) => p.slug === slug);
    return post || null;
  }
}

export class JsonContactRepository extends JsonRepositoryBase implements IContactRepository {
  async save(message: Omit<ContactMessage, "id" | "createdAt">): Promise<ContactMessage> {
    const db = await this.readDb();
    const newMessage: ContactMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    db.contactMessages.push(newMessage);
    await this.writeDb(db);
    return newMessage;
  }

  async getAll(): Promise<ContactMessage[]> {
    const db = await this.readDb();
    return db.contactMessages;
  }
}
