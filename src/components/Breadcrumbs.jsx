import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 px-6 py-3 border-b border-cyan-500/30">
      <Link
        to={createPageUrl('SETH')}
        className="flex items-center hover:text-cyan-300 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-cyan-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-cyan-300">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}