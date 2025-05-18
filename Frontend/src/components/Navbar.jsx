import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="bg-base-100 border-b border-base-300 dark:border-transparent fixed w-full top-0 z-40 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-base-content">Chatty</h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-base-200 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-base-content/80" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-base-200 transition-colors"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5 text-base-content/80" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-base-200 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-base-content/80" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-base-200 transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 flex flex-col gap-2 bg-base-100 dark:border-transparent border-t border-base-300 py-3 px-2 rounded-b-lg shadow-sm">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-base-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-base-content/80" />
              <span>Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <User className="w-5 h-5 text-base-content/80" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-base-content/80" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;