import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="from-fantasy-dark via-fantasy-purple/20 to-fantasy-dark flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="relative">
        {/* Mystical glow effect */}
        <div className="from-fantasy-gold/20 via-fantasy-purple/30 to-fantasy-gold/20 absolute -inset-4 rounded-3xl bg-gradient-to-r blur-xl" />
        <div className="relative">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-fantasy-dark/90 border border-fantasy-gold/30 shadow-2xl shadow-fantasy-purple/20",
                headerTitle: "text-fantasy-gold font-cinzel",
                headerSubtitle: "text-fantasy-parchment/70",
                socialButtonsBlockButton:
                  "bg-fantasy-dark border-fantasy-gold/30 text-fantasy-parchment hover:bg-fantasy-purple/20",
                formFieldLabel: "text-fantasy-parchment/80",
                formFieldInput:
                  "bg-fantasy-dark/50 border-fantasy-gold/30 text-fantasy-parchment",
                formButtonPrimary:
                  "bg-gradient-to-r from-fantasy-gold to-fantasy-amber hover:from-fantasy-amber hover:to-fantasy-gold text-fantasy-dark font-semibold",
                footerActionLink: "text-fantasy-gold hover:text-fantasy-amber",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
