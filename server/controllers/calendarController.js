const OutfitPlan = require('../models/OutfitPlan');
const Outfit = require('../models/Outfit');

// @desc    Get calendar plans for logged in user (with optional month/year filter)
// @route   GET /api/calendar
// @access  Private
exports.getPlans = async (req, res, next) => {
  try {
    const { month, year, dateString } = req.query;
    const query = { userId: req.user._id };

    if (dateString) {
      query.dateString = dateString;
    } else if (month && year) {
      // Month is 1-indexed (1 to 12)
      const paddedMonth = String(month).padStart(2, '0');
      const prefix = `${year}-${paddedMonth}`;
      query.dateString = new RegExp(`^${prefix}`);
    }

    const plans = await OutfitPlan.find(query)
      .sort({ plannedDate: 1 })
      .populate({
        path: 'outfitId',
        populate: {
          path: 'clothingItems',
        },
      });

    res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule an outfit for a date
// @route   POST /api/calendar
// @access  Private
exports.createPlan = async (req, res, next) => {
  try {
    const { outfitId, plannedDate, notes } = req.body;

    if (!outfitId || !plannedDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both an outfit and a planned date.',
      });
    }

    // Verify outfit ownership
    const outfit = await Outfit.findOne({
      _id: outfitId,
      userId: req.user._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Selected outfit not found or does not belong to you.',
      });
    }

    const dateObj = new Date(plannedDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid planned date format.',
      });
    }

    const dateString = dateObj.toISOString().split('T')[0];

    // Check for duplicate plan on the same date for this outfit
    const existingPlan = await OutfitPlan.findOne({
      userId: req.user._id,
      outfitId,
      dateString,
    });

    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: `This outfit is already scheduled for ${dateString}. Please choose a different outfit or date.`,
      });
    }

    const plan = await OutfitPlan.create({
      userId: req.user._id,
      outfitId,
      plannedDate: dateObj,
      dateString,
      notes: notes ? notes.trim() : '',
    });

    const populatedPlan = await OutfitPlan.findById(plan._id).populate({
      path: 'outfitId',
      populate: {
        path: 'clothingItems',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Outfit planned successfully.',
      plan: populatedPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an outfit plan (e.g. notes or date)
// @route   PUT /api/calendar/:id
// @access  Private
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await OutfitPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Outfit plan not found.',
      });
    }

    const { plannedDate, notes, outfitId } = req.body;

    if (outfitId && outfitId !== plan.outfitId.toString()) {
      const outfit = await Outfit.findOne({ _id: outfitId, userId: req.user._id });
      if (!outfit) {
        return res.status(404).json({ success: false, message: 'Outfit not found.' });
      }
      plan.outfitId = outfitId;
    }

    if (plannedDate) {
      const dateObj = new Date(plannedDate);
      const dateString = dateObj.toISOString().split('T')[0];

      // Check if new date causes duplicate
      const duplicate = await OutfitPlan.findOne({
        _id: { $ne: plan._id },
        userId: req.user._id,
        outfitId: plan.outfitId,
        dateString,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `This outfit is already scheduled for ${dateString}.`,
        });
      }

      plan.plannedDate = dateObj;
      plan.dateString = dateString;
    }

    if (notes !== undefined) {
      plan.notes = notes.trim();
    }

    await plan.save();

    const populatedPlan = await OutfitPlan.findById(plan._id).populate({
      path: 'outfitId',
      populate: { path: 'clothingItems' },
    });

    res.status(200).json({
      success: true,
      message: 'Outfit plan updated successfully.',
      plan: populatedPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an outfit plan
// @route   DELETE /api/calendar/:id
// @access  Private
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await OutfitPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Outfit plan not found.',
      });
    }

    await OutfitPlan.deleteOne({ _id: plan._id });

    res.status(200).json({
      success: true,
      message: 'Outfit plan removed from calendar.',
    });
  } catch (error) {
    next(error);
  }
};

