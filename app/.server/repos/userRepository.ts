import { eq } from "drizzle-orm";
import type { DrizzleClient } from "../db";
import {
  users,
  type User,
  type NewUser,
  type UpdateUser,
} from "~/.server/db/schema";

export class UserRepository {
  constructor(private db: DrizzleClient) {}

  async getById(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getByEmail(email: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result[0];
  }

  async getAll(): Promise<User[]> {
    return this.db.select().from(users).orderBy(users.createdAt);
  }

  async create(data: NewUser): Promise<User[]> {
    return this.db.insert(users).values(data).returning();
  }

  async update(id: string, data: UpdateUser): Promise<void> {
    await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result.length > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result.length > 0;
  }
}
