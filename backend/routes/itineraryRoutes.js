import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.put('/:id', async (req, res) => {
  const { data, error } = await supabase.from('itinerary_activities').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('itinerary_activities').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
