import { db } from "./db";
import { 
  users, trips, trip_participants, trip_invitations, messages, 
  trip_expenses, expense_splits, payment_proofs, activity_suggestions, activity_votes,
  accommodation_options, accommodation_votes, itinerary_days, itinerary_items,
  reviews, trip_documents,
  type User, type InsertUser, type Trip, type InsertTrip,
  type TripExpense, type InsertTripExpense, type Message, type InsertMessage,
  type TripParticipant, type InsertTripParticipant, type TripInvitation, type InsertTripInvitation,
  type ExpenseSplit, type InsertExpenseSplit, type PaymentProof, type InsertPaymentProof
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Trip methods
  getTrip(id: string): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;

  // Trip participants methods
  getTripParticipants(tripId: string): Promise<TripParticipant[]>;
  addTripParticipant(participant: InsertTripParticipant): Promise<TripParticipant>;
  updateTripParticipant(tripId: string, userId: string, updates: Partial<InsertTripParticipant>): Promise<TripParticipant | undefined>;
  removeTripParticipant(tripId: string, userId: string): Promise<boolean>;

  // Trip invitations methods
  getTripInvitations(tripId: string): Promise<TripInvitation[]>;
  getTripInvitation(token: string): Promise<TripInvitation | undefined>;
  createTripInvitation(invitation: InsertTripInvitation): Promise<TripInvitation>;
  updateTripInvitation(id: string, invitation: Partial<InsertTripInvitation>): Promise<TripInvitation | undefined>;

  // Message methods
  getMessages(tripId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;

  // Expense methods
  getTripExpenses(tripId: string): Promise<TripExpense[]>;
  getTripExpense(id: string): Promise<TripExpense | undefined>;
  createTripExpense(expense: InsertTripExpense): Promise<TripExpense>;
  updateTripExpense(id: string, expense: Partial<InsertTripExpense>): Promise<TripExpense | undefined>;
  deleteTripExpense(id: string): Promise<boolean>;

  // Expense split methods
  getExpenseSplits(expenseId: string): Promise<ExpenseSplit[]>;
  createExpenseSplit(split: InsertExpenseSplit): Promise<ExpenseSplit>;
  updateExpenseSplit(id: string, split: Partial<InsertExpenseSplit>): Promise<ExpenseSplit | undefined>;
  
  // Payment proof methods
  getPaymentProofs(expenseSplitId: string): Promise<PaymentProof[]>;
  createPaymentProof(proof: InsertPaymentProof): Promise<PaymentProof>;
  updatePaymentProof(id: string, proof: Partial<InsertPaymentProof>): Promise<PaymentProof | undefined>;
  verifyPaymentProof(id: string, verifiedBy: string, status: string, notes?: string): Promise<PaymentProof | undefined>;
  
  // Enhanced expense tracking for manual payments
  getUserUnpaidSplits(userId: string): Promise<any[]>;
  getTripDebtSummary(tripId: string): Promise<any[]>;
  
  // Additional user expense methods
  getUserExpenses(userId: string): Promise<any[]>;
  getUnpaidSplits(userId: string): Promise<any[]>;
  
  // Activity suggestion methods
  getActivitySuggestions(tripId: string): Promise<any[]>;
  createActivitySuggestion(activity: any): Promise<any>;
  deleteActivitySuggestion(id: string): Promise<boolean>;
  voteOnActivity(id: string, voteType: string): Promise<any>;
  
  // Itinerary methods
  getItinerary(tripId: string): Promise<any[]>;
  createItineraryDay(day: any): Promise<any>;
  createItineraryItem(item: any): Promise<any>;
  updateItineraryItem(id: string, item: any): Promise<any>;
  deleteItineraryItem(id: string): Promise<boolean>;
  reorderItineraryItems(dayId: string, itemIds: string[]): Promise<boolean>;
  
  // Additional invitation methods for API compatibility
  createInvitation(invitation: any): Promise<any>;
  getInvitationByToken(token: string): Promise<any>;
  acceptInvitation(token: string, userId?: string): Promise<any>;
  updateInvitation(id: string, updates: any): Promise<any>;
  getPendingInvitationsForUser(email: string): Promise<any[]>;
  
  // Payment verification methods
  getPendingPaymentProofs(): Promise<any[]>;
  getPendingPaymentProofsByTrip(tripId: string): Promise<any[]>;
  verifyPaymentProofBySplit(splitId: string, verification: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Trip methods
  async getTrip(id: string): Promise<Trip | undefined> {
    const result = await db.select().from(trips).where(eq(trips.id, id));
    return result[0];
  }

  async getTripsByUser(userId: string): Promise<Trip[]> {
    const result = await db
      .selectDistinct({
        id: trips.id,
        title: trips.title,
        destination: trips.destination,
        description: trips.description,
        start_date: trips.start_date,
        end_date: trips.end_date,
        status: trips.status,
        created_by: trips.created_by,
        created_at: trips.created_at,
        updated_at: trips.updated_at,
        trip_type: trips.trip_type,
        budget_total: trips.budget_total,
        currency: trips.currency,
        planning_status: trips.planning_status,
        group_settings: trips.group_settings
      })
      .from(trips)
      .innerJoin(trip_participants, eq(trips.id, trip_participants.trip_id))
      .where(eq(trip_participants.user_id, userId))
      .orderBy(desc(trips.created_at));
    return result;
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const result = await db.insert(trips).values(trip).returning();
    return result[0];
  }

  async updateTrip(id: string, trip: Partial<InsertTrip>): Promise<Trip | undefined> {
    const result = await db.update(trips).set(trip).where(eq(trips.id, id)).returning();
    return result[0];
  }

  async deleteTrip(id: string): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Trip participants methods
  async getTripParticipants(tripId: string): Promise<any[]> {
    // Join with users table to get participant details and handle duplicates by taking the highest priority role
    const result = await db.select({
      id: trip_participants.id,
      trip_id: trip_participants.trip_id,
      user_id: trip_participants.user_id,
      role: trip_participants.role,
      status: trip_participants.status,
      invitation_id: trip_participants.invitation_id,
      joined_at: trip_participants.joined_at,
      user_data: {
        id: users.id,
        email: users.email,
        full_name: users.full_name,
        avatar_url: users.avatar_url
      }
    })
      .from(trip_participants)
      .leftJoin(users, eq(trip_participants.user_id, users.id))
      .where(eq(trip_participants.trip_id, tripId))
      .orderBy(desc(trip_participants.joined_at));

    // Remove duplicates by keeping the one with the highest priority role
    const rolesPriority: Record<string, number> = { 'owner': 3, 'organizer': 2, 'co-organizer': 2, 'participant': 1 };
    const uniqueParticipants = new Map();
    
    for (const participant of result) {
      const existing = uniqueParticipants.get(participant.user_id);
      const currentRolePriority = rolesPriority[participant.role || 'participant'] || 0;
      const existingRolePriority = existing ? (rolesPriority[existing.role || 'participant'] || 0) : 0;
      
      if (!existing || currentRolePriority > existingRolePriority) {
        uniqueParticipants.set(participant.user_id, participant);
      }
    }
    
    // Transform the data structure to match frontend expectations
    return Array.from(uniqueParticipants.values()).map(participant => ({
      id: participant.id,
      trip_id: participant.trip_id,
      user_id: participant.user_id,
      role: participant.role,
      status: participant.status,
      invitation_id: participant.invitation_id,
      joined_at: participant.joined_at,
      user: participant.user_data // Nest user data under 'user' key
    }));
  }

  async addTripParticipant(participant: InsertTripParticipant): Promise<TripParticipant> {
    const result = await db.insert(trip_participants).values(participant).returning();
    return result[0];
  }

  async updateTripParticipant(tripId: string, userId: string, updates: Partial<InsertTripParticipant>): Promise<TripParticipant | undefined> {
    const result = await db.update(trip_participants)
      .set(updates)
      .where(and(eq(trip_participants.trip_id, tripId), eq(trip_participants.user_id, userId)))
      .returning();
    return result[0];
  }

  async removeTripParticipant(tripId: string, userId: string): Promise<boolean> {
    const result = await db.delete(trip_participants)
      .where(and(eq(trip_participants.trip_id, tripId), eq(trip_participants.user_id, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Trip invitations methods
  async getTripInvitations(tripId: string): Promise<TripInvitation[]> {
    return await db.select().from(trip_invitations)
      .where(eq(trip_invitations.trip_id, tripId))
      .orderBy(desc(trip_invitations.created_at));
  }

  async getTripInvitation(token: string): Promise<TripInvitation | undefined> {
    const result = await db.select().from(trip_invitations).where(eq(trip_invitations.invitation_token, token));
    return result[0];
  }

  async createTripInvitation(invitation: InsertTripInvitation): Promise<TripInvitation> {
    const result = await db.insert(trip_invitations).values(invitation).returning();
    return result[0];
  }

  async updateTripInvitation(id: string, invitation: Partial<InsertTripInvitation>): Promise<TripInvitation | undefined> {
    const result = await db.update(trip_invitations).set(invitation).where(eq(trip_invitations.id, id)).returning();
    return result[0];
  }

  // Message methods
  async getMessages(tripId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.trip_id, tripId))
      .orderBy(desc(messages.created_at));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined> {
    const result = await db.update(messages).set(message).where(eq(messages.id, id)).returning();
    return result[0];
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Expense methods
  async getTripExpenses(tripId: string): Promise<TripExpense[]> {
    return await db.select().from(trip_expenses)
      .where(eq(trip_expenses.trip_id, tripId))
      .orderBy(desc(trip_expenses.created_at));
  }

  async getTripExpense(id: string): Promise<TripExpense | undefined> {
    const result = await db.select().from(trip_expenses).where(eq(trip_expenses.id, id));
    return result[0];
  }

  async createTripExpense(expense: InsertTripExpense): Promise<TripExpense> {
    const result = await db.insert(trip_expenses).values(expense).returning();
    return result[0];
  }

  async updateTripExpense(id: string, expense: Partial<InsertTripExpense>): Promise<TripExpense | undefined> {
    const result = await db.update(trip_expenses).set(expense).where(eq(trip_expenses.id, id)).returning();
    return result[0];
  }

  async deleteTripExpense(id: string): Promise<boolean> {
    const result = await db.delete(trip_expenses).where(eq(trip_expenses.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateActivitySuggestion(id: string, activity: any): Promise<any> {
    const result = await db.update(activity_suggestions)
      .set({ ...activity, updated_at: new Date() })
      .where(eq(activity_suggestions.id, id))
      .returning();
    return result[0];
  }

  async getActivity(id: string): Promise<any> {
    const result = await db.select().from(activity_suggestions).where(eq(activity_suggestions.id, id));
    return result[0];
  }

  // Expense split methods
  async getExpenseSplits(expenseId: string): Promise<ExpenseSplit[]> {
    return await db.select().from(expense_splits).where(eq(expense_splits.expense_id, expenseId));
  }

  async createExpenseSplit(split: InsertExpenseSplit): Promise<ExpenseSplit> {
    const result = await db.insert(expense_splits).values(split).returning();
    return result[0];
  }

  async updateExpenseSplit(id: string, split: Partial<InsertExpenseSplit>): Promise<ExpenseSplit | undefined> {
    const result = await db.update(expense_splits).set(split).where(eq(expense_splits.id, id)).returning();
    return result[0];
  }

  // Additional user expense methods - simplified for performance
  async getUserExpenses(userId: string): Promise<any[]> {
    // Get basic expense splits for the user only - much faster query
    return await db.select({
      id: expense_splits.id,
      expense_id: expense_splits.expense_id,
      amount: expense_splits.amount,
      is_paid: expense_splits.is_paid,
      paid_at: expense_splits.paid_at,
      payment_status: expense_splits.payment_status,
      expense_title: trip_expenses.title,
      expense_category: trip_expenses.category,
      trip_id: trip_expenses.trip_id
    })
    .from(expense_splits)
    .innerJoin(trip_expenses, eq(expense_splits.expense_id, trip_expenses.id))
    .where(eq(expense_splits.user_id, userId))
    .orderBy(desc(expense_splits.created_at));
  }

  async getUnpaidSplits(userId: string): Promise<any[]> {
    // Get all unpaid expense splits for the user with expense and trip details
    return await db.select({
      id: expense_splits.id,
      expense_id: expense_splits.expense_id,
      user_id: expense_splits.user_id,
      amount: expense_splits.amount,
      is_paid: expense_splits.is_paid,
      paid_at: expense_splits.paid_at,
      created_at: expense_splits.created_at,
      expense_title: trip_expenses.title,
      expense_description: trip_expenses.description,
      expense_category: trip_expenses.category,
      trip_id: trip_expenses.trip_id,
      trip_title: trips.title,
      trip_destination: trips.destination
    })
      .from(expense_splits)
      .innerJoin(trip_expenses, eq(expense_splits.expense_id, trip_expenses.id))
      .innerJoin(trips, eq(trip_expenses.trip_id, trips.id))
      .where(and(
        eq(expense_splits.user_id, userId),
        eq(expense_splits.is_paid, false)
      ))
      .orderBy(desc(expense_splits.created_at));
  }

  // Activity suggestion methods
  async getActivitySuggestions(tripId: string): Promise<any[]> {
    return await db.select().from(activity_suggestions)
      .where(eq(activity_suggestions.trip_id, tripId))
      .orderBy(desc(activity_suggestions.created_at));
  }

  async createActivitySuggestion(activity: any): Promise<any> {
    const result = await db.insert(activity_suggestions).values(activity).returning();
    return result[0];
  }

  async deleteActivitySuggestion(id: string): Promise<boolean> {
    const result = await db.delete(activity_suggestions).where(eq(activity_suggestions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async voteOnActivity(id: string, voteType: string): Promise<any> {
    // Note: This is a simplified implementation without user tracking
    // In a real app, you'd need to track which user voted and prevent duplicate votes
    
    // Get current activity
    const activity = await db.select().from(activity_suggestions)
      .where(eq(activity_suggestions.id, id));
    
    if (!activity[0]) {
      throw new Error('Activity not found');
    }

    // Parse current votes from external_data or initialize to 0
    let currentVotes = { up: 0, down: 0 };
    if (activity[0].external_data) {
      try {
        const externalData = typeof activity[0].external_data === 'string' 
          ? JSON.parse(activity[0].external_data) 
          : activity[0].external_data;
        if (externalData && typeof externalData === 'object' && 'votes' in externalData) {
          currentVotes = externalData.votes;
        }
      } catch (e) {
        // If parsing fails, keep default votes
      }
    }

    // Update vote counts based on vote type
    const newVotes = {
      up: voteType === 'upvote' ? currentVotes.up + 1 : currentVotes.up,
      down: voteType === 'downvote' ? currentVotes.down + 1 : currentVotes.down
    };

    // Store votes in external_data field
    const updatedExternalData = {
      ...(activity[0].external_data && typeof activity[0].external_data === 'object' 
          ? activity[0].external_data 
          : {}),
      votes: newVotes
    };

    // Update the activity with new vote counts
    const result = await db.update(activity_suggestions)
      .set({ 
        external_data: updatedExternalData,
        updated_at: new Date()
      })
      .where(eq(activity_suggestions.id, id))
      .returning();

    // Return activity with votes in the expected format
    return {
      ...result[0],
      votes: newVotes
    };
  }

  // Itinerary methods
  async getItinerary(tripId: string): Promise<any[]> {
    // Get itinerary days with their items
    const days = await db.select().from(itinerary_days)
      .where(eq(itinerary_days.trip_id, tripId))
      .orderBy(itinerary_days.day_date);

    const itinerary = [];
    for (const day of days) {
      const items = await db.select().from(itinerary_items)
        .where(eq(itinerary_items.day_id, day.id))
        .orderBy(itinerary_items.order_index);
      
      itinerary.push({
        ...day,
        items: items
      });
    }
    
    return itinerary;
  }

  async createItineraryDay(day: any): Promise<any> {
    const result = await db.insert(itinerary_days).values(day).returning();
    return result[0];
  }

  async createItineraryItem(item: any): Promise<any> {
    const result = await db.insert(itinerary_items).values(item).returning();
    return result[0];
  }

  async updateItineraryItem(id: string, item: any): Promise<any> {
    const result = await db.update(itinerary_items)
      .set({ ...item, updated_at: new Date() })
      .where(eq(itinerary_items.id, id))
      .returning();
    return result[0];
  }

  async deleteItineraryItem(id: string): Promise<boolean> {
    const result = await db.delete(itinerary_items).where(eq(itinerary_items.id, id));
    return (result.rowCount || 0) > 0;
  }

  async reorderItineraryItems(dayId: string, itemIds: string[]): Promise<boolean> {
    // Update order_index for each item
    for (let i = 0; i < itemIds.length; i++) {
      await db.update(itinerary_items)
        .set({ order_index: i, updated_at: new Date() })
        .where(and(eq(itinerary_items.id, itemIds[i]), eq(itinerary_items.day_id, dayId)));
    }
    return true;
  }

  // Additional invitation helper methods for API routes
  async createInvitation(invitation: any): Promise<any> {
    // Generate invitation token and set expiration
    const invitationData = {
      ...invitation,
      invitation_token: randomUUID(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending'
    };
    
    const result = await db.insert(trip_invitations).values(invitationData).returning();
    return result[0];
  }

  async getInvitationByToken(token: string): Promise<any> {
    const result = await db.select().from(trip_invitations)
      .where(eq(trip_invitations.invitation_token, token));
    
    return result[0] || null;
  }

  async acceptInvitation(token: string, userId?: string): Promise<any> {
    // First find the invitation
    const invitationResult = await db.select().from(trip_invitations)
      .where(eq(trip_invitations.invitation_token, token));
    
    if (!invitationResult.length) {
      throw new Error('Invitation not found');
    }
    
    const invitation = invitationResult[0];
    
    // Check if expired
    if (invitation.expires_at && new Date() > new Date(invitation.expires_at)) {
      throw new Error('Invitation has expired');
    }
    
    // Update invitation status
    await db.update(trip_invitations)
      .set({ status: 'accepted', updated_at: new Date() })
      .where(eq(trip_invitations.id, invitation.id));
    
    // Add user as trip participant if userId provided
    if (userId) {
      try {
        await this.addTripParticipant({
          trip_id: invitation.trip_id,
          user_id: userId,
          role: 'participant'
        });
      } catch (error) {
        // User might already be a participant, ignore duplicate error
        console.log('User might already be a participant:', error);
      }
    }
    
    return { trip_id: invitation.trip_id, success: true };
  }

  async updateInvitation(id: string, updates: any): Promise<any> {
    const result = await db.update(trip_invitations)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(trip_invitations.id, id))
      .returning();
    return result[0];
  }

  async getPendingInvitationsForUser(email: string): Promise<any[]> {
    // Get invitations sent to this user's email that are still pending
    const result = await db.select()
      .from(trip_invitations)
      .where(
        and(
          eq(trip_invitations.invite_value, email),
          eq(trip_invitations.status, 'pending'),
          eq(trip_invitations.invite_type, 'email')
        )
      )
      .orderBy(desc(trip_invitations.created_at));
    
    return result;
  }

  // Payment proof methods
  async getPaymentProofs(expenseSplitId: string): Promise<PaymentProof[]> {
    return await db.select().from(payment_proofs)
      .where(eq(payment_proofs.expense_split_id, expenseSplitId))
      .orderBy(desc(payment_proofs.created_at));
  }

  async createPaymentProof(proof: InsertPaymentProof): Promise<PaymentProof> {
    const result = await db.insert(payment_proofs).values(proof).returning();
    return result[0];
  }

  async updatePaymentProof(id: string, proof: Partial<InsertPaymentProof>): Promise<PaymentProof | undefined> {
    const result = await db.update(payment_proofs)
      .set(proof)
      .where(eq(payment_proofs.id, id))
      .returning();
    return result[0];
  }

  async verifyPaymentProof(id: string, verifiedBy: string, status: string, notes?: string): Promise<PaymentProof | undefined> {
    const result = await db.update(payment_proofs)
      .set({
        verification_status: status,
        verified_by: verifiedBy,
        verified_at: new Date(),
        verification_notes: notes
      })
      .where(eq(payment_proofs.id, id))
      .returning();
    
    // If approved, also update the expense split to paid
    if (status === 'approved' && result[0]) {
      await db.update(expense_splits)
        .set({
          is_paid: true,
          paid_at: new Date(),
          payment_status: 'verified',
          verified_by: verifiedBy,
          verified_at: new Date()
        })
        .where(eq(expense_splits.id, result[0].expense_split_id));
    }
    
    return result[0];
  }

  // Enhanced expense tracking for manual payments
  async getUserUnpaidSplits(userId: string): Promise<any[]> {
    return await db.select({
      split_id: expense_splits.id,
      expense_id: expense_splits.expense_id,
      user_id: expense_splits.user_id,
      amount: expense_splits.amount,
      is_paid: expense_splits.is_paid,
      payment_status: expense_splits.payment_status,
      payment_method: expense_splits.payment_method,
      payment_proof_url: expense_splits.payment_proof_url,
      notes: expense_splits.notes,
      expense_title: trip_expenses.title,
      expense_description: trip_expenses.description,
      expense_category: trip_expenses.category,
      expense_date: trip_expenses.expense_date,
      paid_by_user_name: users.full_name,
      paid_by_email: users.email,
      trip_id: trip_expenses.trip_id,
      trip_title: trips.title,
      trip_destination: trips.destination,
      created_at: expense_splits.created_at
    })
    .from(expense_splits)
    .innerJoin(trip_expenses, eq(expense_splits.expense_id, trip_expenses.id))
    .innerJoin(trips, eq(trip_expenses.trip_id, trips.id))
    .leftJoin(users, eq(trip_expenses.paid_by, users.id))
    .where(and(
      eq(expense_splits.user_id, userId),
      eq(expense_splits.is_paid, false)
    ))
    .orderBy(desc(expense_splits.created_at));
  }

  async getTripDebtSummary(tripId: string): Promise<any[]> {
    // Get all unpaid splits for a trip with user details
    return await db.select({
      split_id: expense_splits.id,
      user_id: expense_splits.user_id,
      user_name: users.full_name,
      user_email: users.email,
      user_avatar: users.avatar_url,
      expense_id: expense_splits.expense_id,
      expense_title: trip_expenses.title,
      expense_category: trip_expenses.category,
      amount: expense_splits.amount,
      is_paid: expense_splits.is_paid,
      payment_status: expense_splits.payment_status,
      payment_method: expense_splits.payment_method,
      payment_proof_url: expense_splits.payment_proof_url,
      created_at: expense_splits.created_at
    })
    .from(expense_splits)
    .innerJoin(trip_expenses, eq(expense_splits.expense_id, trip_expenses.id))
    .innerJoin(users, eq(expense_splits.user_id, users.id))
    .where(and(
      eq(trip_expenses.trip_id, tripId),
      eq(expense_splits.is_paid, false)
    ))
    .orderBy(users.full_name, desc(expense_splits.created_at));
  }

  // Payment verification methods
  async getPendingPaymentProofs(): Promise<any[]> {
    return await db.select({
      split_id: expense_splits.id,
      user_id: expense_splits.user_id,
      user_name: users.full_name,
      user_email: users.email,
      expense_id: expense_splits.expense_id,
      expense_title: trip_expenses.title,
      expense_category: trip_expenses.category,
      amount: expense_splits.amount,
      payment_status: expense_splits.payment_status,
      payment_method: expense_splits.payment_method,
      payment_proof_url: expense_splits.payment_proof_url,
      payment_reference: expense_splits.payment_reference,
      upload_notes: expense_splits.notes,
      created_at: expense_splits.created_at,
      trip_id: trip_expenses.trip_id,
      trip_title: trips.title
    })
    .from(expense_splits)
    .innerJoin(trip_expenses, eq(expense_splits.expense_id, trip_expenses.id))
    .innerJoin(trips, eq(trip_expenses.trip_id, trips.id))
    .innerJoin(users, eq(expense_splits.user_id, users.id))
    .where(eq(expense_splits.payment_status, 'submitted'))
    .orderBy(desc(expense_splits.created_at));
  }

  async getPendingPaymentProofsByTrip(tripId: string): Promise<any[]> {
    return await db.select({
      split_id: expense_splits.id,
      user_id: expense_splits.user_id,
      user_name: users.full_name,
      user_email: users.email,
      expense_id: expense_splits.expense_id,
      expense_title: trip_expenses.title,
      expense_category: trip_expenses.category,
      amount: expense_splits.amount,
      payment_status: expense_splits.payment_status,
      payment_method: expense_splits.payment_method,
      payment_proof_url: expense_splits.payment_proof_url,
      payment_reference: expense_splits.payment_reference,
      upload_notes: expense_splits.notes,
      created_at: expense_splits.created_at,
      trip_id: trip_expenses.trip_id,
      trip_title: trips.title
    })
    .from(expense_splits)
    .innerJoin(trip_expenses, eq(expense_splits.expense_id, trip_expenses.id))
    .innerJoin(trips, eq(trip_expenses.trip_id, trips.id))
    .innerJoin(users, eq(expense_splits.user_id, users.id))
    .where(and(
      eq(trip_expenses.trip_id, tripId),
      eq(expense_splits.payment_status, 'submitted')
    ))
    .orderBy(desc(expense_splits.created_at));
  }

  async verifyPaymentProofBySplit(splitId: string, verification: any): Promise<any> {
    // Update the expense split with verification status
    const result = await db
      .update(expense_splits)
      .set({
        payment_status: verification.status,
        verified_by: verification.verified_by,
        verified_at: new Date(verification.verified_at),
        notes: verification.notes
      })
      .where(eq(expense_splits.id, splitId))
      .returning();

    return result[0];
  }
}

export const storage = new DatabaseStorage();
