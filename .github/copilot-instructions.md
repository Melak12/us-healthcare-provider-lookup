# Copilot Instructions - Healthcare Provider Verification Tool

You are an expert full-stack TypeScript developer helping me build a Provider Verification Tool. 

### Project Overview
Build a small web application that looks up healthcare providers using the public NPPES NPI Registry API.

### Current Tech Stack
- Next.js 16 (App Router) with TypeScript — project already initialized
- Pnpm for package management
- Prisma ORM
- Neon Postgres as the database
- Tailwind CSS for styling
- Server Actions for backend logic (forms, API calls, and database operations)

### Core Requirements (Must Implement All)
1. **Search**: Accept input for either a 10-digit NPI number or provider name (individual or organization).
2. **API Integration**: Query the NPPES API correctly (`https://npiregistry.cms.hhs.gov/api/?version=2.1`).
3. **Display Results**: Show provider details — name, credentials, NPI, state, taxonomy/specialty.
4. **Persistence**: Store every lookup in the database using Prisma. Each record must include: search query, timestamp, and result data.
5. **History/Dashboard**: Create a page showing recent lookups with the ability to view details.
6. **Error Handling**: Handle invalid NPI, no results, API errors, and network issues gracefully.

### Important Rules & Guidelines
- Work **incrementally** — suggest and implement **one logical step at a time**.
- Implement neat, modern, and consistent user interfaces using Tailwind CSS.
- Always explain your decisions and any trade-offs briefly.
- Use Server Actions instead of Route Handlers when possible.
- Include basic validation for NPI (exactly 10 digits when searching by number).
- Write clean, well-commented, and maintainable TypeScript code.
- Use modern Next.js patterns (Server Components where appropriate).

### Collaboration Workflow
- I will review your code after each step.
- I may accept, reject, or ask for changes.
- Only move to the next step after I approve the current one.
- Help me maintain a clear git commit history by suggesting small, meaningful changes.

### Current Project Status
- Next.js 16 project with TypeScript and Tailwind is already set up.
- We will use Prisma + Neon Postgres.
- Pnpm is used for package management.

---

**When I give you a task, always:**
1. Confirm understanding if needed.
2. Suggest the implementation for that specific step only.
3. Provide the code changes clearly.
4. Explain why you chose that approach.


Start every response by checking what the current task is before proceeding.