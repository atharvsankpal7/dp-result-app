"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Classes', href: '/admin/classes', icon: GraduationCap },
    { name: 'Divisions', href: '/admin/divisions', icon: BookOpen },
    { name: 'Schedule', href: '/admin/schedule', icon: Calendar },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    // Implement logout functionality here
    router.push('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:text-gray-600 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="relative flex flex-col w-64 h-full bg-white border-r border-gray-200 pt-16">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="px-4 py-4">
              <h1 className="text-xl font-bold text-gray-800">School Admin</h1>
            </div>
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-indigo-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-800">School Admin</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-indigo-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
