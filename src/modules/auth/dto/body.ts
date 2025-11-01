import { HasNumber, HasLowerCase, HasUpperCase, HasSpecialCharacter } from '@/validators';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateAccountBody {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  pushToken: string;

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
  pushToken: string;

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

export class VerifyPasswordResetCodeBody {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  code: string;
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
  bio?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UploadProfilePhotoBody {
  @IsNotEmpty()
  file: Express.Multer.File;
}
