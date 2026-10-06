import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.scss';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary fallback={<p className="error">Something went wrong. Reload the page.</p>}>
            <App/>
        </ErrorBoundary>
    </React.StrictMode>
);
