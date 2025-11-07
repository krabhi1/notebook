import { UserRepository } from "../repos/userRepository";
import { FolderRepository } from "../repos/folderRepository";
import { type User, type NewUser, type UpdateUser } from "~/.server/db/schema";

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private folderRepository: FolderRepository,
  ) {}

  // async createUser(userData: {
  //   id: string;
  //   email: string;
  //   name: string;
  //   imageUrl?: string;
  // }): Promise<User> {
  //   // Check if user already exists by email
  //   const existingUser = await this.userRepository.getByEmail(userData.email);
  //   if (existingUser) {
  //     throw new Error(`User with email ${userData.email} already exists`);
  //   }

  //   // Check if user ID already exists
  //   const existingById = await this.userRepository.exists(userData.id);
  //   if (existingById) {
  //     throw new Error(`User with ID ${userData.id} already exists`);
  //   }

  //   const [user] = await this.userRepository.create({
  //     id: userData.id,
  //     email: userData.email,
  //     name: userData.name,
  //     imageUrl: userData.imageUrl,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   });

  //   return user;
  // }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.getAll();
  }

  async updateUser(id: string, data: UpdateUser): Promise<void> {
    const userExists = await this.userRepository.exists(id);
    if (!userExists) {
      throw new Error(`User with id ${id} not found`);
    }

    await this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    // Note: This will cascade delete all folders, pages, and files
    // due to database foreign key constraints
    await this.userRepository.delete(id);
  }

  async userExists(id: string): Promise<boolean> {
    return this.userRepository.exists(id);
  }

  async emailExists(email: string): Promise<boolean> {
    return this.userRepository.existsByEmail(email);
  }

  // async findOrCreateUser(userData: {
  //   id: string;
  //   email: string;
  //   name: string;
  //   imageUrl?: string;
  // }): Promise<User> {
  //   // Try to find existing user by ID first
  //   const existingUser = await this.userRepository.getById(userData.id);
  //   if (existingUser) {
  //     // Update user data if needed
  //     if (
  //       existingUser.email !== userData.email ||
  //       existingUser.name !== userData.name ||
  //       existingUser.imageUrl !== userData.imageUrl
  //     ) {
  //       await this.userRepository.update(userData.id, {
  //         name: userData.name,
  //         // Note: We typically don't update email as it's used for identity
  //       });
  //       return this.getUserById(userData.id);
  //     }
  //     return existingUser;
  //   }

  //   // Create new user if not found
  //   return this.createUser(userData);
  // }

  async getUserStats(id: string): Promise<{
    id: string;
    name: string;
    email: string;
    folderCount: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await this.getUserById(id);
    const folders = await this.folderRepository.getByUser(id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      folderCount: folders.length,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
