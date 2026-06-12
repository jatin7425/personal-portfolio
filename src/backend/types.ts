export interface Experience {
  id: string;
  when: string;
  role: string;
  org: string;
  bullets: string[];
}

export interface Project {
  id: string;
  meta: string;
  title: string;
  description: string;
  metric: string;
  chips: string[];
}

export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  desc: string;
  tags: string[];
  content: string;
  url?: string;
}

export interface ContactMessage {
  id: string;
  email: string;
  message: string;
  createdAt: string;
}
