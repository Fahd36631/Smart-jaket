import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  BellAlertIcon,
  HomeModernIcon,
  MapIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const LOGO_URL = `${import.meta.env.BASE_URL}logoDfa3.png`;

const navItems = [
  { to: "/dashboard", label: "لوحة التحكم", icon: HomeModernIcon },
  { to: "/personnel", label: "الأفراد", icon: UserGroupIcon },
  { to: "/map", label: "الخريطة", icon: MapIcon },
];

const AppShell = () => {
  const { officer, logout } = useAuth();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const renderNavLinks = (onNavigate?: () => void) =>
    navItems.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          clsx(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
            isActive
              ? "bg-brand-dark/10 text-brand-dark"
              : "text-gray-500 hover:bg-surface-card hover:text-brand-dark"
          )
        }
      >
        <Icon className="h-5 w-5" />
        {label}
      </NavLink>
    ));

  return (
    <div className="flex min-h-screen bg-surface-muted text-gray-900">
      <aside className="hidden w-72 flex-col border-l border-surface-card bg-white px-6 py-8 shadow-soft lg:flex">
        <SidebarHeader />
        <nav className="mt-10 flex flex-1 flex-col gap-2">{renderNavLinks()}</nav>
        <LogoutButton onClick={logout} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-card bg-white px-4 py-4 shadow-sm lg:static">
          <div className="flex items-center gap-3">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-card bg-white text-brand-dark shadow-soft lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="فتح القائمة الجانبية"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <img src={LOGO_URL} alt="Logo" className="h-10 w-10 lg:hidden" />
            <div>
              <p className="text-sm text-gray-500">مرحباً بك</p>
              <p className="text-lg font-semibold text-brand-dark">
                {officer?.name ?? "الضابط المناوب"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 max-sm:flex-col max-sm:items-end">
            <div className="flex flex-col items-end">
              <span className="font-semibold text-brand-dark">
                {officer?.unit}
              </span>
              <span>{officer?.rank}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface-card px-4 py-2 text-brand-dark">
              <BellAlertIcon className="h-5 w-5" />
              التنبيهات
            </div>
          </div>
        </header>

        <main className="app-scroll flex-1 overflow-y-auto px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-72 flex-col border-l border-surface-card bg-white px-6 py-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <SidebarHeader />
              <button
                className="rounded-2xl border border-surface-card p-2 text-brand-dark"
                onClick={() => setMobileNavOpen(false)}
                aria-label="إغلاق القائمة"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-2">
              {renderNavLinks(() => setMobileNavOpen(false))}
            </nav>
            <LogoutButton onClick={logout} />
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarHeader = () => (
  <div className="flex items-center gap-3">
    <img
      src={LOGO_URL}
      alt="Civil Defense Logo"
      className="h-14 w-14 rounded-full border border-brand-light bg-surface-muted object-contain p-1"
    />
    <div>
      <p className="text-sm text-gray-500">المديرية العامة للدفاع المدني</p>
      <p className="text-lg font-semibold text-brand-dark">لوحة الضابط</p>
    </div>
  </div>
);

const LogoutButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-brand-dark/40 px-4 py-3 text-brand-dark transition hover:bg-brand-dark hover:text-white"
  >
    <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
    تسجيل الخروج
  </button>
);

export default AppShell;

