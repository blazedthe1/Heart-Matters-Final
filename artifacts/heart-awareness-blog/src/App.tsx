import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import ArticlesList from "@/pages/articles/index";
import ArticleDetail from "@/pages/articles/[slug]";
import RiskAssessment from "@/pages/risk-assessment";
import Resources from "@/pages/resources";
import About from "@/pages/about";
import AdminPage from "@/pages/admin/index";
import ArticleFormPage from "@/pages/admin/articles/form";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/articles" component={ArticlesList} />
        <Route path="/articles/:slug" component={ArticleDetail} />
        <Route path="/risk-assessment" component={RiskAssessment} />
        <Route path="/resources" component={Resources} />
        <Route path="/about" component={About} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/articles/new" component={ArticleFormPage} />
        <Route path="/admin/articles/edit/:id" component={ArticleFormPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;