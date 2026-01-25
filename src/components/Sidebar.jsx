import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Settings, History, Users, FileText, Activity, 
  Briefcase, User as UserIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Sidebar({ currentPage, mode = 'work' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Home', icon: Home, href: createPageUrl('SETH') },
    { name: 'Simulations', icon: Activity, href: createPageUrl('Simulations') },
    { name: 'Custom Roles', icon: Users, href: createPageUrl('CustomRoles') },
    { name: 'Activity Log', icon: FileText, href: createPageUrl('ActivityLog') },
    { name: 'Export Data', icon: FileText, href: createPageUrl('Export') },
    { name: 'History', icon: History, href: createPageUrl('SETH') },
    { name: 'Settings', icon: Settings, href: createPageUrl('SETH') },
  ];

  const modeColors = {
    work: 'from-blue-900 to-blue-950',
    personal: 'from-purple-900 to-purple-950'
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-gradient-to-b ${modeColors[mode]} border-r border-cyan-500/30 transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            {mode === 'work' ? (
              <Briefcase className="w-5 h-5 text-cyan-400" />
            ) : (
              <UserIcon className="w-5 h-5 text-purple-400" />
            )}
            <span className="text-cyan-300 font-semibold">
              {mode === 'work' ? 'Work Mode' : 'Personal Mode'}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-cyan-400"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentPage === item.name
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-300'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0`} />
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.name}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-cyan-500/30">
          <p className="text-xs text-gray-500">
            Tessa - Ready to go to work
          </p>
        </div>
      )}
    </div>
  );
}