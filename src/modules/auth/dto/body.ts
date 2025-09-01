import { RoleMap, TRole } from '@/modules/drizzle/schema';
import { HasNumber, HasLowerCase, HasUpperCase, HasSpecialCharacter } from '@/validators';
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateAccountBody {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsIn(RoleMap)
  role: TRole;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @HasNumber()
  @MinLength(8)
  @HasLowerCase()
  @HasUpperCase()
  @HasSpecialCharacter()
  password: string;
}

export class LoginBody {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @HasNumber()
  @MinLength(8)
  @HasLowerCase()
  @HasUpperCase()
  @HasSpecialCharacter()
  password: string;
}

export class VerifyPhoneBody {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class VerifyEmailBody {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class SendEmailVerificationCodeBody {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class SendPasswordResetCodeBody {
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class ResetPasswordBody {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @HasNumber()
  @MinLength(8)
  @HasLowerCase()
  @HasUpperCase()
  @HasSpecialCharacter()
  password: string;
}

export class UpdateProfileBody {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;
}
