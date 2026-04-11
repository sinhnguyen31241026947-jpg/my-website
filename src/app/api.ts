import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc`;
const headers = {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json'
};

export async function getVenues() {
  const res = await fetch(`${API_BASE}/venues`, { headers });
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
}

export async function getMatches() {
  const res = await fetch(`${API_BASE}/matches`, { headers });
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function createMatch(match: any) {
  const res = await fetch(`${API_BASE}/matches`, { 
    method: 'POST', headers, body: JSON.stringify(match) 
  });
  if (!res.ok) throw new Error('Failed to create match');
  return res.json();
}

export async function updateMatch(matchId: string, data: any) {
  const res = await fetch(`${API_BASE}/matches/${matchId}`, { 
    method: 'PUT', headers, body: JSON.stringify(data) 
  });
  if (!res.ok) throw new Error('Failed to update match');
  return res.json();
}

export async function createVenue(venue: any) {
  const res = await fetch(`${API_BASE}/venues`, { 
    method: 'POST', headers, body: JSON.stringify(venue) 
  });
  if (!res.ok) throw new Error('Failed to create venue');
  return res.json();
}

export async function getProfile(userId: string) {
  const res = await fetch(`${API_BASE}/profiles/${userId}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function createProfile(profile: any) {
  const res = await fetch(`${API_BASE}/profiles`, { 
    method: 'POST', headers, body: JSON.stringify(profile) 
  });
  if (!res.ok) throw new Error('Failed to create profile');
  return res.json();
}

export async function updateProfile(userId: string, data: any) {
  const res = await fetch(`${API_BASE}/profiles/${userId}`, { 
    method: 'PUT', headers, body: JSON.stringify(data) 
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function getPosts() {
  const res = await fetch(`${API_BASE}/posts`, { headers });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function createPost(post: any) {
  const res = await fetch(`${API_BASE}/posts`, { 
    method: 'POST', headers, body: JSON.stringify(post) 
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

export async function likePost(postId: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, { 
    method: 'PUT', headers 
  });
  if (!res.ok) throw new Error('Failed to like post');
  return res.json();
}

export async function approvePost(postId: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}/approve`, { 
    method: 'PUT', headers 
  });
  if (!res.ok) throw new Error('Failed to approve post');
  return res.json();
}

export async function getMessages(matchId: string) {
  const res = await fetch(`${API_BASE}/messages/${matchId}`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function sendMessage(matchId: string, message: any) {
  const res = await fetch(`${API_BASE}/messages/${matchId}`, { 
    method: 'POST', headers, body: JSON.stringify(message) 
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function createReview(review: any) {
  const res = await fetch(`${API_BASE}/reviews`, { 
    method: 'POST', headers, body: JSON.stringify(review) 
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}

export async function createReport(report: any) {
  const res = await fetch(`${API_BASE}/reports`, { 
    method: 'POST', headers, body: JSON.stringify(report) 
  });
  if (!res.ok) throw new Error('Failed to create report');
  return res.json();
}

export async function getReports() {
  const res = await fetch(`${API_BASE}/reports`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function rejectPost(postId: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, { 
    method: 'PUT', headers, body: JSON.stringify({ status: 'rejected' }) 
  });
  if (!res.ok) throw new Error('Failed to reject post');
  return res.json();
}