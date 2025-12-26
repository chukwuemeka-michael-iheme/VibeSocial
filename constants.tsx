
import React from 'react';
import { Home, MessageSquare, Video, Wallet, User, ShieldCheck } from 'lucide-react';

export const COLORS = {
  primary: '#8b5cf6', // Violet 500
  secondary: '#ec4899', // Pink 500
  accent: '#06b6d4', // Cyan 500
  bg: '#020617', // Slate 950
  surface: '#1e293b', // Slate 800
};

export const NAVIGATION_ITEMS = [
  { label: 'Home', icon: <Home size={22} />, path: '/' },
  { label: 'Messages', icon: <MessageSquare size={22} />, path: '/messages' },
  { label: 'Live', icon: <Video size={22} />, path: '/live' },
  { label: 'Wallet', icon: <Wallet size={22} />, path: '/monetization' },
  { label: 'Profile', icon: <User size={22} />, path: '/profile' },
  { label: 'Admin', icon: <ShieldCheck size={22} />, path: '/admin' },
];

export const FEELINGS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '🤪', label: 'Crazy' },
  { emoji: '😌', label: 'Blissful' },
  { emoji: '🙏', label: 'Grateful' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '💪', label: 'Motivated' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🥳', label: 'Celebrating' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🙌', label: 'Blessed' },
];
