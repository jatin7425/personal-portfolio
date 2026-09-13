import { IBlogRepository } from "../interfaces";
import { BlogPost } from "../types";

/**
 * Recursively parses Contentful Rich Text nodes into a simple Markdown-like string.
 */
function renderContentfulRichText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;

  if (node.nodeType === "text") {
    let text = node.value || "";
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") text = `**${text}**`;
        if (mark.type === "italic") text = `*${text}*`;
        if (mark.type === "code") text = `\`${text}\``;
      }
    }
    return text;
  }

  const childrenContent = node.content
    ? node.content.map((child: any) => renderContentfulRichText(child)).join("")
    : "";

  switch (node.nodeType) {
    case "document":
      return childrenContent;
    case "paragraph":
      return `\n\n${childrenContent}\n\n`;
    case "heading-1":
      return `\n\n# ${childrenContent}\n\n`;
    case "heading-2":
      return `\n\n## ${childrenContent}\n\n`;
    case "heading-3":
      return `\n\n### ${childrenContent}\n\n`;
    case "blockquote":
      return `\n\n> ${childrenContent.trim().split("\n").join("\n> ")}\n\n`;
    case "unordered-list":
      return `\n${childrenContent}\n`;
    case "ordered-list":
      return `\n${childrenContent}\n`;
    case "list-item":
      // Clean up whitespace inside bullet points
      return `- ${childrenContent.trim()}\n`;
    case "hr":
      return `\n\n---\n\n`;
    default:
      return childrenContent;
  }
}

export class ContentfulBlogRepository implements IBlogRepository {
  private spaceId: string;
  private accessToken: string;
  private environmentId: string;
  private contentType: string;

  constructor() {
    this.spaceId = process.env.CONTENTFUL_SPACE_ID || "";
    this.accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || "";
    this.environmentId = process.env.CONTENTFUL_ENVIRONMENT || "master";
    this.contentType = process.env.CONTENTFUL_CONTENT_TYPE || "blogPost";
  }

  private transformEntry(item: any): BlogPost {
    const fields = item.fields || {};
    const sys = item.sys || {};

    const slug = fields.slug || sys.id || "";
    const title = fields.title || "Untitled Post";
    
    let date = fields.date || fields.publishDate || sys.createdAt || new Date().toISOString();
    if (date.includes("T")) {
      date = date.split("T")[0]; // YYYY-MM-DD format
    }

    const desc = fields.desc || fields.description || fields.excerpt || "";
    const tags = Array.isArray(fields.tags) ? fields.tags : [];

    // Parse Content: supports both markdown text fields and rich text fields
    let content = "";
    const rawContent = fields.content || fields.body || "";
    if (typeof rawContent === "string") {
      content = rawContent;
    } else if (rawContent && typeof rawContent === "object") {
      content = renderContentfulRichText(rawContent);
    }

    const url = fields.url || undefined;

    return {
      slug,
      title,
      date,
      desc,
      tags,
      content,
      url,
    };
  }

  async getAll(): Promise<BlogPost[]> {
    if (!this.spaceId || !this.accessToken) {
      console.warn("[ContentfulBlogRepository] Credentials not configured. Returning empty posts.");
      return [];
    }

    try {
      const url = `https://cdn.contentful.com/spaces/${this.spaceId}/environments/${this.environmentId}/entries?access_token=${this.accessToken}&content_type=${this.contentType}&order=-sys.createdAt`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Contentful returned status ${response.status}`);
      }
      
      const data = await response.json();
      const items = data.items || [];
      return items.map((item: any) => this.transformEntry(item));
    } catch (error) {
      console.error("[ContentfulBlogRepository] Error fetching posts:", error);
      return [];
    }
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (!this.spaceId || !this.accessToken) {
      return null;
    }

    try {
      const url = `https://cdn.contentful.com/spaces/${this.spaceId}/environments/${this.environmentId}/entries?access_token=${this.accessToken}&content_type=${this.contentType}&fields.slug=${encodeURIComponent(slug)}&limit=1`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Contentful returned status ${response.status}`);
      }
      
      const data = await response.json();
      const items = data.items || [];
      if (items.length === 0) return null;
      return this.transformEntry(items[0]);
    } catch (error) {
      console.error(`[ContentfulBlogRepository] Error fetching post by slug ${slug}:`, error);
      return null;
    }
  }
}
