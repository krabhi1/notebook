import { eq } from "drizzle-orm";
import { db } from "../index";
import { users, type User, type NewUser, type UpdateUser } from "../schema";

export const UserDAO = {
  getById: async (id: string): Promise<User | undefined> => {
    const result = await db().select().from(users).where(eq(users.id, id));
    return result[0];
  },

  getByEmail: async (email: string): Promise<User | undefined> => {
    const result = await db()
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result[0];
  },

  getAll: async (): Promise<User[]> => {
    return db().select().from(users);
  },

  create: async (data: NewUser): Promise<User[]> => {
    return db().insert(users).values(data).returning();
  },

  update: async (id: string, data: UpdateUser): Promise<void> => {
    await db()
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },

  delete: async (id: string): Promise<void> => {
    await db().delete(users).where(eq(users.id, id));
  },

  exists: async (id: string): Promise<boolean> => {
    const result = await db()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id));
    return result.length > 0;
  },

  emailExists: async (email: string): Promise<boolean> => {
    const result = await db()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));
    return result.length > 0;
  },
};
