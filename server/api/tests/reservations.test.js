import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import Reservation from '../models/reservations.js';
import mongoose from 'mongoose';
import reservationsRouter from '../routes/reservations.js';
import Tools from '../models/product.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const mockSave = vi.fn();

vi.mock('../models/reservations.js', () => ({
  default: class {
    constructor() {
      this.save = vi.fn().mockResolvedValue({
        _id: 'mockReservationId',
        product: 'mockProductId',
        quantity: 1,
        dateRange: { from: '2025-01-01', to: '2024-01-10' },
      });
    }


    static find = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),  
      select: vi.fn().mockReturnThis(),    
      exec: vi.fn().mockResolvedValue([{
        _id: 'mockReservationId',
        product: 'mockProductId',
        quantity: 1,
        dateRange: { from: '2025-01-01', to: '2024-01-10' },
        toolType: 'mockToolType',
        tool: 'mockTool',
        pickupLocation: 'mockPickupLocation',
        contactName: 'mockContactName',
        contactEmail: 'mockContactEmail',
        status: 'mockStatus'
      }])  
    });

    
    static findOne = vi.fn();
    static deleteOne = vi.fn();
    
  }
}));





vi.mock('../models/product.js', () => ({
    default: {
      findById: vi.fn().mockResolvedValueOnce({
        _id: 'mockProductId',
        name: 'Mock Product',
        price: 100,
      }).mockImplementation((id) => {
        console.log(`findById called with id: ${id}`);
        return { _id: 'mockProductId', name: 'Mock Product', price: 100 }; // Mocked return value
      }),
      findByIdAndUpdate: vi.fn().mockResolvedValue({
        _id: 'mockProductId',
        name: 'Updated Mock Product',
        price: 120,
      }).mockImplementation((id, updateData) => {
        console.log(`findByIdAndUpdate called with id: ${id} and data:`, updateData);
        return { _id: 'mockProductId', name: 'Updated Mock Product', price: 120 }; // Mocked return value
      }),
    },
  }));
  

vi.mock('../models/User.js', () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
  },
}));


vi.mock('../middleware/auth', () => ({
  default: ((req, res, next) => {
    console.log('mock user auth is called')
    req.userData = { userId: 'mockUserId', role: 'user' };  

    
    next();
  }),
}));

vi.mock('../middleware/admin', () => ({
  default: ((req, res, next)=> {
    console.log('mock admin auth is called')
    req.userData = { userId: 'mockUserId', role: 'adminAuth' };
    next()
  })
}))


const app = express();
app.use(express.json());
app.use('/reservations', reservationsRouter);


describe('Reservations API Tests', () => {
  
  //Testing GET /reservations
  it('GET / returning all reservations for authenticated users', async () => {
    const res = await request(app)
      .get('/reservations') 
      .set('Authorization', 'Bearer mockToken');  
  
  
    expect(res.status).toBe(200);
    expect(res.body.reservations).toHaveLength(1);
    expect(res.body.reservations[0].product).toBe('mockProductId');  
  });


  //Testing POST /reservations
  it('POST / should create a new reservation', async () => {
    const mockProduct = { _id: 'mockProductId', name: 'Mock Tool' };
    const mockSavedReservation = {
      _id: 'mockReservationId',
      product: mockProduct._id,
      quantity: 1,
      userId: 'mockUserId',
      dateRange: { from: '2024-01-01', to: '2024-01-10' },
    };

    Tools.findById.mockResolvedValue(mockProduct);
    mockSave.mockResolvedValue(mockSavedReservation); 
    Tools.findByIdAndUpdate.mockResolvedValue(mockProduct);
    User.findByIdAndUpdate.mockResolvedValue({});


    const res = await request(app)
      .post('/reservations')
      .send({
        productId: mockProduct._id,
        quantity: 1,
        dateRange: { from: '2024-01-01', to: '2024-01-10' },
      })
      .set('Authorization', 'Bearer mockToken');


    expect(res.status).toBe(201);
    expect(res.body.reservation.product).toBe(mockProduct._id);

  });
 

  ////GET BY ID reservation
  it('GET /:reservationId should return a reservation by ID', async () => {
    const mockReservation = {
      _id: 'mockReservationId',
      product: 'mockProductId',
      quantity: 1,
      userId: 'mockUserId',
      dateRange: { from: '2024-01-01', to: '2024-01-10' },
    };
    Reservation.findOne = vi.fn().mockImplementation(() => ({
      exec: vi.fn().mockResolvedValue({
        _id: 'mockReservationId',
        product: 'mockProductId',
        quantity: 1,
        userId: 'mockUserId',
        dateRange: { from: '2024-01-01', to: '2024-01-10' },
      }),
    }));
    
    const res = await request(app)
      .get('/reservations/mockReservationId')
      .set('Authorization', 'Bearer mockToken');
  
    expect(res.status).toBe(200);
    expect(res.body.reservation._id).toBe(mockReservation._id);
  });


  //DELETE reservation test
  it('DELETE /:reservationId should delete a reservation by ID', async () => {


    Reservation.deleteOne = vi.fn(() => ({
      exec: vi.fn().mockResolvedValue({ deletedCount: 1 })
    }));
    

    const res = await request(app)
    .delete('/reservations/mockReservationId')
    .set('Authorization', 'Bearer mockToken');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Reservation deleted')
    expect(Reservation.deleteOne).toBeCalledWith({_id: 'mockReservationId'})
    
  })

  //PUT rezervaciju editinimas
  it('PUT /:reservationId should update the status of a reservation by ID', async () => {
    const mockReservationId = 'mockReservationId';
    const mockUpdatedReservation = {
      _id: mockReservationId,
      product: 'mockProductId',
      quantity: 1,
      userId: 'mockUserId',
      dateRange: { from: '2024-01-01', to: '2024-01-15' },
      status: 'initialStatus',
    };
  
    const mockSave = vi.fn().mockResolvedValue({
      ...mockUpdatedReservation,
      status: 'updatedStatus',
    });
  
    Reservation.findById = vi.fn().mockResolvedValue({
      ...mockUpdatedReservation,
      save: mockSave,
    });
  
    Reservation.findByIdAndUpdate = vi.fn().mockResolvedValue({
      ...mockUpdatedReservation,
      status: 'updatedStatus',
    });
 
    const res = await request(app)
      .put(`/reservations/${mockReservationId}`)
      .send({ status: 'updatedStatus' })
      .set('Authorization', 'Bearer mockToken');
  

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Reservation updated successfully');
    expect(res.body.reservation.status).toBe('updatedStatus');

    expect(Reservation.findById).toHaveBeenCalledWith(mockReservationId);
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
})