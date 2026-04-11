import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

app.get('/make-server-eeef72dc/health', (c) => c.text('OK'));

app.post('/make-server-eeef72dc/signup', async (c) => {
  try {
    const { email, password, name, gender, dob, weight, height, faculty, interests, level, bio } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Missing email or password' }, 400);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !supabaseServiceRoleKey) return c.json({ error: 'Server misconfiguration' }, 500);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data, error } = await supabase.auth.admin.createUser({
      email, password,
      user_metadata: { name: name || email.split('@')[0], gender: gender || '', dob: dob || '', weight: weight || '', height: height || '', faculty: faculty || '', interests: interests || [], level: level || '', bio: bio || '' },
      email_confirm: true
    });
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ user: data.user });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Matches API
app.get('/make-server-eeef72dc/matches', async (c) => {
  try {
    const matches = await kv.getByPrefix('match_');
    return c.json(matches.filter((m: any) => m !== null && m !== undefined && typeof m === 'object' && m.id));
  } catch (error) {
    return c.json({ error: 'Failed to fetch matches' }, 500);
  }
});

app.post('/make-server-eeef72dc/matches', async (c) => {
  try {
    const match = await c.req.json();
    const id = crypto.randomUUID();
    const newMatch = { ...match, id, createdAt: new Date().toISOString() };
    await kv.set(`match_${id}`, newMatch);
    return c.json(newMatch, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create match' }, 500);
  }
});

app.put('/make-server-eeef72dc/matches/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    const existing = await kv.get(`match_${id}`);
    if (!existing) return c.json({ error: 'Match not found' }, 404);
    const updatedMatch = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    await kv.set(`match_${id}`, updatedMatch);
    return c.json(updatedMatch);
  } catch (error) {
    return c.json({ error: 'Failed to update match' }, 500);
  }
});

// Venues API
app.get('/make-server-eeef72dc/venues', async (c) => {
  try {
    const venues = await kv.getByPrefix('venue_');
    return c.json(venues.filter((v: any) => v !== null && v !== undefined && typeof v === 'object' && v.id));
  } catch (error) {
    return c.json({ error: 'Failed to fetch venues' }, 500);
  }
});

app.post('/make-server-eeef72dc/venues', async (c) => {
  try {
    const venue = await c.req.json();
    const id = crypto.randomUUID();
    const newVenue = { ...venue, id, createdAt: new Date().toISOString() };
    await kv.set(`venue_${id}`, newVenue);
    return c.json(newVenue, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create venue' }, 500);
  }
});

// Posts API
app.get('/make-server-eeef72dc/posts', async (c) => {
  try {
    const posts = await kv.getByPrefix('post_');
    return c.json(posts.filter((p: any) => p !== null && p !== undefined && typeof p === 'object' && p.id));
  } catch (error) {
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

app.post('/make-server-eeef72dc/posts', async (c) => {
  try {
    const post = await c.req.json();
    const id = crypto.randomUUID();
    const newPost = { ...post, id, createdAt: new Date().toISOString(), likes: 0, comments: [], status: 'pending' };
    await kv.set(`post_${id}`, newPost);
    return c.json(newPost, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

app.put('/make-server-eeef72dc/posts/:id/approve', async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`post_${id}`);
    if (!existing) return c.json({ error: 'Post not found' }, 404);
    const updatedPost = { ...existing, status: 'approved', approvedAt: new Date().toISOString() };
    await kv.set(`post_${id}`, updatedPost);
    
    // Tính chuỗi cho người đăng bài
    if (existing.authorId) {
      const profile = await kv.get(`profile_${existing.authorId}`);
      if (profile) {
        const updatedProfile = { ...profile, currentStreak: (profile.currentStreak || 0) + 1, updatedAt: new Date().toISOString() };
        await kv.set(`profile_${existing.authorId}`, updatedProfile);
      }
    }
    
    return c.json(updatedPost);
  } catch (error) {
    return c.json({ error: 'Failed to approve post' }, 500);
  }
});

app.put('/make-server-eeef72dc/posts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const existing = await kv.get(`post_${id}`);
    if (!existing) return c.json({ error: 'Post not found' }, 404);
    const updatedPost = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await kv.set(`post_${id}`, updatedPost);
    return c.json(updatedPost);
  } catch (error) {
    return c.json({ error: 'Failed to update post' }, 500);
  }
});

// Profiles API
app.get('/make-server-eeef72dc/profiles/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const profile = await kv.get(`profile_${id}`);
    if (!profile) return c.json({ error: 'Profile not found' }, 404);
    return c.json(profile);
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.post('/make-server-eeef72dc/profiles', async (c) => {
  try {
    const profile = await c.req.json();
    await kv.set(`profile_${profile.id}`, profile);
    return c.json(profile, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create profile' }, 500);
  }
});

app.put('/make-server-eeef72dc/profiles/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    const existing = await kv.get(`profile_${id}`);
    if (!existing) return c.json({ error: 'Profile not found' }, 404);
    const updatedProfile = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    await kv.set(`profile_${id}`, updatedProfile);
    return c.json(updatedProfile);
  } catch (error) {
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Messages API
app.get('/make-server-eeef72dc/messages/:matchId', async (c) => {
  try {
    const matchId = c.req.param('matchId');
    const messages = await kv.getByPrefix(`message_${matchId}_`);
    const sorted = messages
      .filter((m: any) => m !== null && m !== undefined && typeof m === 'object')
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return c.json(sorted);
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

app.post('/make-server-eeef72dc/messages/:matchId', async (c) => {
  try {
    const matchId = c.req.param('matchId');
    const message = await c.req.json();
    const id = crypto.randomUUID();
    const newMessage = { ...message, id, createdAt: new Date().toISOString() };
    await kv.set(`message_${matchId}_${id}`, newMessage);
    return c.json(newMessage, 201);
  } catch (error) {
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Reviews API
app.get('/make-server-eeef72dc/reviews/:targetId', async (c) => {
  try {
    const targetId = c.req.param('targetId');
    const reviews = await kv.getByPrefix(`review_${targetId}_`);
    return c.json(reviews.filter((r: any) => r !== null && r !== undefined && typeof r === 'object'));
  } catch (error) {
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

app.post('/make-server-eeef72dc/reviews', async (c) => {
  try {
    const review = await c.req.json();
    const id = crypto.randomUUID();
    const newReview = { ...review, id, createdAt: new Date().toISOString() };
    await kv.set(`review_${review.targetId}_${id}`, newReview);
    const existingProfile = await kv.get(`profile_${review.targetId}`);
    if (existingProfile) {
      const bonusPoints = review.rating >= 4 ? 5 : review.rating >= 3 ? 2 : 0;
      if (bonusPoints > 0) {
        await kv.set(`profile_${review.targetId}`, {
          ...existingProfile,
          reputationScore: (existingProfile.reputationScore || 100) + bonusPoints,
          updatedAt: new Date().toISOString()
        });
      }
    }
    return c.json(newReview, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// Reports API
app.get('/make-server-eeef72dc/reports', async (c) => {
  try {
    const reports = await kv.list<any>('report_');
    if (!reports || reports.length === 0) return c.json([]);
    return c.json(reports.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (error) {
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

app.post('/make-server-eeef72dc/reports', async (c) => {
  try {
    const report = await c.req.json();
    const id = crypto.randomUUID();
    const newReport = { ...report, id, createdAt: new Date().toISOString() };
    await kv.set(`report_${id}`, newReport);
    return c.json(newReport, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create report' }, 500);
  }
});

Deno.serve(app.fetch);