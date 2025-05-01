"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  LogOut,
  Menu,
  X,
  Book,
  ChevronLeft,
  ChevronRight,
  UploadIcon,
  DownloadIcon,
  CheckSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import clsx from "clsx";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Students", href: "/admin/dashboard/students", icon: Users },
    { name: "Classes", href: "/admin/dashboard/classes", icon: GraduationCap },
    { name: "Teachers", href: "/admin/dashboard/teachers", icon: Book },
    { name: "Divisions", href: "/admin/dashboard/divisions", icon: BookOpen },
    { name: "Subjects", href: "/admin/dashboard/subjects", icon: FileText },
    { name: "Upload Result", href: "/admin/dashboard/result/upload", icon: UploadIcon },
    { name: "Download Result", href: "/admin/dashboard/result/download", icon: DownloadIcon },
    { name: "Submitted Results", href: "/admin/dashboard/submitted-results", icon: CheckSquare },
  ];

  const isActive = (path: string) => pathname?.startsWith(path);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const renderNavItem = (item: (typeof navigation)[0]) => (
    <Link
      key={item.name}
      href={item.href}
      className={clsx(
        "group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-all duration-200",
        {
          "bg-indigo-100 text-indigo-600": isActive(item.href),
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900": !isActive(
            item.href
          ),
        }
      )}
    >
      <item.icon
        className={clsx(
          "h-5 w-5 transition-transform duration-300 ",
          {
            "text-indigo-500": isActive(item.href),
            "text-gray-400 group-hover:text-gray-500": !isActive(item.href),
          }
        )}
      />
      {!isCollapsed && <span>{item.name}</span>}
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <button onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X className="h-6 w-6 cursor-pointer" /> : <Menu className="h-6 w-6 cursor-pointer" />}
        </button>
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-0 z-40 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="relative flex flex-col w-64 h-full bg-white border-r border-gray-200 pt-16">
          <div className="px-4 py-4 font-bold text-xl">School Admin</div>
          <nav className="flex-1 px-2 space-y-1">{navigation.map(renderNavItem)}</nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="group flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:animate-spin" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div
          className={clsx(
            "flex flex-col h-screen fixed top-0 border-r bg-white transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div className="overflow-hidden whitespace-nowrap transition-opacity duration-300" 
                 style={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto', maxWidth: isCollapsed ? 0 : '100%' }}>
              <h1 className="text-xl font-bold text-gray-800">School Admin</h1>
            </div>
            <button
              onClick={toggleCollapse}
              className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>
          <nav className="flex-1 px-3 space-y-2">{navigation.map(renderNavItem)}</nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="group flex items-center px-3 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full border-1 border-red-500"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500" />
              <span className="overflow-hidden whitespace-nowrap transition-opacity duration-300"
                    style={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto', maxWidth: isCollapsed ? 0 : '100%' }}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;