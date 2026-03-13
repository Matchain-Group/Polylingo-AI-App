import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Home } from "@/pages/Home";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

type Page = "home" | "login" | "register" | "dashboard";

function AppContent() {
  const { user, loading } = useAuthContext();
  const { theme } = useTheme();
  const [page, setPage] = useState<Page>("home");

  useEffect(() => {
    if (!loading && !user && page === "dashboard") setPage("home");
  }, [user, loading, page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (page === "login") {
    return (
      <Login
        onGoRegister={() => setPage("register")}
        onLoginSuccess={() => setPage("home")}
      />
    );
  }

  if (page === "register") {
    return (
      <Register
        onGoLogin={() => setPage("login")}
        onRegisterSuccess={() => setPage("home")}
      />
    );
  }

  if (page === "dashboard" && user) {
    return <Dashboard onClose={() => setPage("home")} />;
  }

  return (
    <Home
      onGoLogin={() => setPage("login")}
      onGoRegister={() => setPage("register")}
      onGoDashboard={() => user ? setPage("dashboard") : setPage("login")}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppInner() {
  const { theme } = useTheme();
  return (
    <>
      <AppContent />
      <Toaster theme={theme} position="bottom-right" className="font-sans" />
    </>
  );
}

export default App;
