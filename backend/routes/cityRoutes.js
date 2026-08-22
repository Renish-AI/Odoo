import express from 'express';

const router = express.Router();

// Static mock for now
router.get('/', (req, res) => {
  res.status(200).json([{ city: 'Paris', country: 'France' }, { city: 'Tokyo', country: 'Japan' }]);
});

router.get('/search', (req, res) => {
  const query = req.query.q;
  res.status(200).json({ query, results: [] });
});

router.get('/:cityId/activities', (req, res) => {
  res.status(200).json([{ id: 1, name: 'Sample Activity', city_id: req.params.cityId }]);
});

export default router;
