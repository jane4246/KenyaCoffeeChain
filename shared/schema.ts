import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  varchar, 
  text, 
  decimal, 
  timestamp, 
  pgEnum,
  boolean,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "farmer",
  "mill",
  "cooperative",  
  "exporter",
  "roaster",
  "retailer"
]);

export const lotStatusEnum = pgEnum("lot_status", [
  "harvested",
  "wet_processing",  
  "dry_processing",
  "quality_testing",
  "ready_for_auction",
  "sold",
  "exported",
  "roasted",
  "retail"
]);

export const gradeEnum = pgEnum("grade", [
  "AA",
  "AB",  
  "C",
  "PB",
  "E"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "completed",
  "failed"
]);

// Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull(),
  cooperativeId: varchar("cooperative_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cooperatives = pgTable("cooperatives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const farmers = pgTable("farmers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  farmId: varchar("farm_id").unique().notNull(),
  farmSize: decimal("farm_size", { precision: 10, scale: 2 }),
  location: varchar("location", { length: 255 }),
  cooperativeId: varchar("cooperative_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coffeeLots = pgTable("coffee_lots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lotId: varchar("lot_id").unique().notNull(),
  farmerId: varchar("farmer_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  grade: gradeEnum("grade"),
  // Corrected line: changed from enum to varchar
  processingMethod: varchar("processing_method", { length: 255 }).notNull(),
  status: lotStatusEnum("status").default("harvested"),
  qrCode: text("qr_code"),
  harvestDate: timestamp("harvest_date").defaultNow(),
  currentLocation: varchar("current_location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lotId: varchar("lot_id").notNull(),
  facilityType: varchar("facility_type", { length: 50 }).notNull(), // wet_mill, dry_mill, cooperative
  facilityId: varchar("facility_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auctions = pgTable("auctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lotId: varchar("lot_id").notNull(),
  startingPrice: decimal("starting_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  sellerId: varchar("seller_id").notNull(),
  winnerId: varchar("winner_id"),
  status: varchar("status", { length: 20 }).default("active"), // active, closed, cancelled
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionId: varchar("auction_id").notNull(),
  bidderId: varchar("bidder_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bidTime: timestamp("bid_time").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").unique().notNull(),
  lotId: varchar("lot_id"),
  payerId: varchar("payer_id").notNull(),
  payeeId: varchar("payee_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }), // m-pesa, bank, cash
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const smsNotifications = pgTable("sms_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, failed
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  cooperative: one(cooperatives, {
    fields: [users.cooperativeId],
    references: [cooperatives.id],
  }),
  farmer: one(farmers, {
    fields: [users.id],
    references: [farmers.userId],
  }),
  sentPayments: many(payments, { relationName: "payer" }),
  receivedPayments: many(payments, { relationName: "payee" }),
  smsNotifications: many(smsNotifications),
  auctions: many(auctions, { relationName: "seller" }),
  bids: many(bids),
}));

export const cooperativesRelations = relations(cooperatives, ({ many }) => ({
  members: many(users),
  farmers: many(farmers),
}));

export const farmersRelations = relations(farmers, ({ one, many }) => ({
  user: one(users, {
    fields: [farmers.userId],
    references: [users.id],
  }),
  cooperative: one(cooperatives, {
    fields: [farmers.cooperativeId],
    references: [cooperatives.id],
  }),
  lots: many(coffeeLots),
}));

export const coffeeLotsRelations = relations(coffeeLots, ({ one, many }) => ({
  farmer: one(farmers, {
    fields: [coffeeLots.farmerId],
    references: [farmers.id],
  }),
  inventory: many(inventory),
  auctions: many(auctions),
  payments: many(payments),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  lot: one(coffeeLots, {
    fields: [inventory.lotId],
    references: [coffeeLots.id],
  }),
}));

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  lot: one(coffeeLots, {
    fields: [auctions.lotId],
    references: [coffeeLots.id],
  }),
  seller: one(users, {
    fields: [auctions.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  winner: one(users, {
    fields: [auctions.winnerId],
    references: [users.id],
    relationName: "winner",
  }),
  bids: many(bids),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  auction: one(auctions, {
    fields: [bids.auctionId],
    references: [auctions.id],
  }),
  bidder: one(users, {
    fields: [bids.bidderId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  lot: one(coffeeLots, {
    fields: [payments.lotId],
    references: [coffeeLots.id],
  }),
  payer: one(users, {
    fields: [payments.payerId],
    references: [users.id],
    relationName: "payer",
  }),
  payee: one(users, {
    fields: [payments.payeeId],
    references: [users.id],
    relationName: "payee",
  }),
}));

export const smsNotificationsRelations = relations(smsNotifications, ({ one }) => ({
  recipient: one(users, {
    fields: [smsNotifications.recipientId],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCooperativeSchema = createInsertSchema(cooperatives).omit({ 
  id: true, 
  createdAt: true 
});

export const insertFarmerSchema = createInsertSchema(farmers).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCoffeeLotSchema = createInsertSchema(coffeeLots).omit({ 
  id: true, 
  createdAt: true,
  harvestDate: true,
  qrCode: true 
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ 
  id: true, 
  updatedAt: true 
});

export const insertAuctionSchema = createInsertSchema(auctions).omit({ 
  id: true, 
  createdAt: true,
  startTime: true 
});

export const insertBidSchema = createInsertSchema(bids).omit({ 
  id: true, 
  bidTime: true 
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSmsNotificationSchema = createInsertSchema(smsNotifications).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Cooperative = typeof cooperatives.$inferSelect;
export type InsertCooperative = z.infer<typeof insertCooperativeSchema>;
export type Farmer = typeof farmers.$inferSelect;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type CoffeeLot = typeof coffeeLots.$inferSelect;
export type InsertCoffeeLot = z.infer<typeof insertCoffeeLotSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SmsNotification = typeof smsNotifications.$inferSelect;
export type InsertSmsNotification = z.infer<typeof insertSmsNotificationSchema>;
