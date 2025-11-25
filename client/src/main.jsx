import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

console.log('Application starting...');

try {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
  console.log('React root rendered');
} catch (e) {
  console.error('Error rendering React root:', e);
}
