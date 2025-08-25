import { pgTable, text, uuid, timestamp, decimal, integer, boolean, date, time, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  phone: text("phone"),
  date_of_birth: date("date_of_birth"),
  bio: text("bio"),
  travel_preferences: jsonb("travel_preferences").default({}),
  dietary_restrictions: jsonb("dietary_restrictions").default([]),
  accessibility_needs: jsonb("accessibility_needs").default([]),
  notification_preferences: jsonb("notification_preferences").default({
    email: true,
    push: true,
    sms: false
  }),
  privacy_settings: jsonb("privacy_settings").default({
    profile_visibility: "friends",
    location_sharing: false
  }),
  emergency_contact: jsonb("emergency_contact").default({}),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Trips table
export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  description: text("description"),
  start_date: date("start_date"),
  end_date: date("end_date"),
  status: text("status").default("planning"),
  trip_type: text("trip_type").default("leisure"),
  budget_total: decimal("budget_total", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  planning_status: text("planning_status").default("draft"),
  group_settings: jsonb("group_settings").default({
    allow_member_invites: false,
    auto_approve_members: true,
    chat_enabled: true
  }),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Trip participants
export const trip_participants = pgTable("trip_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").default("participant"),
  status: text("status").default("active"),
  invitation_id: uuid("invitation_id"),
  joined_at: timestamp("joined_at").defaultNow(),
});

