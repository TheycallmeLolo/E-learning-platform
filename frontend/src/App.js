import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { authService } from './services/auth';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import AppRoutes from './routes/AppRoutes';
import ChatBot from './components/shared/ChatBot';
import './App.css';

function App() {
  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService.getCurrentUser().catch(() => {
        // If token is invalid, interceptor handles redirect
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Footer />
        {authService.isAuthenticated() && <ChatBot />}
      </div>
    </BrowserRouter>
  );
}

export default App;