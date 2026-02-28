const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create banner
router.post('/', async (req, res) => {
  const banner = new Banner(req.body);
  try {
    const newBanner = await banner.save();
    res.status(201).json({ success: true, data: newBanner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update banner
router.put('/:id', async (req, res) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updatedBanner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete banner
router.delete('/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
