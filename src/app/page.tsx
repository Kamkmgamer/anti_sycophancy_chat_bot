import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { MessageSquare, Shield, Zap, ArrowRight } from "lucide-react";
import { ChatInterface } from "~/components/chat/chat-interface";
import { HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    return (
      <HydrateClient>
        <ChatInterface />
      </HydrateClient>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Shield className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">TruthBot</span>
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="from-background to-muted/50 flex flex-1 flex-col items-center justify-center bg-gradient-to-b px-4 py-24 text-center">
        <div className="max-w-3xl space-y-8">
          <div className="focus:ring-ring bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
            Now with Anti-Sycophancy v1.0
          </div>

          <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-6xl">
            An AI that tells you <br className="hidden sm:inline" />
            <span className="text-primary">what you need to hear</span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-xl text-lg leading-relaxed">
            Most chatbots are programmed to agree with you. TruthBot is
            different. It provides honest, critical, and nuanced responses—even
            when they contradict your views.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base">
                Start Chatting Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="https://github.com/your-repo"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
              >
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <Feature
            icon={<Shield className="h-6 w-6" />}
            title="Brutally Honest"
            description="Our dual-agent system verifies every response to ensure it's not just validating your biases."
          />
          <Feature
            icon={<Zap className="h-6 w-6" />}
            title="High Performance"
            description="Powered by Cerebras AI for lightning-fast inference speeds on large language models."
          />
          <Feature
            icon={<MessageSquare className="h-6 w-6" />}
            title="Complex Reasoning"
            description="Capable of handling nuanced debates and providing multi-faceted perspectives."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-muted-foreground bg-muted/20 border-t py-8 text-center text-sm">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p>&copy; 2024 TruthBot AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl border p-6 transition-all hover:shadow-lg">
      <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
