import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.put('/:id', async (req, res) => {
  const { data, error } = await supabase.from('trip_stops').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('trip_stops').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

router.post('/:stopId/activities', async (req, res) => {
  const actData = { ...req.body, trip_stop_id: req.params.stopId };
  const { data, error } = await supabase.from('itinerary_activities').insert(actData).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
