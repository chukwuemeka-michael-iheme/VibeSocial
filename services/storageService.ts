
import { Post } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

class StorageService {
  async getAllPosts(): Promise<Post[]> {
    const response = await fetch(`${API_BASE}/posts`);
    const data = await response.json();
    return data.map((p: any) => ({
      id: p.id.toString(),
      userId: p.user_id.toString(),
      content: p.content,
      mediaItems: p.image ? [{ url: p.image, type: 'image' }] : undefined,
      likes: 0, // Placeholder
      comments: 0, // Placeholder
      shares: 0, // Placeholder
      timestamp: p.created_at,
      author: {
        id: p.user_id.toString(),
        displayName: p.name,
        avatar: p.avatar,
      }
    }));
  }

  async savePost(post: Post, clerkId: string): Promise<void> {
    await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkId,
        content: post.content,
        image: post.mediaItems?.[0]?.url
      })
    });
    window.dispatchEvent(new CustomEvent('vibeUpdate'));
  }

  async updatePost(updatedPost: Post): Promise<void> {
    // Placeholder, not implemented
    window.dispatchEvent(new CustomEvent('vibeUpdate'));
  }

  async deletePost(id: string): Promise<void> {
    // Placeholder, not implemented
    window.dispatchEvent(new CustomEvent('vibeUpdate'));
  }

  async getAllStories(): Promise<any[]> {
    // Placeholder
    return [];
  }

  async saveStory(story: any): Promise<void> {
    // Placeholder
    window.dispatchEvent(new CustomEvent('vibeUpdate'));
  }
}

export const storageService = new StorageService();
