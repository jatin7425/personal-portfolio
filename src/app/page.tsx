"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { Experience, Project, SkillGroup, BlogPost } from "@/backend/types";

const EXTERNAL_BLOG_URL = "https://medium.com/@jatin7425";

// Terminal script types
type LineKind = "p" | "ok" | "raw" | "kv" | "arr";
type TerminalLine = [LineKind, string, (string | string[])?];

const TERMINAL_LINES: TerminalLine[] = [
  ["p", "$ curl -s https://jatin.dev/api/v1/me"],
  ["p", ""],
  ["ok", "HTTP/2 200 OK"],
  ["p", "content-type: application/json"],
  ["p", ""],
  ["raw", "{"],
  ["kv", '  "name"', ' "Jatin Vishwakarma"'],
  ["kv", '  "role"', ' "Backend Engineer"'],
  ["kv", '  "experience"', ' "1.5 years · intern → ASE"'],
  ["arr", '  "stack"', ["Python", "FastAPI", "Node.js", "PostgreSQL", "Docker"]],
  ["kv", '  "location"', ' "Valsad, IN \uD83C\uDDEE\uD83C\uDDF3"'],
  ["kv", '  "currently"', ' "shipping & writing"'],
  ["kv", '  "status"', ' "open_to_work"'],
  ["raw", "}"],
];

