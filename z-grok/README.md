# Z Grok

Grok-style multi-agent AI orchestration layer over GitLab for Z company. Next.js (App Router) + Tailwind CSS v4 + shadcn-inspired UI.

## Features
- project_query_tool: list/search projects, show README
- save_project_readme_article_tool: write Markdown to README.md
- create_project_with_validation_tool: novelty check then create project (README required)
- access_control_tool: hide restricted centers

## Setup
1. Copy `.env.example` to `.env.local` and set:
```
GITLAB_TOKEN=glpat-...
ORG_GROUP_ID=123456 # optional
ALLOWED_CENTER_SLUGS=core,ai,robotics
```
2. Install deps and run:
```
npm install
npm run dev
```
3. Open http://localhost:3000

## Chat intents
- "list projects" → list accessible projects
- "show README of <name>" → fetch README
- "save README for <name>:\n<markdown>" → update README.md
- "create project "Name" summary: <text>" → novelty gate + create + seed README

## Notes
- Replace simple novelty check with embeddings/LLM.
- Access rules are demo-only; wire to your identity/centers.