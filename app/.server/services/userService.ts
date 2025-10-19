import { UserDAO } from "../db/queries/user";
import { FolderDAO } from "../db/queries/folder";
import { type User, type NewUser, type UpdateUser } from "../db/schema";

export const UserService = {
  createUser: async (userData: {
    id: string;
    email: string;
    name: string;
    imageUrl?: string;
  }): Promise<User> => {
    // Check if user already exists
    const existingUser = await UserDAO.getByEmail(userData.email);
    if (existingUser) {
      throw new Error(`User with email ${userData.email} already exists`);
    }

    const [user] = await UserDAO.create({
      ...userData,
      onBoarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  },

  getUserById: async (id: string): Promise<User> => {
    const user = await UserDAO.getById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const user = await UserDAO.getByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  },

  updateUser: async (id: string, data: UpdateUser): Promise<void> => {
    const userExists = await UserDAO.exists(id);
    if (!userExists) {
      throw new Error(`User with id ${id} not found`);
    }

    await UserDAO.update(id, data);
  },

  completeOnboarding: async (id: string): Promise<void> => {
    await UserService.updateUser(id, { onBoarded: true });
  },

  updateProfile: async (
    id: string,
    data: {
      name?: string;
      imageUrl?: string;
    },
  ): Promise<void> => {
    await UserService.updateUser(id, data);
  },

  deleteUser: async (
    id: string,
    options?: {
      hardDelete?: boolean;
    },
  ): Promise<void> => {
    const userExists = await UserDAO.exists(id);
    if (!userExists) {
      throw new Error(`User with id ${id} not found`);
    }

    if (options?.hardDelete) {
      // Delete all user's folders and their content first
      const folders = await FolderDAO.getByUser(id);
      for (const folder of folders) {
        await FolderDAO.hardDelete(folder.id);
      }

      await UserDAO.delete(id);
    } else {
      // Soft delete - mark user folders as deleted
      const folders = await FolderDAO.getByUser(id);
      for (const folder of folders) {
        await FolderDAO.softDelete(folder.id);
      }

      // Note: We don't have soft delete for users in schema,
      // so this would need to be implemented if required
      throw new Error("Soft delete not implemented for users");
    }
  },

  getUserWithFolders: async (id: string) => {
    const user = await UserService.getUserById(id);
    const folders = await FolderDAO.getByUserWithPages(id);

    return {
      ...user,
      folders,
    };
  },

  validateUserAccess: async (
    userId: string,
    resourceUserId: string,
  ): Promise<boolean> => {
    return userId === resourceUserId;
  },

  isOnboarded: async (id: string): Promise<boolean> => {
    const user = await UserService.getUserById(id);
    return !!user.onBoarded;
  },

  getAllUsers: async (): Promise<User[]> => {
    return UserDAO.getAll();
  },

  searchUsersByEmail: async (emailQuery: string): Promise<User[]> => {
    // This would need to be implemented in DAO if needed
    // For now, get all users and filter (not efficient for large datasets)
    const allUsers = await UserDAO.getAll();
    return allUsers.filter((user) =>
      user.email.toLowerCase().includes(emailQuery.toLowerCase()),
    );
  },
};
