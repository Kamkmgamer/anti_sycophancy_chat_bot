# The Oracle's Chamber - Anti-Sycophancy Fantasy Chatbot

A fantasy-themed chatbot that speaks truth, not flattery. Built with the T3 Stack, featuring a two-agent AI system that ensures responses are honest and substantive.

![Oracle's Chamber](https://via.placeholder.com/800x400?text=Oracle's+Chamber)

## Features

- **🛡️ Anti-Sycophancy System**: Two-agent architecture where responses are verified by a Sycophancy Checker before delivery
- **✨ Fantasy Theme**: Immersive medieval oracle experience with atmospheric UI
- **💬 Multiple Chat Threads**: Create, switch between, and fork conversations
- **🔐 Secure Authentication**: Powered by Clerk
- **⚡ Fast AI Responses**: Cerebras AI integration for rapid inference

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with custom fantasy theme
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **API**: [tRPC](https://trpc.io) for type-safe APIs
- **Auth**: [Clerk](https://clerk.com)
- **AI**: [Cerebras AI](https://cerebras.ai)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database
- Clerk account
- Cerebras AI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Kamkmgamer/anti_sycophancy_chat_bot
   cd anti_sycophancy_chat_bot
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your credentials:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Cerebras AI
   CEREBRAS_API_KEY=your_api_key
   CEREBRAS_API_URL=https://api.cerebras.ai/v1/chat/completions

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/oracle_db
   ```

4. **Set up the database**

   ```bash
   pnpm db:push
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### Two-Agent AI System

1. **Response Writer Agent**: Generates creative, fantasy-themed responses with explicit anti-sycophancy instructions
2. **Sycophancy Checker Agent**: Analyzes responses for:
   - Excessive flattery
   - Avoiding disagreement
   - Empty validation
   - Pandering behavior

If the checker rejects a response, the writer regenerates with feedback (up to 15 attempts).

### Database Schema

```
threads          messages
┌──────────────┐ ┌──────────────┐
│ id           │ │ id           │
│ userId       │ │ threadId FK  │
│ title        │ │ content      │
│ parentId     │ │ isFromUser   │
│ createdAt    │ │ timestamp    │
└──────────────┘ └──────────────┘
```

### API Routes (tRPC)

- `chat.createThread` - Create new thread (with optional fork)
- `chat.getThreads` - List user's threads
- `chat.getThreadHistory` - Get messages for a thread
- `chat.sendMessage` - Send message and get AI response
- `chat.deleteThread` - Delete a thread
- `chat.updateThreadTitle` - Update thread title

## Development

```bash
# Run development server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Database migrations
pnpm db:generate
pnpm db:migrate
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Ensure all variables from `.env.example` are set in your deployment platform.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing + Chat interface
│   ├── sign-in/           # Clerk sign-in
│   └── sign-up/           # Clerk sign-up
├── components/
│   ├── chat/              # Chat UI components
│   │   ├── chat-interface.tsx
│   │   ├── chat-window.tsx
│   │   ├── thread-sidebar.tsx
│   │   ├── message-bubble.tsx
│   │   └── message-input.tsx
│   └── ui/                # Base UI components
├── server/
│   ├── api/               # tRPC routers
│   ├── db/                # Drizzle schema
│   └── services/          # AI services
│       ├── ai/
│       │   ├── cerebras.ts
│       │   ├── response-writer.ts
│       │   └── sycophancy-checker.ts
│       └── chat.ts
└── styles/
    └── globals.css        # Fantasy theme
```

## License

MIT

---

_"Truth speaks louder than flattery"_ ✦
