import Reservation from '../models/reservations.js';
import Tools from '../models/product.js';
import mongoose from 'mongoose';
import User from '../models/User.js';



export const procureReservations = async (req, res) => {

    // Is userData paimamas userId (id is JWT tokeno)
    const { userId, role } = req.userData;
    try {
      // Suranda visas rezervacijas pagal userId
      let reservations;
      if (role === 'admin'){
      reservations = await Reservation.find()
      .populate('product', 'description nameRetail')
      .select('product quantity dateRange _id toolType tool status pickupLocation contactName contactEmail contactPhone')
      .exec();
      } else{
       reservations = await Reservation.find({userId: userId})
      .populate('product', 'description nameRetail')
      .select('product quantity dateRange _id toolType tool status pickupLocation contactName contactEmail contactPhone')
      .exec();
      }
  
      // Grazina rezultata su rezervaciju sarasu
      res.status(200).json({
        count: reservations.length,
        reservations: reservations.map((reservation) => ({
          _id: reservation._id,
          product: reservation.product,
          quantity: reservation.quantity,
          dateRange: reservation.dateRange,
          toolType: reservation.toolType,
          tool: reservation.tool,
          pickupLocation: reservation.pickupLocation,
          contactName: reservation.contactName,
          contactEmail: reservation.contactEmail,
          contactPhone: reservation.contactPhone,
          status: reservation.status,
          request: {
            type: 'GET',
            url: `http://localhost:3000/reservations/${reservation._id}`
          }
        }))
      });
    } catch (err) {
      // Klaida grazina 500 statusa
      res.status(500).json({ error: err.message });
    }
  }
  export const procureReservation = async (req, res) => {
    try {
      console.log('Reservation ID:', req.params.reservationId);
    console.log('User ID:', req.userData.userId);
      // Suranda rezervacija pagal id
      const reservation = await Reservation.findOne({
        _id: req.params.reservationId,
        userId: req.userData.userId
      }).exec();
    

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      // Grazina rezervacijos informacija
      res.status(200).json({
        reservation: reservation,

  // Is userData paimamas userId (id is JWT tokeno)
  const { userId } = req.userData;
  try {
    // Suranda visas rezervacijas pagal userId
    const reservations = await Reservation.find().populate('product', 'description nameRetail').select('product quantity dateRange _id toolType tool status pickupLocation contactName contactEmail contactPhone').exec();

    // Grazina rezultata su rezervaciju sarasu
    res.status(200).json({
      count: reservations.length,
      reservations: reservations.map((reservation) => ({
        _id: reservation._id,
        product: reservation.product,
        quantity: reservation.quantity,
        dateRange: reservation.dateRange,
        toolType: reservation.toolType,
        tool: reservation.tool,
        pickupLocation: reservation.pickupLocation,
        contactName: reservation.contactName,
        contactEmail: reservation.contactEmail,
        contactPhone: reservation.contactPhone,
        status: reservation.status,

        request: {
          type: 'GET',
          url: `http://localhost:3000/reservations/${reservation._id}`
        }
      }))
    });
  } catch (err) {
    // Klaida grazina 500 statusa
    res.status(500).json({ error: err.message });
  }
};

export const procureUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.params.userId,
      status: { $in: ['Pending', 'Active'] } // Only get active and pending reservations
    })
      .populate('product', 'description.nameRetail')
      .exec();

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const produceReservation = async (req, res) => {
  // Is request paimamas productId, quantity ir dateRange
  const { userId } = req.userData;
  const { productId, toolType, tool, quantity, dateRange, pickupLocation, contactName, contactEmail, contactPhone } = req.body;

  // Patikrina ar dateRange teisingai ivestas
  if (!dateRange || !dateRange.from || !dateRange.to) {
    return res.status(400).json({
      message: 'Invalid date range'
    });
  }

  try {
    // Patikrina ar produktas egzistuoja
    const product = await Tools.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Received dateRange:', dateRange);
    console.log('Creating reservation with data:', {
      productId,
      toolType,
      tool,
      quantity,
      userId,
      dateRange,
      pickupLocation,
      contactName,
      contactEmail,
      contactPhone
    });

    // Sukuria nauja rezervacija
    const reservation = new Reservation({
      _id: new mongoose.Types.ObjectId(),
      product: productId,
      toolType,
      tool,
      quantity: quantity || 1, // Jei nera kiekio, naudoja 1 kaip default
      userId: userId, // Autentifikacijos metu issaugotas userId
      pickupLocation,
      contactName,
      contactEmail,
      contactPhone,
      dateRange: {
        from: dateRange.from,
        to: dateRange.to
      }
    });
    console.log('Created reservation object:', reservation);

    // Iraso rezervacija i duomenu baze
    const savedReservation = await reservation.save();

    await Tools.findByIdAndUpdate(
      productId,
      {
        $push: {
          reservations: {
            userId: userId,
            reservationId: savedReservation._id,
            dateRange: {
              startDate: dateRange.from,
              endDate: dateRange.to
            }
          } // Push nauja irankio rezervacija tools sekcijoje
        }
      },
      { new: true } // Grazina atnaujinta user objekta
    );

    // Prideda rezervacijos id i userio rezervaciju sarasa
    await User.findByIdAndUpdate(
      userId,
      { $push: { reservations: savedReservation._id } }, // Push nauja rezervacija
      { new: true } // Grazina atnaujinta user objekta
    );

    // Grazina atsaka su sukurta rezervacija
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: savedReservation,
      request: {
        type: 'POST',
        url: `http://localhost:3000/reservations/${savedReservation._id}`
      }
    });
  } catch (err) {
    // Grazina klaidos pranesima
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
export const eradicateReservation = async (req, res) => {
  try {
    // Pasalina rezervacija pagal id
    const result = await Reservation.deleteOne({ _id: req.params.reservationId }).exec();

    // Grazina atsaka su informacija apie pasalinima
    res.status(200).json({
      message: 'Reservation deleted',
      request: {
        type: 'DELETE',
        url: 'http://localhost:3000/reservations',
        body: { productId: 'ID', quantity: 'Number' }
      }
    });
  } catch (err) {
    // Grazina klaidos pranesima
    res.status(500).json({ error: err.message });
  }
  
  export const reformReservation = async (req, res) => {
    try {
      const { status } = req.body;
      const reservationId = req.params.reservationId;
      const updateData = req.body;
  
      console.log('Updating reservation with ID:', reservationId);
      console.log('Update data:', updateData);
  
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      if (typeof updateData === 'string') {
        console.log('Only status update detected.');
      } else {
        await Reservation.findByIdAndUpdate(reservationId, updateData, { new: true });
      }
  
      reservation.status = status;
      const updatedReservation = await reservation.save();
  
      res.status(200).json({
        message: 'Reservation updated successfully',
        reservation: updatedReservation,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};

