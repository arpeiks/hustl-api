import * as jwt from 'jsonwebtoken';
import { Algorithm } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ISignJWT {
  payload: any;
  secret: string;
  expiresIn: number;
  algorithm?: Algorithm;
  audience: string | string[];
}

export interface IVerifyJWT {
  secret: string;
  payload: string;
  audience: string;
  algorithms?: Algorithm[];
}

export interface IGenerateTokenPayload {
  sub: number;
}

@Injectable()
export class TokenService {
  private readonly JWT_AUDIENCE = 'BLINQ';
  private readonly JWT_ISSUER: string;
  private readonly JWT_HASHING_SECRET: string;
  private readonly JWT_ALGORITHM: jwt.Algorithm;
  private readonly JWT_ACCESS_TOKEN_EXPIRY: number;

  constructor(private readonly config: ConfigService) {
    this.JWT_ISSUER = this.config.getOrThrow('JWT_ISSUER');
    this.JWT_ALGORITHM = this.config.getOrThrow('JWT_ALGORITHM');
    this.JWT_HASHING_SECRET = this.config.getOrThrow('JWT_HASHING_SECRET');
    this.JWT_ACCESS_TOKEN_EXPIRY = this.config.getOrThrow('JWT_ACCESS_TOKEN_EXPIRY');
  }

  private signJWT({ algorithm, secret, audience, payload, expiresIn }: ISignJWT) {
    return jwt.sign(payload, secret, { algorithm, audience, expiresIn, issuer: this.JWT_ISSUER });
  }

  private verifyJWT({ algorithms, secret, audience, payload }: IVerifyJWT) {
    const data = jwt.verify(payload, secret, { audience, algorithms, issuer: this.JWT_ISSUER });
    return data as jwt.JwtPayload;
  }

  generateAccessToken(payload: IGenerateTokenPayload) {
    return this.signJWT({
      payload,
      audience: this.JWT_AUDIENCE,
      algorithm: this.JWT_ALGORITHM,
      secret: this.JWT_HASHING_SECRET,
      expiresIn: this.JWT_ACCESS_TOKEN_EXPIRY,
    });
  }

  async verifyAccessToken(payload: string) {
    return await this.verifyJWT({
      payload,
      audience: this.JWT_AUDIENCE,
      secret: this.JWT_HASHING_SECRET,
      algorithms: [this.JWT_ALGORITHM],
    });
  }
}
