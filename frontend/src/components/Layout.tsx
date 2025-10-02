import { Link, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
  { to: '/profile/edit', label: 'Edit Profile' },
  { to: '/interviewers', label: 'Interviewers' },
];

interface LayoutProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

const Layout = ({ title, subtitle, children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        </div>
        <nav className="nav">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? 'nav-link active' : 'nav-link'}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <small>InterviewSelect &copy; {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
};

export default Layout;
