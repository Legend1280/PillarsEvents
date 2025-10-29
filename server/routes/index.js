import { Router } from 'express';

const router = Router();

router.get('/hello', (_req, res) => {
  res.json({ message: 'Backend is running successfully!' });
});

export default router;
