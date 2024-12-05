import express from 'express';
import auth from '../middleware/auth.js';
import * as controller from "../controllers/reservationsController.js"
import adminAuth from '../middleware/admin.js';
import Reservation from '../models/reservations.js';

const router = express.Router();


router.get('/', auth, adminAuth, controller.procureReservations);

// POST sukuria nauja rezervacija (naudojant auth middleware)
router.post('/', auth, controller.produceReservation);

// Traukiam rezervacijas pagal user ID

router.get('/user/:userId', async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.params.userId
      // Removed the status filter to get all reservations
    })
      .populate('product', 'description.nameRetail')
      .exec();

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gaunam rezervacijas pagal specifini productId
router.get('/product/:productId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ product: req.params.productId })
      .select('dateRange')
      .exec();

    res.status(200).json({
      reservations: reservations.map((reservation) => ({
        from: reservation.dateRange.from,
        to: reservation.dateRange.to
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET vienos rezervacijos informacija pagal id
router.get('/:reservationId', auth, controller.procureReservation);

// DELETE rezervacija pagal id
router.delete('/:reservationId', auth, controller.eradicateReservation);

// PUT rezervaciju tvirtinimas
router.put('/:reservationId', auth, adminAuth, controller.reformReservation);


export default router;
