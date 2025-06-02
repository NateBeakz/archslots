import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { Router } from '@/Router';

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Router />
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