// Trip invitations
export const trip_invitations = pgTable("trip_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  invited_by: uuid("invited_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  invite_type: text("invite_type").notNull(),
  invite_value: text("invite_value"),
  invitation_token: uuid("invitation_token").defaultRandom(),
  status: text("status").default("pending"),
  expires_at: timestamp("expires_at"),
  message: text("message"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Messages for group chat
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  sender_id: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  message_type: text("message_type").default("text"),
  file_url: text("file_url"),
  file_name: text("file_name"),
  file_size: integer("file_size"),
  reply_to_message_id: uuid("reply_to_message_id"),
  edited_at: timestamp("edited_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Trip expenses
export const trip_expenses = pgTable("trip_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  category: text("category").default("other"),
  paid_by: uuid("paid_by").references(() => users.id),
  expense_date: date("expense_date").defaultNow(),
  receipt_url: text("receipt_url"),
  is_shared: boolean("is_shared").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Expense splits
export const expense_splits = pgTable("expense_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  expense_id: uuid("expense_id").references(() => trip_expenses.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  is_paid: boolean("is_paid").default(false),
  paid_at: timestamp("paid_at"),
  payment_method: text("payment_method"), // cash, venmo, paypal, bank_transfer, etc.
  payment_reference: text("payment_reference"), // external payment ID/reference
  payment_status: text("payment_status").default("pending"), // pending, submitted, verified, failed
  payment_proof_url: text("payment_proof_url"), // screenshot/proof upload URL
  verified_by: uuid("verified_by").references(() => users.id), // who verified the payment
  verified_at: timestamp("verified_at"),
  notes: text("notes"), // additional payment notes
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Payment proofs (for screenshot uploads)
export const payment_proofs = pgTable("payment_proofs", {
  id: uuid("id").primaryKey().defaultRandom(),
  expense_split_id: uuid("expense_split_id").references(() => expense_splits.id, { onDelete: "cascade" }).notNull(),
  file_url: text("file_url").notNull(),
  file_name: text("file_name").notNull(),
  file_size: integer("file_size"),
  uploaded_by: uuid("uploaded_by").references(() => users.id).notNull(),
  upload_notes: text("upload_notes"),
  verification_status: text("verification_status").default("pending"), // pending, approved, rejected
  verified_by: uuid("verified_by").references(() => users.id),
  verified_at: timestamp("verified_at"),
  verification_notes: text("verification_notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Activity suggestions
export const activity_suggestions = pgTable("activity_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  category: text("category").default("attraction"),
  estimated_cost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimated_duration: integer("estimated_duration"),
  suggested_by: uuid("suggested_by").references(() => users.id),
  external_id: text("external_id"),
  external_data: jsonb("external_data"),
  status: text("status").default("suggested"), // suggested, approved, declined, completed
  booking_details: jsonb("booking_details"), // Store booking information, confirmations, etc.
  translations: jsonb("translations"), // AI-generated translations with cultural context
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Activity votes
export const activity_votes = pgTable("activity_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  activity_id: uuid("activity_id").references(() => activity_suggestions.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  vote_type: text("vote_type").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Accommodation options
export const accommodation_options = pgTable("accommodation_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: text("type").default("hotel"),
  location: text("location"),
  price_per_night: decimal("price_per_night", { precision: 10, scale: 2 }),
  check_in_date: date("check_in_date"),
  check_out_date: date("check_out_date"),
  capacity: integer("capacity"),
  amenities: text("amenities").array(),
  external_url: text("external_url"),
  external_data: jsonb("external_data"),
  suggested_by: uuid("suggested_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Accommodation votes
export const accommodation_votes = pgTable("accommodation_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  accommodation_id: uuid("accommodation_id").references(() => accommodation_options.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  vote_type: text("vote_type").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Itinerary days
export const itinerary_days = pgTable("itinerary_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  day_date: date("day_date").notNull(),
  title: text("title").default(""),
  description: text("description").default(""),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Itinerary items
export const itinerary_items = pgTable("itinerary_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  day_id: uuid("day_id").references(() => itinerary_days.id, { onDelete: "cascade" }).notNull(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  start_time: time("start_time"),
  end_time: time("end_time"),
  location: text("location"),
  category: text("category").default("activity"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  status: text("status").default("planned"), // planned, completed, cancelled
  created_by: uuid("created_by").references(() => users.id),
  order_index: integer("order_index").default(0),
  activity_suggestion_id: uuid("activity_suggestion_id").references(() => activity_suggestions.id),
  expense_id: uuid("expense_id").references(() => trip_expenses.id), // Link to consolidated expense
  participants: text("participants").array(), // User IDs who will participate
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }),
  location_name: text("location_name").notNull(),
  rating: integer("rating").notNull(),
  review_text: text("review_text"),
  photos: jsonb("photos").default([]),
  review_type: text("review_type").default("location"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Trip documents
export const trip_documents = pgTable("trip_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }).notNull(),
  file_name: text("file_name").notNull(),
  file_url: text("file_url").notNull(),
  file_size: integer("file_size"),
  file_type: text("file_type"),
  document_type: text("document_type").default("general"),
  uploaded_by: uuid("uploaded_by").references(() => users.id),
  description: text("description"),
  is_private: boolean("is_private").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTripExpenseSchema = createInsertSchema(trip_expenses).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertExpenseSplitSchema = createInsertSchema(expense_splits).omit({
  id: true,
  created_at: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTripParticipantSchema = createInsertSchema(trip_participants).omit({
  id: true,
  joined_at: true,
});

export const insertTripInvitationSchema = createInsertSchema(trip_invitations).omit({
  id: true,
  invitation_token: true,
  created_at: true,
  updated_at: true,
});

export const insertItineraryDaySchema = createInsertSchema(itinerary_days).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertItineraryItemSchema = createInsertSchema(itinerary_items).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPaymentProofSchema = createInsertSchema(payment_proofs).omit({
  id: true,
  created_at: true,
  verification_status: true,
  verified_by: true,
  verified_at: true,
}).extend({
  payment_method: z.string().optional(),
  payment_reference: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertTripExpense = z.infer<typeof insertTripExpenseSchema>;
export type TripExpense = typeof trip_expenses.$inferSelect;
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;
export type ExpenseSplit = typeof expense_splits.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertTripParticipant = z.infer<typeof insertTripParticipantSchema>;
export type TripParticipant = typeof trip_participants.$inferSelect;
export type InsertTripInvitation = z.infer<typeof insertTripInvitationSchema>;
export type TripInvitation = typeof trip_invitations.$inferSelect;
export type InsertItineraryDay = z.infer<typeof insertItineraryDaySchema>;
export type ItineraryDay = typeof itinerary_days.$inferSelect;
export type InsertItineraryItem = z.infer<typeof insertItineraryItemSchema>;
export type ItineraryItem = typeof itinerary_items.$inferSelect;
export type InsertPaymentProof = z.infer<typeof insertPaymentProofSchema>;
export type PaymentProof = typeof payment_proofs.$inferSelect;
