const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Item = require('../models/Item');

// @route   GET api/items
// @desc    Get all items (with filters and searching)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, category, status, search, location } = req.query;
    let query = {};

    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    } else {
      // default: don't show claimed items unless explicitly searched or queried
      // Actually, showing all is fine, but we can let UI handle status or search both.
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const items = await Item.find(query)
      .populate('reportedBy', 'username email phone profilePic')
      .populate('claimedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'username email phone profilePic')
      .populate('claimedBy', 'username email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/items
// @desc    Create a lost or found report
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, category, type, location, date, image } = req.body;

  try {
    if (!title || !description || !category || !type || !location) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const newItem = new Item({
      title,
      description,
      category,
      type,
      location,
      date: date || Date.now(),
      image: image || '',
      reportedBy: req.user.id
    });

    const item = await newItem.save();
    const populatedItem = await Item.findById(item._id).populate('reportedBy', 'username email phone profilePic');
    res.json(populatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/items/:id
// @desc    Update a report
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, category, location, date, image, status } = req.body;

  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Make sure user owns item
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;
    if (category) updatedFields.category = category;
    if (location) updatedFields.location = location;
    if (date) updatedFields.date = date;
    if (image !== undefined) updatedFields.image = image;
    if (status) updatedFields.status = status;

    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    ).populate('reportedBy', 'username email phone profilePic');

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Make sure user owns item
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
