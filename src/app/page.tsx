"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { Experience, Project, SkillGroup, BlogPost } from "@/backend/types";

const EXTERNAL_BLOG_URL = "https://medium.com/@jatinvishwakarma05";

// Terminal types
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
  ["kv", '  "role"', ' "Software Engineer"'],
  ["kv", '  "experience"', ' "18 months · intern → SE"'],
  ["arr", '  "stack"', ["Python", "FastAPI", "Node.js", "PostgreSQL", "Docker"]],
  ["kv", '  "location"', ' "Valsad, IN 🇮🇳"'],
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

  // Theme State
  const [theme, setTheme] = useState<"violet" | "matrix" | "light">("violet");

  // Console View Modes
  const [expView, setExpView] = useState<"pretty" | "json">("pretty");
  const [projView, setProjView] = useState<"pretty" | "json">("pretty");
  const [skillsView, setSkillsView] = useState<"pretty" | "json">("pretty");
  const [blogView, setBlogView] = useState<"pretty" | "json">("pretty");

  // Blog Inline Reader
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Terminal Simulation State
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [isInteractive, setIsInteractive] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const revealElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const drawerScrollRef = useRef<HTMLDivElement>(null);

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

  // Theme Switcher Sync with HTML class and Local Storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("portfolio-theme") as any;
    if (savedTheme && ["violet", "matrix", "light"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-violet", "theme-matrix", "theme-light");
    root.classList.add(`theme-${theme}`);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  // Lock body scroll when blog reader drawer is open
  useEffect(() => {
    if (activePost) {
      document.body.style.overflow = "hidden";
      setScrollPercent(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePost]);

  // Terminal Typing Animation
  useEffect(() => {
    if (terminalIndex >= TERMINAL_LINES.length) {
      setIsInteractive(true);
      return;
    }

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

  // Auto-scroll terminal to bottom on interaction
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory, terminalLines, isInteractive]);

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
  }, [experiences, projects, skills, blogPosts, isLoading, expView, projView, skillsView, blogView]);

  // Interactive Terminal Submit handler
  const handleTerminalSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = terminalInput.trim();
      const cmd = val.toLowerCase();
      if (!val) return;

      const newLog = [...terminalHistory, `jatin@dev:~$ ${val}`];
      
      if (cmd === "clear") {
        setTerminalHistory([]);
        setTerminalInput("");
        return;
      }

      let response: string[] = [];
      if (cmd === "help") {
        response = [
          "Available commands:",
          "  about    - Display my introduction",
          "  skills   - List technical stack",
          "  projects - List key engineering projects",
          "  theme    - Switch theme (theme violet, theme matrix, theme light)",
          "  contact  - Display contact details",
          "  clear    - Clear the terminal screen"
        ];
      } else if (cmd === "about") {
        response = [
          "Jatin Vishwakarma - Backend-leaning Full Stack Engineer",
          "Location: Valsad, Gujarat, India 🇮🇳",
          "Education: B.Voc Software Development, LIT Sarigam",
          "Current Role: Software Engineer at IT Idol Technologies",
          "Focus: I design scalable APIs, payment flows, RBAC systems and automated pipelines."
        ];
      } else if (cmd === "skills") {
        response = [
          "[Backend]   Python, FastAPI, Flask, Node.js, Express.js, Fastify, TypeScript",
          "[Database]  PostgreSQL, MySQL, MongoDB",
          "[Caching]   Redis, BullMQ",
          "[APIs]      REST, JWT, RBAC, OAuth, Stripe, Twilio",
          "[Real-Time] Socket.io, Server-Sent Events",
          "[DevOps]    Docker, Compose, Nginx, Linux, CI/CD, GitHub Workflows",
          "[Cloud]     AWS (S3, CloudWatch), Azure (Functions, SWA, Blob Storage, Key Vault)"
        ];
      } else if (cmd === "projects") {
        response = [
          "1. Auto-mobile-service (Node.js, Fastify, Prisma, Stripe)",
          "   - 50+ REST APIs, Stripe routing, Socket.io chat, FCM push",
          "2. Restaurant Price Upload Portal (Python, Azure Functions)",
          "   - Serverless Excel-driven pricing pipeline w/ audit logging",
          "3. Weapon Inventory System (Python, FastAPI, MongoDB, AWS S3)",
          "   - 200k+ rows migration, API latency optimized from 10m to <4s",
          "4. Multi-Site Web Scraping Pipeline (Python, Selenium, XPath)",
          "   - Rotating proxies + fallback selectors beat bot detection",
          "5. Investment & Returns Calculation Engine (FastAPI, PostgreSQL)",
          "   - Custom algorithms for multi-plan investment return calcs"
        ];
      } else if (cmd.startsWith("theme ")) {
        const targetTheme = cmd.split(" ")[1];
        if (["violet", "matrix", "light"].includes(targetTheme)) {
          setTheme(targetTheme as any);
          response = [`Theme successfully switched to '${targetTheme}'!`];
        } else {
          response = [`Unknown theme '${targetTheme}'. Try: theme violet | matrix | light`];
        }
      } else if (cmd === "theme") {
        response = ["Usage: theme <violet | matrix | light>"];
      } else if (cmd === "contact") {
        response = [
          "Email:    jatinvishwakarma4310@gmail.com",
          "GitHub:   github.com/jatin7425",
          "LinkedIn: linkedin.com/in/jatin7425"
        ];
      } else {
        response = [`jsh: command not found: ${val}. Type 'help' for options.`];
      }

      setTerminalHistory([...newLog, ...response, ""]);
      setTerminalInput("");
    }
  };

  // Contact Form handler (uses mailto as fallback)
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const subject = encodeURIComponent("Portfolio Contact from " + email);
      const body = encodeURIComponent(message);
      window.location.href = `mailto:jatinvishwakarma4310@gmail.com?subject=${subject}&body=${body}`;
      
      setSubmitSuccess("Opening your email client to send the message...");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setSubmitError("Failed to open email client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drawer Scroll Listener to track reading progress
  const handleDrawerScroll = () => {
    if (drawerScrollRef.current) {
      const target = drawerScrollRef.current;
      const totalHeight = target.scrollHeight - target.clientHeight;
      if (totalHeight > 0) {
        setScrollPercent((target.scrollTop / totalHeight) * 100);
      }
    }
  };

  const cycleTheme = () => {
    if (theme === "violet") setTheme("matrix");
    else if (theme === "matrix") setTheme("light");
    else setTheme("violet");
  };

  // Helper to format blog post publish date
  const formatBlogDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to render formatted JSON tree structure inside console
  const renderFormattedJson = (data: any) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const lines = jsonStr.split("\n");
    return (
      <div className={styles.jsonContainer}>
        {lines.map((line, lineIdx) => {
          const parts = line.split(/(".*?"\s*:|true|false|null|-?\d+(?:\.\d*)?|[\[\]{}:,])/g);
          return (
            <div key={lineIdx} className={styles.jsonLine}>
              <span className={styles.lineNo}>{lineIdx + 1}</span>
              <span className={styles.lineContent}>
                {parts.map((part, partIdx) => {
                  if (!part) return null;
                  let className = "";
                  if (part.endsWith(":")) {
                    className = styles.jsonKey;
                  } else if (part.startsWith('"')) {
                    className = styles.jsonString;
                  } else if (/^(true|false)$/.test(part)) {
                    className = styles.jsonBool;
                  } else if (part === "null") {
                    className = styles.jsonNull;
                  } else if (/^\d+/.test(part)) {
                    className = styles.jsonNum;
                  } else {
                    className = styles.jsonPunct;
                  }
                  return (
                    <span key={partIdx} className={className}>
                      {part}
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper to parse Markdown strings into styled React components
  const renderMarkdown = (src: string) => {
    if (!src) return [];
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const blocks = src.trim().split(/```/);
    
    return blocks.map((b, blockIdx) => {
      if (blockIdx % 2 === 1) {
        // Code Block
        const nl = b.indexOf("\n");
        const lang = nl >= 0 ? b.slice(0, nl).trim() : "";
        const code = nl >= 0 ? b.slice(nl + 1) : b;
        
        return (
          <div key={blockIdx} className={styles.markdownCodeBlock}>
            <div className={styles.codeBlockHeader}>
              <span className={styles.codeBlockLang}>{lang || "text"}</span>
              <button 
                className={styles.copyBtn} 
                onClick={(e) => {
                  navigator.clipboard.writeText(code.trimEnd());
                  const btn = e.currentTarget;
                  btn.textContent = "Copied!";
                  setTimeout(() => { btn.textContent = "Copy"; }, 2000);
                }}
              >
                Copy
              </button>
            </div>
            <pre className={styles.markdownPre}>
              <code>{code.trimEnd()}</code>
            </pre>
          </div>
        );
      }
      
      const lines = b.split("\n");
      let listItems: string[] = [];
      let inList = false;
      const elements: React.ReactNode[] = [];
      
      const parseInline = (s: string) => {
        const html = esc(s)
          .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
          .replace(/\*(.+?)\*/g, "<i>$1</i>")
          .replace(/`(.+?)`/g, "<code>$1</code>")
          .replace(/\[(.+?)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      };
      
      const flushList = (key: string) => {
        if (listItems.length > 0) {
          elements.push(
            <ul key={key} className={styles.markdownUl}>
              {listItems.map((item, idx) => (
                <li key={idx} className={styles.markdownLi}>
                  {parseInline(item)}
                </li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
      };
      
      lines.forEach((line, lineIdx) => {
        let t = line.trim();
        if (t.startsWith("- ")) {
          inList = true;
          listItems.push(t.slice(2));
        } else {
          if (inList) {
            flushList(`list-${blockIdx}-${lineIdx}`);
          }
          if (!t) return;
          
          if (t.startsWith("### ")) {
            elements.push(<h3 key={`h3-${blockIdx}-${lineIdx}`} className={styles.markdownH3}>{parseInline(t.slice(4))}</h3>);
          } else if (t.startsWith("## ")) {
            elements.push(<h2 key={`h2-${blockIdx}-${lineIdx}`} className={styles.markdownH2}>{parseInline(t.slice(3))}</h2>);
          } else if (t.startsWith("# ")) {
            elements.push(<h1 key={`h1-${blockIdx}-${lineIdx}`} className={styles.markdownH1}>{parseInline(t.slice(2))}</h1>);
          } else if (t.startsWith("> ")) {
            elements.push(<blockquote key={`quote-${blockIdx}-${lineIdx}`} className={styles.markdownBlockquote}>{parseInline(t.slice(2))}</blockquote>);
          } else {
            elements.push(<p key={`p-${blockIdx}-${lineIdx}`} className={styles.markdownP}>{parseInline(t)}</p>);
          }
        }
      });
      
      if (inList) {
        flushList(`list-${blockIdx}-end`);
      }
      
      return <div key={blockIdx} className={styles.markdownTextSection}>{elements}</div>;
    });
  };

  const renderTerminalLine = (line: TerminalLine, index: number) => {
    const [kind, key, val] = line;
    if (kind === "p") {
      return <div key={index} className={styles.p}>{key}</div>;
    }
    if (kind === "ok") {
      return <div key={index} className={styles.ok}>{key}</div>;
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

  const handlePostClick = (e: React.MouseEvent<HTMLAnchorElement>, post: BlogPost) => {
    if (post.content) {
      e.preventDefault();
      setActivePost(post);
    }
  };

  return (
    <>
      {/* Background Floating Glow Blobs */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>
      <div className="glow-blob glow-blob-3"></div>

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
            <a href="#blog">/blog</a>
            
            {/* Animated Theme Toggle Button */}
            <button className={styles.themeToggle} onClick={cycleTheme} title="Switch theme">
              {theme === "violet" ? "🔮 Carbon" : theme === "matrix" ? "🟢 Hacker" : "☀️ Light"}
            </button>

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

          {/* Interactive Code Terminal */}
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
              <span>terminal — zsh</span>
              <button 
                className={styles.termClearBtn} 
                onClick={() => setTerminalHistory([])}
                title="Clear screen"
              >
                clear
              </button>
            </div>
            <div className={styles.termContainer}>
              <pre className={styles.termPre}>
                {terminalLines.map((line, idx) => renderTerminalLine(line, idx))}
                
                {/* Process output history */}
                {terminalHistory.map((line, idx) => (
                  <div key={`hist-${idx}`} className={line.startsWith("jatin@dev:") ? styles.termInputLine : ""}>
                    {line}
                  </div>
                ))}

                {/* Interactive cursor line */}
                {isInteractive && (
                  <div className={styles.termPromptContainer}>
                    <span className={styles.promptLabel}>jatin@dev:~$</span>
                    <input
                      type="text"
                      className={styles.termInput}
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={handleTerminalSubmit}
                      placeholder="type 'help'..."
                      autoFocus
                    />
                  </div>
                )}
                
                {terminalIndex < TERMINAL_LINES.length && (
                  <span className={styles.cursor}>▋</span>
                )}
                <div ref={terminalEndRef} />
              </pre>
            </div>
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
          {/* Console Header Toggle */}
          <div className={`${styles.consoleHeader} reveal`}>
            <div className={styles.endpoint}>
              <span className={styles.verb}>GET</span>
              <span className={styles.path}>/experience</span>
              <span className={styles.status}>200 OK</span>
            </div>
            <div className={styles.consoleControls}>
              <button
                className={`${styles.consoleBtn} ${expView === "pretty" ? styles.active : ""}`}
                onClick={() => setExpView("pretty")}
              >
                Pretty UI
              </button>
              <button
                className={`${styles.consoleBtn} ${expView === "json" ? styles.active : ""}`}
                onClick={() => setExpView("json")}
              >
                Raw JSON
              </button>
            </div>
          </div>

          <div className={styles.consoleBody}>
            {expView === "pretty" ? (
              <div className={styles.xp}>
                {isLoading ? (
                  <div className={styles.loadingText}>Loading experience logs...</div>
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
            ) : (
              renderFormattedJson(experiences)
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
          {/* Console Header Toggle */}
          <div className={`${styles.consoleHeader} reveal`}>
            <div className={styles.endpoint}>
              <span className={styles.verb}>GET</span>
              <span className={styles.path}>/projects</span>
              <span className={styles.status}>200 OK</span>
            </div>
            <div className={styles.consoleControls}>
              <button
                className={`${styles.consoleBtn} ${projView === "pretty" ? styles.active : ""}`}
                onClick={() => setProjView("pretty")}
              >
                Pretty UI
              </button>
              <button
                className={`${styles.consoleBtn} ${projView === "json" ? styles.active : ""}`}
                onClick={() => setProjView("json")}
              >
                Raw JSON
              </button>
            </div>
          </div>

          <div className={styles.consoleBody}>
            {projView === "pretty" ? (
              <div className={styles.cards}>
                {isLoading ? (
                  <div className={styles.loadingText}>Resolving projects...</div>
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
            ) : (
              renderFormattedJson(projects)
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
          {/* Console Header Toggle */}
          <div className={`${styles.consoleHeader} reveal`}>
            <div className={styles.endpoint}>
              <span className={styles.verb}>GET</span>
              <span className={styles.path}>/skills</span>
              <span className={styles.status}>200 OK</span>
            </div>
            <div className={styles.consoleControls}>
              <button
                className={`${styles.consoleBtn} ${skillsView === "pretty" ? styles.active : ""}`}
                onClick={() => setSkillsView("pretty")}
              >
                Pretty UI
              </button>
              <button
                className={`${styles.consoleBtn} ${skillsView === "json" ? styles.active : ""}`}
                onClick={() => setSkillsView("json")}
              >
                Raw JSON
              </button>
            </div>
          </div>

          <div className={styles.consoleBody}>
            {skillsView === "pretty" ? (
              <div className={styles.skillTable}>
                {isLoading ? (
                  <div className={styles.loadingText}>Streaming system definitions...</div>
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
            ) : (
              renderFormattedJson(skills)
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
          {/* Console Header Toggle */}
          <div className={`${styles.consoleHeader} reveal`}>
            <div className={styles.endpoint}>
              <span className={styles.verb}>GET</span>
              <span className={styles.path}>/blog</span>
              <span className={styles.status}>200 OK</span>
            </div>
            <div className={styles.consoleControls}>
              <button
                className={`${styles.consoleBtn} ${blogView === "pretty" ? styles.active : ""}`}
                onClick={() => setBlogView("pretty")}
              >
                Pretty UI
              </button>
              <button
                className={`${styles.consoleBtn} ${blogView === "json" ? styles.active : ""}`}
                onClick={() => setBlogView("json")}
              >
                Raw JSON
              </button>
            </div>
          </div>

          <div className={styles.consoleBody}>
            {blogView === "pretty" ? (
              <div className={styles.posts}>
                {isLoading ? (
                  <div className={styles.loadingText}>Parsing blog logs...</div>
                ) : (
                  blogPosts.map((post) => {
                    const targetUrl = post.url || `#blog-post-${post.slug}`;
                    return (
                      <a
                        key={post.slug}
                        href={targetUrl}
                        target={post.url ? "_blank" : undefined}
                        rel={post.url ? "noopener noreferrer" : undefined}
                        className={`${styles.postCard} reveal`}
                        onClick={(e) => handlePostClick(e, post)}
                        ref={(el) => {
                          if (el) revealElementsRef.current.set(post.slug, el);
                        }}
                      >
                        <span className={styles.date}>{formatBlogDate(post.date)}</span>
                        <span>
                          <h3>{post.title}</h3>
                          <span className={styles.desc}>{post.desc}</span>
                        </span>
                        <span className={styles.arrow}>{post.content ? "read inline →" : "read on medium ↗"}</span>
                      </a>
                    );
                  })
                )}
              </div>
            ) : (
              renderFormattedJson(blogPosts)
            )}
          </div>
        </div>
      </section>

      {/* ARTICLE READER DRAWER */}
      {activePost && (
        <div className={styles.drawerOverlay} onClick={() => setActivePost(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <button className={styles.drawerClose} onClick={() => setActivePost(null)}>
                ← cd ../blog
              </button>
              <span className={styles.drawerReadTime}>
                {Math.ceil((activePost.content || "").split(/\s+/).length / 200)} min read
              </span>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${scrollPercent}%` }} />
            </div>
            <div 
              className={styles.drawerContent} 
              ref={drawerScrollRef}
              onScroll={handleDrawerScroll}
            >
              <div className={styles.drawerHead}>
                <div className={styles.drawerDate}>
                  {formatBlogDate(activePost.date)}
                </div>
                <h1 className={styles.drawerTitle}>{activePost.title}</h1>
                <div className={styles.chips}>
                  {activePost.tags.map((tag, idx) => (
                    <span key={idx} className={styles.chip}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.drawerBody}>
                {renderMarkdown(activePost.content)}
              </div>
            </div>
          </div>
        </div>
      )}

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
