import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS and logging
app.use('*', cors());
app.use('*', logger(console.log));

// Health check route
app.get('/make-server-eeef72dc/health', (c) => c.text('OK'));

// Auth Signup route
app.post('/make-server-eeef72dc/signup', async (c) => {
  try {
    const { email, password, name, gender, dob, weight, height, faculty, interests, level, bio } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return c.json({ error: 'Server misconfiguration' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: name || email.split('@')[0],
        gender: gender || '',
        dob: dob || '',
        weight: weight || '',
        height: height || '',
        faculty: faculty || '',
        interests: interests || [],
        level: level || '',
        bio: bio || ''
      },
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Matches API
app.get('/make-server-eeef72dc/matches', async (c) => {
  try {
    const matches = await kv.getByPrefix('match_');
    return c.json(matches.map(m => m.value));
  } catch (error) {
    console.error('Error fetching matches:', error);
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
    console.error('Error creating match:', error);
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
    console.error('Error updating match:', error);
    return c.json({ error: 'Failed to update match' }, 500);
  }
});

// Venues API
app.get('/make-server-eeef72dc/venues', async (c) => {
  try {
    const venues = await kv.getByPrefix('venue_');
    return c.json(venues.map(v => v.value));
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

// Groups API
app.get('/make-server-eeef72dc/groups', async (c) => {
  try {
    const groups = await kv.getByPrefix('group_');
    return c.json(groups.map(g => g.value));
  } catch (error) {
    return c.json({ error: 'Failed to fetch groups' }, 500);
  }
});

app.post('/make-server-eeef72dc/groups', async (c) => {
  try {
    const group = await c.req.json();
    const id = crypto.randomUUID();
    const newGroup = { ...group, id, createdAt: new Date().toISOString() };
    await kv.set(`group_${id}`, newGroup);
    return c.json(newGroup, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create group' }, 500);
  }
});

// Posts / Feed API
app.get('/make-server-eeef72dc/posts', async (c) => {
  try {
    const posts = await kv.getByPrefix('post_');
    return c.json(posts.map(p => p.value));
  } catch (error) {
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

app.post('/make-server-eeef72dc/posts', async (c) => {
  try {
    const post = await c.req.json();
    const id = crypto.randomUUID();
    const newPost = { ...post, id, createdAt: new Date().toISOString(), likes: 0, comments: [] };
    await kv.set(`post_${id}`, newPost);
    return c.json(newPost, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

app.put('/make-server-eeef72dc/posts/:id/like', async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`post_${id}`);
    if (!existing) return c.json({ error: 'Post not found' }, 404);
    
    const updatedPost = { ...existing, likes: (existing.likes || 0) + 1 };
    await kv.set(`post_${id}`, updatedPost);
    return c.json(updatedPost);
  } catch (error) {
    return c.json({ error: 'Failed to like post' }, 500);
  }
});

// User Profiles API
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

Deno.serve(app.fetch);
