import {
  users,
  cooperatives,
  farmers,
  coffeeLots,
  inventory,
  auctions,
  bids,
  payments,
  smsNotifications,
  type User,
  type InsertUser,
  type Cooperative,
  type InsertCooperative,
  type Farmer,
  type InsertFarmer,
  type CoffeeLot,
  type InsertCoffeeLot,
  type Inventory,
  type InsertInventory,
  type Auction,
  type InsertAuction,
  type Bid,
  type InsertBid,
  type Payment,
  type InsertPayment,
  type SmsNotification,
  type InsertSmsNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Cooperative operations
  getCooperative(id: string): Promise<Cooperative | undefined>;
  createCooperative(cooperative: InsertCooperative): Promise<Cooperative>;
  getAllCooperatives(): Promise<Cooperative[]>;
  
  // Farmer operations
  getFarmer(id: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  getFarmersByCooperative(cooperativeId: string): Promise<Farmer[]>;
  getAllFarmers(): Promise<Farmer[]>;
  
  // Coffee lot operations
  getCoffeeLot(id: string): Promise<CoffeeLot | undefined>;
  createCoffeeLot(lot: InsertCoffeeLot): Promise<CoffeeLot>;
  getCoffeeLotsByFarmer(farmerId: string): Promise<CoffeeLot[]>;
  getCoffeeLotsByStatus(status: string): Promise<CoffeeLot[]>;
  getAllCoffeeLots(): Promise<CoffeeLot[]>;
  updateCoffeeLotStatus(id: string, status: string): Promise<CoffeeLot>;
  
  // Inventory operations
  getInventory(facilityType: string, facilityId: string): Promise<Inventory[]>;
  createInventoryRecord(record: InsertInventory): Promise<Inventory>;
  updateInventoryQuantity(lotId: string, facilityId: string, quantity: number): Promise<Inventory>;
  
  // Auction operations
  getAuction(id: string): Promise<Auction | undefined>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  getActiveAuctions(): Promise<Auction[]>;
  updateAuctionStatus(id: string, status: string, winnerId?: string): Promise<Auction>;
  
  // Bid operations
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsByAuction(auctionId: string): Promise<Bid[]>;
  getHighestBid(auctionId: string): Promise<Bid | undefined>;
  
  // Payment operations
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  updatePaymentStatus(id: string, status: string): Promise<Payment>;
  
  // SMS operations
  createSmsNotification(notification: InsertSmsNotification): Promise<SmsNotification>;
  getPendingSmsNotifications(): Promise<SmsNotification[]>;
  updateSmsStatus(id: string, status: string): Promise<SmsNotification>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  // Cooperative operations
  async getCooperative(id: string): Promise<Cooperative | undefined> {
    const [cooperative] = await db.select().from(cooperatives).where(eq(cooperatives.id, id));
    return cooperative;
  }

  async createCooperative(cooperativeData: InsertCooperative): Promise<Cooperative> {
    const [cooperative] = await db.insert(cooperatives).values(cooperativeData).returning();
    return cooperative;
  }

  async getAllCooperatives(): Promise<Cooperative[]> {
    return await db.select().from(cooperatives).orderBy(cooperatives.name);
  }

  // Farmer operations
  async getFarmer(id: string): Promise<Farmer | undefined> {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.id, id));
    return farmer;
  }

  async createFarmer(farmerData: InsertFarmer): Promise<Farmer> {
    const [farmer] = await db.insert(farmers).values(farmerData).returning();
    return farmer;
  }

  async getFarmersByCooperative(cooperativeId: string): Promise<Farmer[]> {
    return await db.select().from(farmers).where(eq(farmers.cooperativeId, cooperativeId));
  }

  async getAllFarmers(): Promise<Farmer[]> {
    return await db.select().from(farmers).orderBy(farmers.createdAt);
  }

  // Coffee lot operations
  async getCoffeeLot(id: string): Promise<CoffeeLot | undefined> {
    const [lot] = await db.select().from(coffeeLots).where(eq(coffeeLots.id, id));
    return lot;
  }

  async createCoffeeLot(lotData: InsertCoffeeLot): Promise<CoffeeLot> {
    const [lot] = await db.insert(coffeeLots).values(lotData).returning();
    return lot;
  }

  async getCoffeeLotsByFarmer(farmerId: string): Promise<CoffeeLot[]> {
    return await db.select().from(coffeeLots).where(eq(coffeeLots.farmerId, farmerId)).orderBy(desc(coffeeLots.createdAt));
  }

  async getCoffeeLotsByStatus(status: string): Promise<CoffeeLot[]> {
    return await db.select().from(coffeeLots).where(eq(coffeeLots.status, status as any)).orderBy(desc(coffeeLots.createdAt));
  }

  async getAllCoffeeLots(): Promise<CoffeeLot[]> {
    return await db.select().from(coffeeLots).orderBy(desc(coffeeLots.createdAt));
  }

  async updateCoffeeLotStatus(id: string, status: string): Promise<CoffeeLot> {
    const [lot] = await db.update(coffeeLots).set({ status: status as any }).where(eq(coffeeLots.id, id)).returning();
    return lot;
  }

  // Inventory operations
  async getInventory(facilityType: string, facilityId: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(
      and(
        eq(inventory.facilityType, facilityType),
        eq(inventory.facilityId, facilityId)
      )
    );
  }

  async createInventoryRecord(recordData: InsertInventory): Promise<Inventory> {
    const [record] = await db.insert(inventory).values(recordData).returning();
    return record;
  }

  async updateInventoryQuantity(lotId: string, facilityId: string, quantity: number): Promise<Inventory> {
    const [record] = await db.update(inventory)
      .set({ quantity: quantity.toString(), updatedAt: new Date() })
      .where(and(eq(inventory.lotId, lotId), eq(inventory.facilityId, facilityId)))
      .returning();
    return record;
  }

  // Auction operations
  async getAuction(id: string): Promise<Auction | undefined> {
    const [auction] = await db.select().from(auctions).where(eq(auctions.id, id));
    return auction;
  }

  async createAuction(auctionData: InsertAuction): Promise<Auction> {
    const [auction] = await db.insert(auctions).values(auctionData).returning();
    return auction;
  }

  async getActiveAuctions(): Promise<Auction[]> {
    return await db.select().from(auctions).where(eq(auctions.status, "active")).orderBy(desc(auctions.createdAt));
  }

  async updateAuctionStatus(id: string, status: string, winnerId?: string): Promise<Auction> {
    const updateData: any = { status };
    if (winnerId) {
      updateData.winnerId = winnerId;
    }
    const [auction] = await db.update(auctions).set(updateData).where(eq(auctions.id, id)).returning();
    return auction;
  }

  // Bid operations
  async createBid(bidData: InsertBid): Promise<Bid> {
    const [bid] = await db.insert(bids).values(bidData).returning();
    return bid;
  }

  async getBidsByAuction(auctionId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.auctionId, auctionId)).orderBy(desc(bids.amount));
  }

  async getHighestBid(auctionId: string): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.auctionId, auctionId)).orderBy(desc(bids.amount)).limit(1);
    return bid;
  }

  // Payment operations
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(sql`${payments.payerId} = ${userId} OR ${payments.payeeId} = ${userId}`)
      .orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    const [payment] = await db.update(payments)
      .set({ status: status as any, processedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // SMS operations
  async createSmsNotification(notificationData: InsertSmsNotification): Promise<SmsNotification> {
    const [notification] = await db.insert(smsNotifications).values(notificationData).returning();
    return notification;
  }

  async getPendingSmsNotifications(): Promise<SmsNotification[]> {
    return await db.select().from(smsNotifications).where(eq(smsNotifications.status, "pending"));
  }

  async updateSmsStatus(id: string, status: string): Promise<SmsNotification> {
    const updateData: any = { status };
    if (status === "sent") {
      updateData.sentAt = new Date();
    }
    const [notification] = await db.update(smsNotifications).set(updateData).where(eq(smsNotifications.id, id)).returning();
    return notification;
  }
}

export const storage = new DatabaseStorage();
