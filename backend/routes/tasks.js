const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  if (req.body.type === 'Global' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Only admins can post Global tasks' });
  }
  const task = new Task({ ...req.body, createdBy: req.user.id });
  await task.save();
  res.json(task);
});

router.get('/', auth, async (req, res) => {
  const tasks = await Task.find({ $or: [{ createdBy: req.user.id }, { type: 'Global' }] });
  res.json(tasks);
});

router.put('/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

router.delete('/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
});
module.exports = router;