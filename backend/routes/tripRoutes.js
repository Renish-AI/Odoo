import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('trips').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('trips').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Trip not found' });
  res.status(200).json(data);
});

router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('trips').insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { data, error } = await supabase.from('trips').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('trips').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

router.post('/:id/stops', async (req, res) => {
  const stopData = { ...req.body, trip_id: req.params.id };
  const { data, error } = await supabase.from('trip_stops').insert(stopData).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.get('/:id/budget', async (req, res) => {
  const { data, error } = await supabase.from('expenses').select('*').eq('trip_id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

router.post('/:id/share', async (req, res) => {
  const { data, error } = await supabase.from('trips').update({ is_public: true }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ share_slug: data.share_slug });
});

export default router;