export default function HomePage() {
  // Data States loaded from Backend APIs
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Terminal Simulation State
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalIndex, setTerminalIndex] = useState(0);

  // Form States
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Intersection Observer for scroll reveal
  const revealElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Fetch backend-driven data
  useEffect(() => {
    async function loadData() {
      try {
        const [expRes, projRes, skillRes, blogRes] = await Promise.all([
          fetch("/api/experience"),
          fetch("/api/projects"),
          fetch("/api/skills"),
          fetch("/api/blog"),
        ]);

        if (expRes.ok) setExperiences(await expRes.json());
        if (projRes.ok) setProjects(await projRes.json());
        if (skillRes.ok) setSkills(await skillRes.json());
        if (blogRes.ok) setBlogPosts(await blogRes.json());
      } catch (err) {
        console.error("Failed to load portfolio backend data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Terminal Typing Animation
  useEffect(() => {
    if (terminalIndex >= TERMINAL_LINES.length) return;

    const currentLine = TERMINAL_LINES[terminalIndex];
    const delay =
      currentLine[0] === "p" && !currentLine[1]
        ? 120
        : currentLine[0] === "p"
        ? 350
        : 180;

    const timer = setTimeout(() => {
      setTerminalLines((prev) => [...prev, currentLine]);
      setTerminalIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [terminalIndex]);

  // Scroll reveal setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [experiences, projects, skills, blogPosts, isLoading]);

  // Contact Form handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSubmitSuccess("Thank you! Your message has been received.");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTerminalLine = (line: TerminalLine, index: number) => {
    const [kind, key, val] = line;
    if (kind === "p") {
      return (
        <div key={index} className={styles.p}>
          {key}
        </div>
      );
    }
    if (kind === "ok") {
      return (
        <div key={index} className={styles.ok}>
          {key}
        </div>
      );
    }
    if (kind === "raw") {
      return <div key={index}>{key}</div>;
    }
    if (kind === "kv") {
      return (
        <div key={index}>
          <span className={styles.k}>{key}</span>:
          <span className={styles.s}>{val as string}</span>,
        </div>
      );
    }
    if (kind === "arr") {
      const items = val as string[];
      return (
        <div key={index}>
          <span className={styles.k}>{key}</span>: [
          {items.map((item, idx) => (
            <span key={idx}>
              <span className={styles.s}>&quot;{item}&quot;</span>
              {idx < items.length - 1 ? ", " : ""}
            </span>
          ))}
          ],
        </div>
      );
    }
    return null;
  };

  const formatBlogDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* HEADER NAVBAR */}
      <nav className={styles.nav}>
        <div className={`${styles.wrap} ${styles.navWrap}`}>
          <a className={styles.brand} href="#top">
            jatin7425<span className={styles.cursor}>_</span>
          </a>
          <div className={styles.links}>
            <a href="#experience" className={styles.hideS}>
              /experience
            </a>
            <a href="#projects" className={styles.hideS}>
              /projects
            </a>
            <a href="#skills" className={styles.hideS}>
              /skills
            </a>
            <a href={EXTERNAL_BLOG_URL} target="_blank" rel="noopener noreferrer">/blog</a>
            <a href="#contact" className={styles.cta}>
              /contact
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <span className={styles.badge}>
              <span className={styles.dot}></span>status: open_to_work
            </span>
            <h1>
              I build the <em>backend</em> your product depends on.
            </h1>
            <p className={styles.lede}>
              I&apos;m Jatin Vishwakarma — a backend-leaning full-stack engineer from Valsad, India. I
              design APIs, payment flows, RBAC systems and data pipelines with Python, FastAPI, Node.js
              and PostgreSQL — then ship them in Docker.
            </p>
            <div className={styles.heroCta}>
              <a className={`${styles.btn} ${styles.primary}`} href="#contact">
                → Hire me
              </a>
              <a
                className={styles.btn}
                href="https://github.com/jatin7425"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                className={styles.btn}
                href="https://linkedin.com/in/jatin7425"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Terminal Card */}
          <div
            className={`${styles.term} reveal`}
            ref={(el) => {
              if (el) revealElementsRef.current.set("hero-term", el);
            }}
          >
            <div className={styles.bar}>
              <i></i>
              <i></i>
              <i></i>
              <span>curl — zsh</span>
            </div>
            <pre className={styles.termPre}>
              {terminalLines.map((line, idx) => renderTerminalLine(line, idx))}
              {terminalIndex < TERMINAL_LINES.length && (
                <span className={styles.cursor}>▋</span>
              )}
            </pre>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section
        id="experience"
        className={styles.section}
        ref={(el) => {
          if (el) revealElementsRef.current.set("sec-experience", el);
        }}
      >
        <div className={styles.wrap}>
          <div className={`${styles.endpoint} reveal`}>
            <span className={styles.verb}>GET</span>
            <span className={styles.path}>/experience</span>
            <span className={styles.rule}></span>
            <span className={styles.status}>200 OK · 1.5 yrs</span>
          </div>

          <div className={styles.xp}>
            {isLoading ? (
              // Loading Skeleton
              <div style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Loading backend resources...
              </div>
            ) : (
              experiences.map((exp) => (
                <div
                  key={exp.id}
                  className={`${styles.xpItem} reveal`}
                  ref={(el) => {
                    if (el) revealElementsRef.current.set(exp.id, el);
                  }}
                >
                  <div className={styles.when}>{exp.when}</div>
                  <h3>{exp.role}</h3>
                  <div className={styles.org}>{exp.org}</div>
                  <ul>
                    {exp.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: bullet }}
                      />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section
        id="projects"
        className={styles.section}
        ref={(el) => {
          if (el) revealElementsRef.current.set("sec-projects", el);
        }}
      >
        <div className={styles.wrap}>
          <div className={`${styles.endpoint} reveal`}>
            <span className={styles.verb}>GET</span>
            <span className={styles.path}>/projects</span>
            <span className={styles.rule}></span>
            <span className={styles.status}>
              200 OK · {projects.length} result{projects.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className={styles.cards}>
            {isLoading ? (
              <div style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Resolving data access contracts...
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`${styles.card} reveal`}
                  ref={(el) => {
                    if (el) revealElementsRef.current.set(project.id, el);
                  }}
                >
                  <div className={styles.cardMeta}>{project.meta}</div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className={styles.metric}>{project.metric}</div>
                  <div className={styles.chips}>
                    {project.chips.map((chip, idx) => (
                      <span key={idx} className={styles.chip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section
        id="skills"
        className={styles.section}
        ref={(el) => {
          if (el) revealElementsRef.current.set("sec-skills", el);
        }}
      >
        <div className={styles.wrap}>
          <div className={`${styles.endpoint} reveal`}>
            <span className={styles.verb}>GET</span>
            <span className={styles.path}>/skills</span>
            <span className={styles.rule}></span>
            <span className={styles.status}>200 OK</span>
          </div>

          <div className={styles.skillTable}>
            {isLoading ? (
              <div style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Streaming system definitions...
              </div>
            ) : (
              skills.map((skillGroup) => (
                <div
                  key={skillGroup.id}
                  className={`${styles.skillRow} reveal`}
                  ref={(el) => {
                    if (el) revealElementsRef.current.set(skillGroup.id, el);
                  }}
                >
                  <div className={styles.k}>{skillGroup.category}</div>
                  <div className={styles.chips}>
                    {skillGroup.skills.map((s, idx) => (
                      <span key={idx} className={styles.chip}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section
        id="blog"
        className={styles.section}
        ref={(el) => {
          if (el) revealElementsRef.current.set("sec-blog", el);
        }}
      >
        <div className={styles.wrap}>
          <div className={`${styles.endpoint} reveal`}>
            <span className={styles.verb}>GET</span>
            <span className={styles.path}>/blog</span>
            <span className={styles.rule}></span>
            <span className={styles.status}>
              200 OK · {blogPosts.length} post{blogPosts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className={styles.posts}>
            {isLoading ? (
              <div style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Parsing articles...
              </div>
            ) : (
              blogPosts.slice(0, 2).map((post) => {
                const targetUrl = post.url || EXTERNAL_BLOG_URL;
                return (
                  <a
                    key={post.slug}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.postCard} reveal`}
                    ref={(el) => {
                      if (el) revealElementsRef.current.set(post.slug, el);
                    }}
                  >
                    <span className={styles.date}>{formatBlogDate(post.date)}</span>
                    <span>
                      <h3>{post.title}</h3>
                      <span className={styles.desc}>{post.desc}</span>
                    </span>
                    <span className={styles.arrow}>read →</span>
                  </a>
                );
              })
            )}
          </div>

          {!isLoading && blogPosts.length > 2 && (
            <div className={`${styles.viewAllContainer} reveal`}>
              <a
                href={EXTERNAL_BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.primary}`}
              >
                View All Posts →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT / FOOTER SECTION */}
      <section
        id="contact"
        className={styles.section}
        ref={(el) => {
          if (el) revealElementsRef.current.set("sec-contact", el);
        }}
      >
        <div className={styles.wrap}>
          <div
            className={`${styles.contactPanel} reveal`}
            ref={(el) => {
              if (el) revealElementsRef.current.set("contact-panel", el);
            }}
          >
            <div>
              <h2>Have a backend that needs building?</h2>
              <p>
                I&apos;m currently open to Backend / Python / Node.js engineering roles — in India and
                abroad. Submit your email and details here, or reach out directly.
              </p>
              <div className={styles.contactLinks}>
                <a className={styles.btn} href="mailto:jatinvishwakarma4310@gmail.com">
                  jatinvishwakarma4310@gmail.com
                </a>
                <a
                  className={`${styles.btn} ${styles.ghost}`}
                  href="https://github.com/jatin7425"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/jatin7425
                </a>
                <a
                  className={`${styles.btn} ${styles.ghost}`}
                  href="https://linkedin.com/in/jatin7425"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/jatin7425
                </a>
              </div>
            </div>

            {/* Interactive Form */}
            <form onSubmit={handleContactSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Your Email Address</label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  className={styles.textarea}
                  placeholder="Describe your backend engineering needs..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {submitSuccess && (
                <div className={styles.formSuccess}>
                  <span>✓</span> {submitSuccess}
                </div>
              )}

              {submitError && (
                <div className={styles.formError}>
                  <span>⚠️</span> {submitError}
                </div>
              )}

              <button
                type="submit"
                className={styles.formBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Send Message"}
              </button>
            </form>
          </div>

          <footer className={styles.footer}>
            <span>© 2026 Jatin Vishwakarma</span>
            <span>
              Valsad, Gujarat, India · B.Voc Software Development, LIT Sarigam
            </span>
          </footer>
        </div>
      </section>
    </>
  );
}
