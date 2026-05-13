'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from "../../components/AuthGuard";
import ProfileGuard from "../../components/ProfileGuard";
import { 
  LayoutDashboard, 
  Network, 
  FileText, 
  MessageSquare, 
  Wand2, 
  BarChart3, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  Layers,
  ChevronLeft,
  Settings,
  History,
  BookOpen,
  Bot
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const navItems = [
    { name: 'Dashboard Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Org Hierarchy', href: '/dashboard/hierarchy', icon: Network },
    { name: 'Knowledge Base', href: '/dashboard/documents', icon: FileText },
    { name: 'Training Center', href: '/dashboard/learn', icon: BookOpen },
    { name: 'Community Forums', href: '/dashboard/forums', icon: MessageSquare },
    { name: 'Content Builder', href: '/dashboard/content/builder', icon: Wand2 },
    { name: 'AI Assistant', href: '/dashboard/chat', icon: Bot },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Activity Logs', href: '/dashboard/logs', icon: History },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  ];

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link 
        href={item.href}
        className={`flex items-center space-x-3 p-4 rounded-2xl transition-all group ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
        {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
      </Link>
    );
  };

  return (
    <AuthGuard>
      <ProfileGuard>
        <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
          {/* Sidebar */}
          <aside 
            className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out relative ${
              isCollapsed ? 'w-24' : 'w-80'
            }`}
          >
            {/* Logo Section */}
            <div className="p-8 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="text-white w-6 h-6" />
                </div>
                {!isCollapsed && (
                  <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">Stratum</span>
                )}
              </Link>
            </div>

            {/* Menu Label Toggle */}
            <div className="px-8 mb-4 flex items-center justify-between">
               {!isCollapsed && <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Menu</span>}
               <button 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-blue-600"
                  title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
               >
                  {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
               </button>
            </div>

            {/* Nav List */}
            <nav className="flex-grow px-4 space-y-2 overflow-y-auto scrollbar-hide">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 p-4 w-full rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {!isCollapsed && <span className="font-bold text-sm">Log Out</span>}
              </button>
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-100 p-4 flex items-center justify-between z-50">
            <Link href="/" className="flex items-center space-x-2">
              <Layers className="text-blue-600 w-6 h-6" />
              <span className="text-lg font-black tracking-tighter">STRATUM</span>
            </Link>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 bg-gray-50 rounded-xl">
              {isMobileOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileOpen && (
            <div className="md:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60]" onClick={() => setIsMobileOpen(false)}>
              <aside className="w-80 h-full bg-white p-6 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-10">
                  <Link href="/" className="flex items-center space-x-3">
                    <Layers className="text-blue-600 w-6 h-6" />
                    <span className="text-xl font-black tracking-tighter">STRATUM</span>
                  </Link>
                  <button onClick={() => setIsMobileOpen(false)}><X /></button>
                </div>
                <nav className="space-y-4">
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-4 w-full rounded-2xl text-gray-400 hover:text-red-600 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">Log Out</span>
                  </button>
                </nav>
              </aside>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-grow overflow-y-auto pt-20 md:pt-0">
            <div className="max-w-7xl mx-auto p-6 md:p-12">
              {children}
            </div>
          </main>
        </div>
      </ProfileGuard>
    </AuthGuard>
  );
}
