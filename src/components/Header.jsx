import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getTypeLabel } from '../utils/constituencyHelpers';
import { LogOut, Shield, Info, Home, User } from 'lucide-react';

const styles = {
  header: {
    background: 'linear-gradient(135deg, #FF9933 0%, #FF8019 100%)',
    padding: '0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  triStripe: {
    display: 'flex',
    height: '4px',
  },
  saffronStripe: {
    flex: 1,
    background: '#FF9933',
  },
  whiteStripe: {
    flex: 1,
    background: '#FFFFFF',
  },
  greenStripe: {
    flex: 1,
    background: '#138808',
  },
  inner: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#FFFFFF',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: '#FFFFFF',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800',
    color: '#FF9933',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  logoSub: {
    fontSize: '11px',
    fontWeight: '400',
    opacity: 0.9,
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    transition: 'all 0.2s',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  navLinkActive: {
    background: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
  },
  constituencyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.15)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  changeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: '4px',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.6)',
    cursor: 'pointer',
  },
  avatarPlaceholder: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  signInBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#FF9933',
    background: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    gap: '3px',
  },
};

export default function Header() {
  const { constituency, clearConstituency, isAdmin, logoutAdmin, constituencyType } = useApp();
  const { user, isSignedIn, signInWithGoogle, signOutUser, authError, clearAuthError } = useAuth();
  const location = useLocation();

  return (
    <header>
      <div style={styles.triStripe}>
        <div style={styles.saffronStripe} />
        <div style={styles.whiteStripe} />
        <div style={styles.greenStripe} />
      </div>
      <div style={styles.header}>
        <div style={styles.inner}>
          <Link to="/" style={styles.logoArea}>
            <div style={styles.logoIcon}>J</div>
            <div>
              <div style={styles.logoText}>JanAwaaz</div>
              <div style={styles.logoSub}>People&apos;s Voice</div>
            </div>
          </Link>

          <div style={styles.nav}>
            {constituency && (
              <div style={styles.constituencyBadge}>
                <span>{constituency.name}, {constituency.state} ({getTypeLabel(constituencyType)})</span>
                <button
                  onClick={clearConstituency}
                  style={styles.changeBtn}
                  title="Change constituency"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            <Link
              to="/"
              style={{
                ...styles.navLink,
                ...(location.pathname === '/' ? styles.navLinkActive : {}),
              }}
            >
              <Home size={15} />
              <span>Home</span>
            </Link>

            <Link
              to="/about"
              style={{
                ...styles.navLink,
                ...(location.pathname === '/about' ? styles.navLinkActive : {}),
              }}
            >
              <Info size={15} />
              <span>About</span>
            </Link>

            <Link
              to="/admin"
              style={{
                ...styles.navLink,
                ...(location.pathname === '/admin' ? styles.navLinkActive : {}),
              }}
            >
              <Shield size={15} />
              <span>Admin</span>
            </Link>

            {isAdmin && (
              <button
                onClick={logoutAdmin}
                style={styles.navLink}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            )}

            <div style={styles.userArea}>
              {isSignedIn ? (
                <>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      style={styles.avatar}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      <User size={16} />
                    </div>
                  )}
                  <span style={styles.userName}>
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <button onClick={signOutUser} style={styles.signOutBtn} title="Sign out">
                    <LogOut size={13} />
                  </button>
                </>
              ) : (
                <button onClick={signInWithGoogle} style={styles.signInBtn}>
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {authError && (
        <div style={{
          background: '#FFF3E0',
          border: '1px solid #FFB74D',
          padding: '10px 24px',
          fontSize: '13px',
          color: '#E65100',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          <span>{authError}</span>
          <button
            onClick={clearAuthError}
            style={{
              background: 'none',
              border: 'none',
              color: '#E65100',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '16px',
            }}
          >
            ×
          </button>
        </div>
      )}
    </header>
  );
}
