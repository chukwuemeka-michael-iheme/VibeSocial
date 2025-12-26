
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { Messages } from './pages/Messages';
import { Monetization } from './pages/Monetization';
import { Live } from './pages/Live';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';

const App: React.FC = () => {
  // Use a lazy initializer for state to ensure we read from localStorage
  // immediately upon the very first render cycle.
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('vibesocial_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation: ensure the user has an ID
        return parsed && parsed.id ? parsed : null;
      }
    } catch (e) {
      console.error("Failed to parse session", e);
    }
    return null;
  });

  // Track if we've completed the initial check to prevent flash of login screen
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Sync state if localStorage changes in other tabs or through external scripts
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vibesocial_user') {
        if (e.newValue) {
          setCurrentUser(JSON.parse(e.newValue));
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    setIsInitialized(true);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = useCallback((userData: any) => {
    // Ensure following array exists to prevent crashes in components
    const userWithFollowing = {
      ...userData,
      following: userData.following || [],
      // Ensure essential fields exist
      avatar: userData.avatar || `https://picsum.photos/seed/${userData.id}/200`,
      name: userData.name || 'Vibe User'
    };

    setCurrentUser(userWithFollowing);
    localStorage.setItem('vibesocial_auth', 'true');
    localStorage.setItem('vibesocial_user', JSON.stringify(userWithFollowing));
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('vibesocial_auth');
    localStorage.removeItem('vibesocial_user');
  }, []);

  const handleUpdateUser = useCallback((updatedData: any) => {
    setCurrentUser(updatedData);
    localStorage.setItem('vibesocial_user', JSON.stringify(updatedData));

    // Sync with the permanent users list
    const users = JSON.parse(localStorage.getItem('vibesocial_users') || '[]');
    const updatedUsers = users.map((u: any) => u.id === updatedData.id ? updatedData : u);
    localStorage.setItem('vibesocial_users', JSON.stringify(updatedUsers));
  }, []);

  const toggleFollow = useCallback((targetUserId: string) => {
    if (!currentUser) return;

    const isFollowing = currentUser.following?.includes(targetUserId);
    const newFollowing = isFollowing
      ? currentUser.following.filter((id: string) => id !== targetUserId)
      : [...(currentUser.following || []), targetUserId];

    const updatedUser = { ...currentUser, following: newFollowing };
    handleUpdateUser(updatedUser);
  }, [currentUser, handleUpdateUser]);

  // Don't render anything until we've checked for a session
  if (!isInitialized) return null;

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout user={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Feed user={currentUser} onToggleFollow={toggleFollow} />} />
          <Route path="/messages" element={<Messages user={currentUser} />} />
          <Route path="/monetization" element={<Monetization user={currentUser} />} />
          <Route path="/live" element={<Live user={currentUser} />} />
          <Route path="/profile" element={<Profile user={currentUser} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />} />
          <Route path="/admin" element={<div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Admin dashboard coming soon...</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
