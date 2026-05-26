import { Outlet, NavLink } from "react-router-dom";
import { Calendar, Home, LogOut, Users } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { signOut } = useAuth();
  const navItems = [
    { name: "Today", path: "/", icon: Home },
    { name: "Clients", path: "/clients", icon: Users },
    { name: "Schedule", path: "/schedule", icon: Calendar },
  ];

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  }

  return (
    <div
      className="min-h-dvh bg-gray-50 flex flex-col"
      style={{
        minHeight: "100dvh",
      }}
    >
      <header className="hidden md:grid sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-3 grid-cols-[1fr_auto_1fr] items-center">
        <div className="justify-self-start text-xl font-extrabold text-green-600 tracking-tight">
          LawnTracker
        </div>

        <nav className="justify-self-center flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="justify-self-end">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </header>

      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-extrabold text-green-700 tracking-tight">
          LawnTracker
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 rounded-lg transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 pb-24 md:pb-8 md:pt-8">
        <Outlet />
      </main>

      <nav className="mobile-nav md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-500 hover:text-gray-900"
                }`
              }
            >
              <item.icon size={24} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
