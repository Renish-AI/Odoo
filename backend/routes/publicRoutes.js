import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/trips/:slug', async (req, res) => {
  const { data, error } = await supabase.from('trips').select('*').eq('share_slug', req.params.slug).eq('is_public', true).single();
  if (error) return res.status(404).json({ error: 'Public trip not found' });
  res.status(200).json(data);
});

router.post('/trips/:slug/copy', async (req, res) => {
  // Logic to duplicate a public trip for the current authenticated user
  res.status(501).json({ error: 'Not Implemented' });
});

export default router;
