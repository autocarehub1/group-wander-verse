import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertUserSchema, insertTripSchema, insertTripExpenseSchema, 
  insertExpenseSplitSchema, insertPaymentProofSchema, insertMessageSchema, insertTripParticipantSchema,
  insertTripInvitationSchema, insertItineraryItemSchema, insertItineraryDaySchema
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'payment-proofs');
const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only allow image files for payment screenshots
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for avatar uploads
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: avatarDir,
    filename: (req, file, cb) => {
      const uniqueName = `${req.params.id}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for avatars
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve uploaded payment proof images
  app.get('/api/uploads/payment-proofs/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers for image files
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.sendFile(filePath);
  });

  // Serve uploaded avatar images
  app.get('/api/uploads/avatars/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(avatarDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers for image files
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.sendFile(filePath);
  });

  // Upload payment proof file
  app.post('/api/uploads/payment-proof', upload.single('payment_proof'), (req: Request & { file?: Express.Multer.File }, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/api/uploads/payment-proofs/${req.file.filename}`;
    res.json({
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Avatar upload endpoint
  app.post("/api/users/:id/avatar", avatarUpload.single('avatar'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Create the avatar URL pointing to our uploaded file
      const avatarUrl = `/api/uploads/avatars/${req.file.filename}`;
      
      // Update user's avatar URL in database
      const updatedUser = await storage.updateUser(req.params.id, { avatar_url: avatarUrl });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ avatar_url: avatarUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trip routes
  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(trip);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/trips", async (req, res) => {
    try {
      const trips = await storage.getTripsByUser(req.params.userId);
      res.json(trips);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);
      
      // Add creator as participant
      if (tripData.created_by) {
        await storage.addTripParticipant({
          trip_id: trip.id,
          user_id: tripData.created_by,
          role: "organizer",
          status: "active"
        });
      }
      
      res.status(201).json(trip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const updates = insertTripSchema.partial().parse(req.body);
      const trip = await storage.updateTrip(req.params.id, updates);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(trip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const success = await storage.deleteTrip(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trip participants routes
  app.get("/api/trips/:tripId/participants", async (req, res) => {
    try {
      const participants = await storage.getTripParticipants(req.params.tripId);
      res.json(participants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips/:tripId/participants", async (req, res) => {
    try {
      const participantData = insertTripParticipantSchema.parse({
        ...req.body,
        trip_id: req.params.tripId
      });
      const participant = await storage.addTripParticipant(participantData);
      res.status(201).json(participant);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/trips/:tripId/participants/:userId", async (req, res) => {
    try {
      const updates = insertTripParticipantSchema.partial().parse(req.body);
      const participant = await storage.updateTripParticipant(req.params.tripId, req.params.userId, updates);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      res.json(participant);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/trips/:tripId/participants/:userId", async (req, res) => {
    try {
      const success = await storage.removeTripParticipant(req.params.tripId, req.params.userId);
      if (!success) {
        return res.status(404).json({ error: "Participant not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trip invitations routes
  app.get("/api/trips/:tripId/invitations", async (req, res) => {
    try {
      const invitations = await storage.getTripInvitations(req.params.tripId);
      res.json(invitations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invitations/:token", async (req, res) => {
    try {
      const invitation = await storage.getTripInvitation(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      res.json(invitation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips/:tripId/invitations", async (req, res) => {
    try {
      // For now, use a mock user ID - in production this would come from authentication
      const currentUserId = "ebb7ab9c-ffc7-444b-b499-4ca8796b4a27";
      
      const validatedData = insertTripInvitationSchema.parse({
        ...req.body,
        trip_id: req.params.tripId,
        invited_by: currentUserId
      });
      const invitation = await storage.createTripInvitation(validatedData);
      
      // Send email invitation if invite type is email
      if (invitation.invite_type === 'email' && invitation.invite_value) {
        try {
          // Get trip and inviter details for the email
          const trip = await storage.getTrip(req.params.tripId);
          const inviter = await storage.getUser(currentUserId);
          
          if (trip && inviter) {
            const { sendInvitationEmail } = await import('./emailService');
            const emailSent = await sendInvitationEmail({
              recipientEmail: invitation.invite_value,
              tripTitle: trip.title,
              tripDestination: trip.destination,
              inviterName: inviter.full_name || inviter.email || 'Someone',
              invitationToken: invitation.invitation_token,
              customMessage: invitation.message || undefined
            });
            
            if (!emailSent) {
              console.error('Failed to send invitation email to:', invitation.invite_value);
            }
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Don't fail the invitation creation if email fails
        }
      }
      
      // Send SMS invitation if invite type is phone
      if (invitation.invite_type === 'phone' && invitation.invite_value) {
        try {
          // Get trip and inviter details for the SMS
          const trip = await storage.getTrip(req.params.tripId);
          const inviter = await storage.getUser(currentUserId);
          
          if (trip && inviter) {
            const { sendInvitationSMS } = await import('./smsService');
            const smsSent = await sendInvitationSMS({
              phoneNumber: invitation.invite_value,
              tripTitle: trip.title,
              tripDestination: trip.destination,
              inviterName: inviter.full_name || inviter.email || 'Someone',
              invitationToken: invitation.invitation_token,
              customMessage: invitation.message || undefined
            });
            
            if (!smsSent) {
              console.error('Failed to send invitation SMS to:', invitation.invite_value);
            }
          }
        } catch (smsError) {
          console.error('SMS sending error:', smsError);
          // Don't fail the invitation creation if SMS fails
        }
      }
      
      res.status(201).json(invitation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/invitations/:token/accept", async (req, res) => {
    try {
      // For now, simplified acceptance - just return success
      // Full implementation would handle adding user to trip participants
      const result = await storage.acceptInvitation(req.params.token, req.body.user_id);
      if (!result) {
        return res.status(404).json({ error: "Invitation not found or expired" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/invitations/:id", async (req, res) => {
    try {
      const updates = insertTripInvitationSchema.partial().parse(req.body);
      const invitation = await storage.updateTripInvitation(req.params.id, updates);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      res.json(invitation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Messages routes
  app.get("/api/trips/:tripId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.tripId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips/:tripId/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        trip_id: req.params.tripId
      });
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/messages/:id", async (req, res) => {
    try {
      const updates = insertMessageSchema.partial().parse(req.body);
      const message = await storage.updateMessage(req.params.id, updates);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const success = await storage.deleteMessage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Expenses routes
  app.get("/api/trips/:tripId/expenses", async (req, res) => {
    try {
      const expenses = await storage.getTripExpenses(req.params.tripId);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips/:tripId/expenses", async (req, res) => {
    try {
      const expenseData = insertTripExpenseSchema.parse({
        ...req.body,
        trip_id: req.params.tripId
      });
      const expense = await storage.createTripExpense(expenseData);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const updates = insertTripExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateTripExpense(req.params.id, updates);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const success = await storage.deleteTripExpense(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Expense splits routes
  app.get("/api/expenses/:expenseId/splits", async (req, res) => {
    try {
      const splits = await storage.getExpenseSplits(req.params.expenseId);
      res.json(splits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expenses/:expenseId/splits", async (req, res) => {
    try {
      const splitData = insertExpenseSplitSchema.parse({
        ...req.body,
        expense_id: req.params.expenseId
      });
      const split = await storage.createExpenseSplit(splitData);
      res.status(201).json(split);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/expense-splits/:id", async (req, res) => {
    try {
      const updates = insertExpenseSplitSchema.partial().parse(req.body);
      const split = await storage.updateExpenseSplit(req.params.id, updates);
      if (!split) {
        return res.status(404).json({ error: "Expense split not found" });
      }
      res.json(split);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Additional expense routes for frontend compatibility
  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertTripExpenseSchema.parse(req.body);
      const expense = await storage.createTripExpense(expenseData);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/expense-splits", async (req, res) => {
    try {
      const { splits } = req.body;
      const results = [];
      for (const splitData of splits) {
        const split = await storage.createExpenseSplit(splitData);
        results.push(split);
      }
      res.status(201).json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/expenses", async (req, res) => {
    try {
      const expenses = await storage.getUserExpenses(req.params.userId);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/unpaid-splits", async (req, res) => {
    try {
      const splits = await storage.getUserUnpaidSplits(req.params.userId);
      res.json(splits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Payment proof routes for manual payment verification
  app.get("/api/expense-splits/:splitId/payment-proofs", async (req, res) => {
    try {
      const proofs = await storage.getPaymentProofs(req.params.splitId);
      res.json(proofs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expense-splits/:splitId/payment-proofs", async (req, res) => {
    try {
      const proofData = insertPaymentProofSchema.parse({
        ...req.body,
        expense_split_id: req.params.splitId
      });
      const proof = await storage.createPaymentProof(proofData);
      
      // Also update the expense split with payment status
      await storage.updateExpenseSplit(req.params.splitId, {
        payment_status: 'submitted',
        payment_method: req.body.payment_method || 'manual',
        payment_proof_url: req.body.file_url,
        notes: req.body.upload_notes
      });
      
      res.status(201).json(proof);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/payment-proofs/:id/verify", async (req, res) => {
    try {
      const { status, notes, verified_by } = req.body;
      if (!verified_by) {
        return res.status(400).json({ error: "verified_by is required" });
      }
      
      const proof = await storage.verifyPaymentProof(req.params.id, verified_by, status, notes);
      if (!proof) {
        return res.status(404).json({ error: "Payment proof not found" });
      }
      res.json(proof);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all pending payment proofs for verification (organizer view)
  app.get('/api/payment-proofs/pending', async (req, res) => {
    try {
      const pendingProofs = await storage.getPendingPaymentProofs();
      res.json(pendingProofs);
    } catch (error: any) {
      console.error('Error fetching pending payment proofs:', error);
      res.status(500).json({ error: 'Failed to fetch pending payment proofs' });
    }
  });

  // Get pending payment proofs for a specific trip
  app.get('/api/trips/:tripId/payment-proofs/pending', async (req, res) => {
    const { tripId } = req.params;
    try {
      const pendingProofs = await storage.getPendingPaymentProofsByTrip(tripId);
      res.json(pendingProofs);
    } catch (error: any) {
      console.error('Error fetching trip pending payment proofs:', error);
      res.status(500).json({ error: 'Failed to fetch trip pending payment proofs' });
    }
  });

  // Verify payment proof (approve/reject) - any group member can approve
  app.patch('/api/expense-splits/:splitId/payment-proofs/verify', async (req, res) => {
    const { splitId } = req.params;
    const { status, verified_by, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    // Note: Any authenticated group member can verify payments, not just the person who made payment
    try {
      await storage.verifyPaymentProofBySplit(splitId, {
        status,
        verified_by,
        notes,
        verified_at: new Date().toISOString()
      });

      // Update the expense split payment status
      if (status === 'approved') {
        await storage.updateExpenseSplit(splitId, {
          is_paid: true,
          payment_status: 'approved',
          paid_at: new Date()
        });
      } else {
        await storage.updateExpenseSplit(splitId, {
          payment_status: 'rejected'
        });
      }

      res.json({ message: 'Payment proof verified successfully' });
    } catch (error: any) {
      console.error('Error verifying payment proof:', error);
      res.status(500).json({ error: 'Failed to verify payment proof' });
    }
  });

  // Trip debt summary - who owes money in a trip
  app.get("/api/trips/:tripId/debt-summary", async (req, res) => {
    try {
      const debtSummary = await storage.getTripDebtSummary(req.params.tripId);
      res.json(debtSummary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Budget analysis endpoint for smart budget allocation
  app.get("/api/trips/:tripId/budget-analysis", async (req, res) => {
    try {
      const tripId = req.params.tripId;
      
      // Get expenses for the trip
      const expenses = await storage.getTripExpenses(tripId);
      
      // Get activities for projected costs
      const activities = await storage.getActivitySuggestions(tripId);
      
      // Get trip details for budget info
      const trip = await storage.getTrip(tripId);
      
      // Process budget analysis
      const analysis = {
        expenses,
        activities: activities.filter((a: any) => a.status === 'approved' || a.status === 'suggested'),
        tripBudget: trip?.budget || 5000, // Default budget if not set
        categories: [
          'accommodation', 'food', 'transportation', 'activities', 
          'shopping', 'entertainment', 'other'
        ]
      };
      
      res.json(analysis);
    } catch (error: any) {
      console.error('Budget analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update expense split payment status manually
  app.patch("/api/expense-splits/:id/payment-status", async (req, res) => {
    try {
      const { payment_method, payment_reference, notes } = req.body;
      const updates = {
        payment_method,
        payment_reference,
        notes,
        payment_status: 'submitted',
        updated_at: new Date()
      };
      
      const split = await storage.updateExpenseSplit(req.params.id, updates);
      if (!split) {
        return res.status(404).json({ error: "Expense split not found" });
      }
      res.json(split);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update/replace payment proof screenshot
  app.patch("/api/expense-splits/:id/payment-proof", async (req, res) => {
    try {
      const { file_url, file_name, file_size, payment_method, payment_reference, notes } = req.body;
      const updates = {
        payment_proof_url: file_url,
        payment_method,
        payment_reference,
        notes,
        payment_status: 'submitted',
        updated_at: new Date()
      };
      
      const split = await storage.updateExpenseSplit(req.params.id, updates);
      if (!split) {
        return res.status(404).json({ error: "Expense split not found" });
      }
      res.json(split);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Activity routes
  app.get("/api/trips/:tripId/activities", async (req, res) => {
    try {
      const activities = await storage.getActivitySuggestions(req.params.tripId);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips/:tripId/activities", async (req, res) => {
    try {
      const activityData = {
        ...req.body,
        trip_id: req.params.tripId
      };
      const activity = await storage.createActivitySuggestion(activityData);
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const updates = req.body;
      const activity = await storage.updateActivitySuggestion(req.params.id, updates);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const success = await storage.deleteActivitySuggestion(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/activities/:id/vote", async (req, res) => {
    try {
      const { vote_type } = req.body;
      const activity = await storage.voteOnActivity(req.params.id, vote_type);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Itinerary routes
  app.get("/api/trips/:tripId/itinerary", async (req, res) => {
    try {
      const itinerary = await storage.getItinerary(req.params.tripId);
      res.json(itinerary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips/:tripId/itinerary/days", async (req, res) => {
    try {
      const dayData = {
        ...req.body,
        trip_id: req.params.tripId
      };
      const day = await storage.createItineraryDay(dayData);
      res.status(201).json(day);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/itinerary/items", async (req, res) => {
    try {
      const item = await storage.createItineraryItem(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/itinerary/items/:id", async (req, res) => {
    try {
      const item = await storage.updateItineraryItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Itinerary item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/itinerary/items/:id", async (req, res) => {
    try {
      const success = await storage.deleteItineraryItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Itinerary item not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/itinerary/days/:dayId/reorder", async (req, res) => {
    try {
      const { itemIds } = req.body;
      if (!Array.isArray(itemIds)) {
        return res.status(400).json({ error: "itemIds must be an array" });
      }
      
      const success = await storage.reorderItineraryItems(req.params.dayId, itemIds);
      if (!success) {
        return res.status(404).json({ error: "Failed to reorder items" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Invitation routes
  app.get("/api/trips/:tripId/invitations", async (req, res) => {
    try {
      const invitations = await storage.getTripInvitations(req.params.tripId);
      res.json(invitations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trips/:tripId/invitations", async (req, res) => {
    try {
      // For now, use a mock user ID - in production this would come from authentication
      const currentUserId = "ebb7ab9c-ffc7-444b-b499-4ca8796b4a27";
      
      const invitationData = {
        trip_id: req.params.tripId,
        invited_by: currentUserId,
        invite_type: req.body.invite_type,
        invite_value: req.body.invite_value,
        message: req.body.message || null
      };
      
      const invitation = await storage.createInvitation(invitationData);
      
      // If it's an email invitation, send the actual email
      if (invitation.invite_type === 'email' && invitation.invite_value) {
        try {
          // Get trip details for the email
          const trip = await storage.getTrip(req.params.tripId);
          const inviter = await storage.getUser(currentUserId);
          
          if (trip && inviter) {
            // Send invitation email using Resend API
            const joinUrl = `${req.headers.origin || 'http://localhost:5000'}/join/${invitation.invitation_token}`;
            
            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey) {
              const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'WanderTogether <noreply@wandertogether.app>',
                  to: [invitation.invite_value],
                  subject: `${inviter.full_name || 'Someone'} invited you to join "${trip.title}"`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h1 style="color: #2563eb;">You're invited to join a trip!</h1>
                      <p>Hi there!</p>
                      <p><strong>${inviter.full_name || 'Someone'}</strong> has invited you to join their trip to <strong>${trip.destination}</strong>.</p>
                      ${invitation.message ? `<p><em>"${invitation.message}"</em></p>` : ''}
                      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${trip.title}</h3>
                        <p><strong>Destination:</strong> ${trip.destination}</p>
                        ${trip.start_date ? `<p><strong>Start Date:</strong> ${trip.start_date}</p>` : ''}
                        ${trip.end_date ? `<p><strong>End Date:</strong> ${trip.end_date}</p>` : ''}
                        ${trip.description ? `<p><strong>Description:</strong> ${trip.description}</p>` : ''}
                      </div>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${joinUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Trip</a>
                      </div>
                      <p style="color: #6b7280; font-size: 14px;">
                        This invitation will expire in 7 days. If you can't click the button above, copy and paste this link into your browser:<br>
                        <a href="${joinUrl}">${joinUrl}</a>
                      </p>
                      <p style="color: #6b7280; font-size: 12px;">
                        This email was sent by WanderTogether. If you didn't expect this invitation, you can safely ignore this email.
                      </p>
                    </div>
                  `
                }),
              });

              if (!emailResponse.ok) {
                const errorData = await emailResponse.text();
                console.error('Failed to send email:', errorData);
                // Don't fail the invitation creation, just log the error
              }
            }
          }
        } catch (emailError) {
          console.error('Error sending invitation email:', emailError);
          // Don't fail the invitation creation, just log the error
        }
      }
      
      res.status(201).json(invitation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get invitation by token (for join page)
  app.get("/api/invitations/:token", async (req, res) => {
    try {
      const invitation = await storage.getInvitationByToken(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found or expired" });
      }
      res.json(invitation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/invitations/:token/accept", async (req, res) => {
    try {
      const result = await storage.acceptInvitation(req.params.token, req.body.user_id);
      if (!result) {
        return res.status(404).json({ error: "Invitation not found or expired" });
      }
      res.json(result);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get user by email (for join page)
  app.get("/api/users/by-email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(decodeURIComponent(req.params.email));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get pending invitations for a user (by email or phone)
  app.get("/api/users/:userId/pending-invitations", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const invitations = await storage.getPendingInvitationsForUser(user.email);
      
      // Get trip details for each invitation
      const invitationsWithTrips = await Promise.all(
        invitations.map(async (invitation: any) => {
          const trip = await storage.getTrip(invitation.trip_id);
          const inviter = await storage.getUser(invitation.invited_by);
          return {
            ...invitation,
            trip: trip,
            inviter: inviter
          };
        })
      );

      res.json(invitationsWithTrips);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/invitations/:id", async (req, res) => {
    try {
      const invitation = await storage.updateInvitation(req.params.id, req.body);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      res.json(invitation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/expense-splits/:id", async (req, res) => {
    try {
      const updates = insertExpenseSplitSchema.partial().parse(req.body);
      const split = await storage.updateExpenseSplit(req.params.id, updates);
      if (!split) {
        return res.status(404).json({ error: "Expense split not found" });
      }
      res.json(split);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Email sending route (replacing Supabase Edge Function)
  app.post("/api/send-invitation-email", async (req, res) => {
    try {
      const { inviteEmail, tripTitle, tripDestination, inviterName, invitationToken } = req.body;
      const joinUrl = `${req.headers.origin}/join/${invitationToken}`;
      
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          // Use Resend API
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: "WanderTogether <onboarding@resend.dev>",
              to: [inviteEmail],
              subject: `${inviterName} invited you to join "${tripTitle}"`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>You're Invited to ${tripTitle}</title>
                  </head>
                  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #3b82f6; margin-bottom: 10px;">You're Invited!</h1>
                      <p style="color: #6b7280; font-size: 18px;">Join an amazing trip adventure</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                      <h2 style="color: white; margin-bottom: 20px;">${tripTitle}</h2>
                      <p style="color: white; font-size: 16px; margin-bottom: 15px;">
                        <strong>📍 Destination:</strong> ${tripDestination}
                      </p>
                      <p style="color: white; font-size: 16px; margin-bottom: 25px;">
                        <strong>👤 Invited by:</strong> ${inviterName}
                      </p>
                      <a href="${joinUrl}" style="background: white; color: #3b82f6; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Join Trip
                      </a>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                      <h3 style="color: #374151; margin-bottom: 15px;">🌟 What you can do:</h3>
                      <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                        <li>Plan activities together</li>
                        <li>Split expenses fairly</li>
                        <li>Chat with the group</li>
                        <li>Create shared itineraries</li>
                      </ul>
                    </div>
                    
                    <div style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 30px;">
                      <p>If the button doesn't work, copy and paste this link:</p>
                      <p style="color: #3b82f6; word-break: break-all; margin: 10px 0;">${joinUrl}</p>
                      <p style="margin-top: 20px;">
                        This invitation was sent by ${inviterName}. If you didn't expect this, you can safely ignore this email.
                      </p>
                      <p style="margin-top: 20px;">
                        Happy travels!<br>
                        The WanderTogether Team
                      </p>
                    </div>
                  </body>
                </html>
              `,
            }),
          });

          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            return res.json({ 
              success: true, 
              method: "resend",
              emailId: emailData.id,
              message: "Invitation email sent successfully" 
            });
          }
        } catch (emailError) {
          console.error('Resend email failed:', emailError);
        }
      }

      // Fallback to mailto link
      const subject = encodeURIComponent(`${inviterName} invited you to join "${tripTitle}"`);
      const body = encodeURIComponent(`
Hi there!

${inviterName} has invited you to join a trip:

Trip: ${tripTitle}
Destination: ${tripDestination}

To join this trip, click the following link:
${joinUrl}

If the link doesn't work, copy and paste it into your browser.

Happy travels!
      `);
      
      const mailtoLink = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;

      res.json({ 
        success: true, 
        method: "mailto_fallback",
        mailtoLink,
        message: "Email service unavailable. Please copy the invitation link manually.",
        invitationLink: joinUrl
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper function to generate fallback suggestions when AI is unavailable
  function generateFallbackSuggestions(destination: string) {
    return {
      activities: [
        {
          title: "Historic City Center",
          description: `Explore the historic downtown area of ${destination} with its architecture, monuments, and cultural landmarks.`,
          location: `${destination} historic district`,
          category: "attraction",
          estimated_cost: 20.00,
          estimated_duration: 3
        },
        {
          title: "Local Restaurant Tour",
          description: `Experience authentic local cuisine by visiting highly-rated traditional restaurants in ${destination}.`,
          location: `${destination} food district`,
          category: "restaurant",
          estimated_cost: 45.00,
          estimated_duration: 2
        },
        {
          title: "Walking Tour",
          description: `Join a guided walking tour to discover hidden gems and learn about ${destination}'s history and culture.`,
          location: `${destination} city center`,
          category: "culture",
          estimated_cost: 25.00,
          estimated_duration: 3
        },
        {
          title: "Local Market Visit",
          description: `Browse local markets and shops to find unique souvenirs and experience local commerce in ${destination}.`,
          location: `${destination} market area`,
          category: "shopping",
          estimated_cost: 35.00,
          estimated_duration: 2
        },
        {
          title: "Scenic Viewpoint",
          description: `Visit the best viewpoints in ${destination} for photography and panoramic views of the city or landscape.`,
          location: `${destination} elevated areas`,
          category: "outdoor",
          estimated_cost: 10.00,
          estimated_duration: 2
        },
        {
          title: "Entertainment District",
          description: `Experience ${destination}'s nightlife and entertainment scene with bars, clubs, or live music venues.`,
          location: `${destination} entertainment district`,
          category: "nightlife",
          estimated_cost: 60.00,
          estimated_duration: 4
        }
      ],
      accommodations: [
        {
          name: "Central Budget Hotel",
          type: "hotel",
          location: `${destination} city center`,
          price_per_night: 85.00,
          capacity: 2,
          amenities: ["wifi", "breakfast", "24h reception"]
        },
        {
          name: "Modern Hostel",
          type: "hostel",
          location: `${destination} downtown`,
          price_per_night: 35.00,
          capacity: 1,
          amenities: ["wifi", "shared kitchen", "common area"]
        },
        {
          name: "Comfort Inn",
          type: "hotel",
          location: `${destination} business district`,
          price_per_night: 120.00,
          capacity: 2,
          amenities: ["wifi", "gym", "parking", "business center"]
        },
        {
          name: "Luxury Resort",
          type: "resort",
          location: `${destination} premium area`,
          price_per_night: 250.00,
          capacity: 4,
          amenities: ["wifi", "spa", "pool", "restaurant", "concierge"]
        }
      ]
    };
  }

  // Activity translation route with cultural context
  app.post("/api/translate-activity", async (req, res) => {
    try {
      const { activityId, targetLanguage, includeContext } = req.body;
      
      if (!activityId || !targetLanguage) {
        return res.status(400).json({ error: 'Activity ID and target language are required' });
      }

      // Get the activity details
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' });
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
      }

      // Create context-aware translation prompt
      const contextPrompt = includeContext 
        ? `Provide cultural context about local customs, etiquette, pricing norms, and practical tips for travelers. Include information about best times to visit, what to expect, and any cultural sensitivities.`
        : `Provide a direct translation without additional context.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://wandertogether.replit.app',
          'X-Title': 'WanderTogether Travel Planner',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `You are a cultural travel expert and translator. Translate travel activities to ${targetLanguage} with accuracy and cultural sensitivity. ${contextPrompt} Always respond with valid JSON only, no other text. Format: {"title": "translated title", "description": "translated description", "location": "translated location", "cultural_tips": "cultural context and tips", "local_customs": "relevant customs", "practical_info": "practical travel information"}`
            },
            {
              role: 'user',
              content: `Translate this travel activity to ${targetLanguage}:
              Title: ${activity.title}
              Description: ${activity.description}
              Location: ${activity.location}
              Category: ${activity.category}
              
              Return only valid JSON with the translation and cultural context.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let translation;
      try {
        // Clean the response to extract only JSON
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        translation = JSON.parse(cleanContent);
      } catch (parseError: any) {
        console.error('Failed to parse translation response:', content);
        // Fallback translation if AI fails
        translation = {
          title: activity.title,
          description: activity.description,
          location: activity.location,
          cultural_tips: "Translation service temporarily unavailable. Please try again later.",
          local_customs: "Cultural information will be available when translation service is restored.",
          practical_info: "Practical tips will be provided when the service is working properly."
        };
      }

      // Store the translation in the activity's translations field
      const existingTranslations = activity.translations || {};
      existingTranslations[targetLanguage] = {
        ...translation,
        translated_at: new Date().toISOString(),
        translation_quality: 'ai_generated'
      };

      // Update the activity with the new translation
      await storage.updateActivitySuggestion(activityId, {
        translations: existingTranslations
      });

      res.json({
        success: true,
        translation: translation,
        language: targetLanguage,
        activity_id: activityId
      });

    } catch (error: any) {
      console.error('Translation error:', error);
      res.status(500).json({ 
        error: 'Translation failed', 
        details: error.message 
      });
    }
  });

  // Location suggestions route (replacing Supabase Edge Function)
  app.post("/api/generate-location-suggestions", async (req, res) => {
    try {
      const { destination, tripId } = req.body;
      
      if (!destination || !tripId) {
        return res.status(400).json({ error: 'Destination and tripId are required' });
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
      }

      // Generate AI suggestions using OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://wandertogether.replit.app',
          'X-Title': 'WanderTogether Travel Planner',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Return JSON only: {"activities": [{"title": "Activity Name", "description": "Description", "location": "Location", "category": "attraction", "estimated_cost": 25, "estimated_duration": 2}], "accommodations": [{"name": "Hotel Name", "type": "hotel", "location": "Address", "price_per_night": 100, "capacity": 2, "amenities": ["wifi"]}]}. Categories: attraction, restaurant, outdoor, culture, shopping, nightlife.'
            },
            {
              role: 'user',
              content: `Generate travel recommendations for ${destination}. Include popular attractions, local experiences, restaurants, and accommodation options with realistic pricing.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.3,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let suggestions;
      try {
        // Try to parse the JSON response with improved extraction
        let jsonStr = content.trim();
        
        // Look for the main JSON object (first { to last })
        const startIdx = jsonStr.indexOf('{');
        let lastIdx = -1;
        let braceCount = 0;
        
        // Find the matching closing brace
        for (let i = startIdx; i < jsonStr.length; i++) {
          if (jsonStr[i] === '{') braceCount++;
          if (jsonStr[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastIdx = i;
              break;
            }
          }
        }
        
        if (startIdx !== -1 && lastIdx !== -1 && lastIdx > startIdx) {
          jsonStr = jsonStr.substring(startIdx, lastIdx + 1);
          
          // Fix common JSON formatting issues
          jsonStr = jsonStr
            .replace(/^\s*```json\s*/, '') // Remove ```json prefix
            .replace(/\s*```\s*$/, '')     // Remove ``` suffix
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
            .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes
            .replace(/}\s*{/g, '},{'); // Fix missing commas between objects
          
          suggestions = JSON.parse(jsonStr);
        } else {
          throw new Error('No valid JSON object found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Full AI Response:', JSON.stringify(data, null, 2));
        console.error('AI Response content:', content);
        
        // If parsing fails, provide fallback suggestions
        suggestions = generateFallbackSuggestions(destination);
        
        res.json({ 
          success: true, 
          message: 'AI provided suggestions but formatting failed. Using curated suggestions instead.',
          suggestions,
          fallback: true,
          activitiesCount: suggestions.activities?.length || 0,
          accommodationsCount: suggestions.accommodations?.length || 0,
          debug: {
            aiContent: content?.substring(0, 200) + '...',
            parseError: parseError.message
          }
        });
        return;
      }

      res.json({ 
        success: true, 
        message: 'AI suggestions generated successfully',
        suggestions,
        activitiesCount: suggestions.activities?.length || 0,
        accommodationsCount: suggestions.accommodations?.length || 0
      });
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      
      // Handle specific API errors gracefully and provide fallback suggestions
      if (error.message?.includes('Too Many Requests') || 
          error.message?.includes('temporarily unavailable') ||
          error.message?.includes('API error') ||
          error.message?.includes('Insufficient USD') ||
          error.message?.includes('balance')) {
        
        // Provide curated fallback suggestions based on destination
        const fallbackSuggestions = generateFallbackSuggestions(destination);
        
        res.json({ 
          success: true, 
          message: 'AI service is temporarily unavailable. Here are some popular suggestions to get you started!',
          suggestions: fallbackSuggestions,
          fallback: true,
          activitiesCount: fallbackSuggestions.activities?.length || 0,
          accommodationsCount: fallbackSuggestions.accommodations?.length || 0
        });
        return;
      }
      
      // Provide fallback suggestions for other errors
      const { destination } = req.body;
      const fallbackSuggestions = {
        activities: [
          {
            title: "Explore Local Attractions",
            description: `Discover popular attractions and landmarks in ${destination}. Visit museums, historical sites, and cultural centers.`,
            location: `${destination} city center`,
            category: "attraction",
            estimated_cost: 25.00,
            estimated_duration: 3
          },
          {
            title: "Local Food Experience",
            description: `Try authentic local cuisine and visit popular restaurants in ${destination}. Experience the local food culture and specialties.`,
            location: `${destination} food district`,
            category: "restaurant",
            estimated_cost: 40.00,
            estimated_duration: 2
          },
          {
            title: "Outdoor Activities",
            description: `Enjoy outdoor activities like walking tours, parks, or scenic viewpoints in ${destination}.`,
            location: `${destination} outdoor areas`,
            category: "outdoor",
            estimated_cost: 15.00,
            estimated_duration: 4
          },
          {
            title: "Cultural Experience",
            description: `Immerse yourself in local culture through museums, galleries, and cultural centers in ${destination}.`,
            location: `${destination} cultural district`,
            category: "culture",
            estimated_cost: 30.00,
            estimated_duration: 3
          }
        ],
        accommodations: [
          {
            name: "Budget-Friendly Hotel",
            type: "hotel",
            location: `${destination} downtown`,
            price_per_night: 80.00,
            capacity: 2,
            amenities: ["wifi", "breakfast", "24h reception"]
          },
          {
            name: "Mid-Range Accommodation",
            type: "hotel",
            location: `${destination} city center`,
            price_per_night: 150.00,
            capacity: 4,
            amenities: ["wifi", "pool", "gym", "room service"]
          }
        ]
      };
      
      res.json({ 
        success: true, 
        message: 'Fallback suggestions provided (AI service temporarily unavailable)',
        suggestions: fallbackSuggestions,
        activitiesCount: fallbackSuggestions.activities.length,
        accommodationsCount: fallbackSuggestions.accommodations.length,
        fallback: true
      });
    }
  });

  // Expense payment route (replacing Supabase Edge Function)
  app.post("/api/create-expense-payment", async (req, res) => {
    try {
      const { expenseId, amount, description, userEmail } = req.body;
      
      if (!expenseId || !amount) {
        return res.status(400).json({ error: "Missing required fields: expenseId and amount" });
      }

      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return res.status(500).json({ error: 'Stripe API key not configured' });
      }

      // Get expense details
      const expenseData = await storage.getTripExpense(expenseId);
      if (!expenseData) {
        return res.status(404).json({ error: "Expense not found" });
      }

      // Import Stripe dynamically
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-07-30.basil',
      });

      // Check if customer exists
      let customerId;
      if (userEmail) {
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }

      // Create payment session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: `Expense Settlement: ${expenseData.title}`,
                description: description || "Trip expense settlement"
              },
              unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/trips?payment=success&expense=${expenseId}`,
        cancel_url: `${req.headers.origin}/trips?payment=cancelled`,
        metadata: {
          expense_id: expenseId,
          split_amount: amount
        }
      });

      res.json({ 
        success: true,
        url: session.url 
      });
    } catch (error: any) {
      console.error('Payment creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered expense categorization endpoint
  app.post("/api/categorize-expense", async (req, res) => {
    try {
      const { description, amount, merchant } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Expense description is required' });
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://wandertogether.replit.app',
          'X-Title': 'WanderTogether Travel Planner',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `You are an expense categorization expert for travel expenses. 
              Analyze the expense and respond with a JSON object containing:
              {
                "category": "one of: accommodation|transportation|food|activities|shopping|other",
                "subcategory": "specific subcategory like 'hotel', 'flight', 'restaurant', 'museum', etc",
                "confidence": 0.95,
                "suggested_tags": ["tag1", "tag2"]
              }
              
              Categories:
              - accommodation: hotels, hostels, airbnb, camping
              - transportation: flights, trains, buses, taxis, gas, car rental
              - food: restaurants, groceries, snacks, drinks
              - activities: tours, museums, entertainment, sports
              - shopping: souvenirs, clothes, gifts
              - other: insurance, fees, miscellaneous`
            },
            {
              role: 'user',
              content: `Categorize this travel expense:
              Description: ${description}
              Amount: $${amount || 'unknown'}
              Merchant: ${merchant || 'unknown'}`
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let categorization;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          categorization = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        categorization = {
          category: 'other',
          subcategory: 'miscellaneous',
          confidence: 0.5,
          suggested_tags: []
        };
      }

      res.json(categorization);
    } catch (error: any) {
      console.error('Error categorizing expense:', error);
      res.status(500).json({ 
        error: 'Failed to categorize expense',
        fallback: {
          category: 'other',
          subcategory: 'miscellaneous',
          confidence: 0.5,
          suggested_tags: []
        }
      });
    }
  });

  // AI-powered trip description generator
  app.post("/api/generate-trip-description", async (req, res) => {
    try {
      const { destination, startDate, endDate, groupSize, interests } = req.body;
      
      if (!destination) {
        return res.status(400).json({ error: 'Destination is required' });
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://wandertogether.replit.app',
          'X-Title': 'WanderTogether Travel Planner',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `You are a travel writing expert. Create engaging trip descriptions that inspire and inform. 
              Generate a brief, exciting description (2-3 sentences) that captures the essence of the destination and trip.
              Focus on unique experiences, local culture, and what makes this destination special.
              Keep it concise but inspiring.`
            },
            {
              role: 'user',
              content: `Generate an exciting trip description for:
              Destination: ${destination}
              ${startDate ? `Start Date: ${startDate}` : ''}
              ${endDate ? `End Date: ${endDate}` : ''}
              ${groupSize ? `Group Size: ${groupSize} people` : ''}
              ${interests ? `Interests: ${interests}` : ''}`
            }
          ],
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const description = data.choices[0].message.content.trim();

      res.json({ description });
    } catch (error: any) {
      console.error('Error generating trip description:', error);
      res.status(500).json({ 
        error: 'Failed to generate trip description',
        fallback: `Explore the amazing ${req.body.destination} with your group and create unforgettable memories together.`
      });
    }
  });

  // AI-powered travel tips and recommendations
  app.post("/api/get-travel-tips", async (req, res) => {
    try {
      const { destination, tripType, season, budget } = req.body;
      
      if (!destination) {
        return res.status(400).json({ error: 'Destination is required' });
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://wandertogether.replit.app',
          'X-Title': 'WanderTogether Travel Planner',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `You are a travel expert providing practical tips and recommendations.
              Respond with a JSON object containing:
              {
                "essential_tips": ["tip1", "tip2", "tip3"],
                "best_time_to_visit": "description",
                "local_customs": ["custom1", "custom2"],
                "budget_tips": ["budget_tip1", "budget_tip2"],
                "transportation": "recommendation",
                "safety_notes": ["safety1", "safety2"],
                "must_try": ["food1", "experience1"]
              }
              
              Provide practical, actionable advice specific to the destination.`
            },
            {
              role: 'user',
              content: `Provide travel tips and recommendations for:
              Destination: ${destination}
              ${tripType ? `Trip Type: ${tripType}` : ''}
              ${season ? `Season: ${season}` : ''}
              ${budget ? `Budget Level: ${budget}` : ''}`
            }
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let tips;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          tips = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        tips = {
          essential_tips: ["Research local customs before visiting", "Keep copies of important documents", "Learn basic local phrases"],
          best_time_to_visit: "Check local weather and peak seasons",
          local_customs: ["Respect local traditions and dress codes"],
          budget_tips: ["Book accommodations in advance", "Try local street food"],
          transportation: "Research public transportation options",
          safety_notes: ["Stay aware of your surroundings", "Keep emergency contacts handy"],
          must_try: ["Local cuisine", "Cultural experiences"]
        };
      }

      res.json(tips);
    } catch (error: any) {
      console.error('Error getting travel tips:', error);
      res.status(500).json({ 
        error: 'Failed to get travel tips',
        fallback: {
          essential_tips: ["Plan ahead and research your destination", "Pack light and bring essentials", "Stay flexible with your itinerary"],
          best_time_to_visit: "Research the best season for your destination",
          local_customs: ["Respect local culture and traditions"],
          budget_tips: ["Compare prices and book in advance", "Consider local alternatives"],
          transportation: "Research transportation options beforehand",
          safety_notes: ["Stay alert and trust your instincts", "Keep important documents secure"],
          must_try: ["Local food specialties", "Cultural landmarks"]
        }
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
