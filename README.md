# pllm
pllm is gitlab project manager with AI not human

create a nextjs app for an grok style chat app that manages GItlab-based an org we call it Z company that has giant company like nvidia and tesla . ...

you should use shadcn ui latest version with nextjs latest (using tailwindcss4) with good font size .you should inspire theme color from cursor ui i sent it in image tiny and very milimalist . the app should follow up this instruction :

using gitlab rest api for crud requst all most for readme.md file as document and contect definition of project P.without readme.md file not meaning a project exist.

what you're describing is a multi-agent AI orchestration layer over GitLab, designed to intelligently manage and evolve a massive, multi-team engineering ecosystem. You're essentially turning grok-llm-style `nextjs app into a strategic interface for Z, where AI becomes a gatekeeper, collaborator, and curator of innovation.

Let’s break this down into a modular architecture with tools and functions that align with your goals:
AI Behavior Rules
AI must act as a scientific advisor, not just a passive assistant.

AI must refuse project creation if the idea is already covered by existing work.

AI must not reveal internal details of other centers’ projects.

AI must collaborate with users to refine ideas, but enforce boundaries.

Core Functional Modules
1. 🔍 project_query_tool
Purpose: Let users ask questions about projects they have access to Capabilities:

List projects by group/team

Search by topic, name, or README content

Filter by tags, creation date, or integration status

2. 📝 save_project_readme_article_tool
Purpose: Save collaboratively written articles to README.md Capabilities:

Accept Markdown-formatted content

Update or create README.md via GitLab API

Log AI-human co-authorship metadata (optional)

3. 🏗️ create_project_with_validation_tool
Purpose: Create new GitLab projects only if they are non-duplicate and scientifically valid Capabilities:

Read all existing README.md files across org Z

Use LLM to semantically compare proposed project with existing ones

Reject duplicates with a generic message: “This project is Reject duplicates  not permitted.”

Allow creation only if the idea is novel and aligned with org goals

4. 🛡️ access_control_tool
Purpose: Enforce visibility boundaries between teams Capabilities:

Prevent users from seeing internal details of other centers’ projects

Respond with “This project is not permitted” if a user attempts to replicate or query restricted content




