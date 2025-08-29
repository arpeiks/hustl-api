import { RoleMap, TRole } from '@/modules/drizzle/schema';
import { HasNumber, HasLowerCase, HasUpperCase, HasSpecialCharacter } from '@/validators';
import { IsEmail, IsIn, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  niche: string;

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

export class SendPhoneVerificationCodeBody {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
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
