import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertCooperativeSchema,
  insertFarmerSchema,
  insertCoffeeLotSchema,
  insertAuctionSchema,
  insertBidSchema,
  insertPaymentSchema,
  insertSmsNotificationSchema
} from "@shared/schema";
import { randomUUID } from "crypto";
import { z } from "zod";
import QRCode from "qrcode";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:role", async (req, res) => {
    try {
      const { role } = req.params;
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cooperative routes
  app.post("/api/cooperatives", async (req, res) => {
    try {
      const cooperativeData = insertCooperativeSchema.parse(req.body);
      const cooperative = await storage.createCooperative(cooperativeData);
      res.json(cooperative);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/cooperatives", async (req, res) => {
    try {
      const cooperatives = await storage.getAllCooperatives();
      res.json(cooperatives);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Farmer routes
  app.post("/api/farmers", async (req, res) => {
    try {
      const farmerData = insertFarmerSchema.parse(req.body);
      const farmer = await storage.createFarmer(farmerData);
      res.json(farmer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/farmers", async (req, res) => {
    try {
      const { cooperativeId } = req.query;
      let farmers;
      if (cooperativeId) {
        farmers = await storage.getFarmersByCooperative(cooperativeId as string);
      } else {
        farmers = await storage.getAllFarmers();
      }
      res.json(farmers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Coffee lot routes
  app.post("/api/lots", async (req, res) => {
    try {
      const lotData = insertCoffeeLotSchema.parse(req.body);
      
      // Generate unique lot ID
      const timestamp = Date.now().toString();
      const lotId = `KC-2024-${timestamp.slice(-6)}`;
      
      // Generate QR code
      const qrData = {
        lotId,
        farmerId: lotData.farmerId,
        quantity: lotData.quantity,
        processingMethod: lotData.processingMethod,
        timestamp: new Date().toISOString()
      };
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      
      const lot = await storage.createCoffeeLot({
        ...lotData,
        lotId,
        qrCode
      });
      
      res.json(lot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/lots", async (req, res) => {
    try {
      const { farmerId, status } = req.query;
      let lots;
      
      if (farmerId) {
        lots = await storage.getCoffeeLotsByFarmer(farmerId as string);
      } else if (status) {
        lots = await storage.getCoffeeLotsByStatus(status as string);
      } else {
        lots = await storage.getAllCoffeeLots();
      }
      
      res.json(lots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/lots/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const lot = await storage.updateCoffeeLotStatus(id, status);
      res.json(lot);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const { facilityType, facilityId } = req.query;
      if (!facilityType || !facilityId) {
        return res.status(400).json({ message: "facilityType and facilityId are required" });
      }
      const inventory = await storage.getInventory(facilityType as string, facilityId as string);
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const inventoryData = req.body;
      const record = await storage.createInventoryRecord(inventoryData);
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Auction routes
  app.post("/api/auctions", async (req, res) => {
    try {
      const auctionData = insertAuctionSchema.parse(req.body);
      const auction = await storage.createAuction(auctionData);
      res.json(auction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auctions", async (req, res) => {
    try {
      const auctions = await storage.getActiveAuctions();
      res.json(auctions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bid routes
  app.post("/api/bids", async (req, res) => {
    try {
      const bidData = insertBidSchema.parse(req.body);
      const bid = await storage.createBid(bidData);
      
      // Update auction current price
      const auction = await storage.getAuction(bidData.auctionId);
      if (auction) {
        await storage.updateAuctionStatus(auction.id, auction.status!, bid.bidderId);
      }
      
      res.json(bid);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auctions/:id/bids", async (req, res) => {
    try {
      const { id } = req.params;
      const bids = await storage.getBidsByAuction(id);
      res.json(bids);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const transactionId = `TXN-${randomUUID()}`;
      const payment = await storage.createPayment({
        ...paymentData,
        transactionId
      });
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/payments/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const payments = await storage.getPaymentsByUser(userId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(id, status);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // SMS routes
  app.post("/api/sms/send", async (req, res) => {
    try {
      const smsData = insertSmsNotificationSchema.parse(req.body);
      const notification = await storage.createSmsNotification(smsData);
      
      // Here you would integrate with Twilio
      // For now, we'll just mark as sent
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        // TODO: Implement Twilio SMS sending
        await storage.updateSmsStatus(notification.id, "sent");
      } else {
        console.log(`SMS to ${notification.phone}: ${notification.message}`);
        await storage.updateSmsStatus(notification.id, "sent");
      }
      
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const farmers = await storage.getAllFarmers();
      const lots = await storage.getAllCoffeeLots();
      const activeAuctions = await storage.getActiveAuctions();
      
      const stats = {
        activeFarmers: farmers.length,
        coffeeLots: lots.length,
        totalInventory: lots.reduce((sum, lot) => sum + parseFloat(lot.quantity || "0"), 0),
        activeAuctions: activeAuctions.length
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
