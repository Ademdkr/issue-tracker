import { UserRole } from '../enums';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Frontend-optimized User (ohne password)
export interface UserPublic extends Omit<User, 'passwordHash'> {
  // Additional computed properties for frontend
  fullName?: string;
}
