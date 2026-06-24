const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @route   POST api/claims
// @desc    Submit a claim for a found item or reported item
// @access  Private
router.post('/', auth, async (req, res) => {
  const { itemId, proofDescription, verificationAnswer } = req.body;

  try {
    if (!itemId || !proofDescription || !verificationAnswer) {
      return res.status(400).json({ message: 'Please enter all verification details' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status === 'claimed') {
      return res.status(400).json({ message: 'Item has already been claimed and resolved' });
    }

    if (item.reportedBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot submit a claim for an item you reported' });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({ item: itemId, claimer: req.user.id });
    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim for this item' });
    }

    const newClaim = new Claim({
      item: itemId,
      claimer: req.user.id,
      proofDescription,
      verificationAnswer
    });

    const claim = await newClaim.save();
    const populated = await Claim.findById(claim._id)
      .populate('item', 'title status type')
      .populate('claimer', 'username email phone');

    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/claims/user
// @desc    Get all claims submitted by the logged-in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const claims = await Claim.find({ claimer: req.user.id })
      .populate({
        path: 'item',
        populate: {
          path: 'reportedBy',
          select: 'username email phone profilePic'
        }
      })
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/claims/item/:itemId
// @desc    Get all claims submitted for a specific item (for the item owner/reporter)
// @access  Private
router.get('/item/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only the reporter of the item can view claims submitted for it
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to view claims for this item' });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimer', 'username email phone profilePic')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/claims/:id
// @desc    Approve or Reject a claim
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid claim status' });
    }

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    const item = claim.item;
    // Only the reporter of the item can approve/reject claims
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to manage this claim' });
    }

    if (item.status === 'claimed' && status === 'approved') {
      return res.status(400).json({ message: 'This item has already been resolved with another claim' });
    }

    claim.status = status;
    await claim.save();

    if (status === 'approved') {
      // Mark the item as claimed and set claimedBy
      item.status = 'claimed';
      item.claimedBy = claim.claimer;
      await item.save();

      // Reject all other pending claims on this item
      await Claim.updateMany(
        { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
        { $set: { status: 'rejected' } }
      );
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate('claimer', 'username email phone profilePic')
      .populate('item');

    res.json(updatedClaim);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
