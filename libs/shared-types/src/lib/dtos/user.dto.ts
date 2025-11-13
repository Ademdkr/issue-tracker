import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums';
import { VALIDATION_LIMITS } from '../constants';

/**
 * DTO für Benutzer-Erstellung
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_LIMITS.PASSWORD_MIN, {
    message: `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters long`,
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

/**
 * DTO für Benutzer-Update
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

/**
 * DTO für Login
 */
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * DTO für Login-Response
 */
export class LoginResponseDto {
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken?: string;
}

/**
 * DTO für Passwort-Änderung
 */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_LIMITS.PASSWORD_MIN, {
    message: `New password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters long`,
  })
  newPassword: string;
}
