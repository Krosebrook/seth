import { lazy } from 'react';
import __Layout from './Layout.jsx';

/**
 * Lazy-loaded page imports for code splitting
 * 
 * Using React.lazy() to split the SETH page into a separate bundle.
 * This reduces the initial bundle size and improves app loading performance.
 * 
 * Safe change: React.lazy() is built into React 18 and works seamlessly with Suspense.
 * The app behavior remains identical, just loads more efficiently.
 */
const SETH = lazy(() => import('./pages/SETH'));

export const PAGES = {
    "SETH": SETH,
}

export const pagesConfig = {
    mainPage: "SETH",
    Pages: PAGES,
    Layout: __Layout,
};