
export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface Feeling {
  emoji: string;
  label: string;
}

export interface Comment {
  id: string;
  userId: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  following: string[]; 
  isVerified: boolean;
  walletBalance: number;
  email?: string;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  coverPhoto?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaItems?: MediaItem[]; // Supports multiple images/videos
  isReel?: boolean; // Distinguishes Reels from standard posts
  feeling?: Feeling; // Facebook-like feeling status
  likes: number;
  likedBy?: string[]; // Track which users liked the post
  comments: number;
  commentsList?: Comment[]; // Actual list of comments
  shares: number;
  timestamp: string;
  author: Partial<User>;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  participants: User[];
  lastMessage?: string;
}

export enum AppRoute {
  FEED = '/',
  PROFILE = '/profile',
  MESSAGES = '/messages',
  LIVE = '/live',
  MONETIZATION = '/monetization',
  ADMIN = '/admin',
  LOGIN = '/login'
}
