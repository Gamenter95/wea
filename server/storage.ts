import { type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByWWID(wwid: string): Promise<User | undefined>;
  getUserByUsernameOrPhone(usernameOrPhone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWWID(id: string, wwid: string): Promise<void>;
  updateUserSPIN(id: string, spin: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone));
    return result[0];
  }

  async getUserByWWID(wwid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.wwid, wwid));
    return result[0];
  }

  async getUserByUsernameOrPhone(usernameOrPhone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(
      or(eq(users.username, usernameOrPhone), eq(users.phone, usernameOrPhone))
    );
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserWWID(id: string, wwid: string): Promise<void> {
    await db.update(users).set({ wwid }).where(eq(users.id, id));
  }

  async updateUserSPIN(id: string, spin: string): Promise<void> {
    await db.update(users).set({ spin }).where(eq(users.id, id));
  }
}

export const storage = new DbStorage();
