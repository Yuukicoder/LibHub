import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Login } from './dto/login.dto';
import bcrypt from 'bcrypt'
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {SignOptions} from 'jsonwebtoken'
@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async Register(register: RegisterDto){
        const user = await this.userService.create(register);
        return {
            message: "Register successfully",
            user
        }
    }

    async Login(login: Login){
        const user = await this.userService.findByEmailWithPassword(login.email);
        if(!user){
            throw new UnauthorizedException("Email is incorrect")
        }
        const isMatched = await bcrypt.compare(login.password, user.password)
        if(!isMatched){
            throw new UnauthorizedException("Password is incorrect")
        }
        if(!user.isActive){
            throw new UnauthorizedException("Account is disabled")
        }
        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role
        }
        const accessToken = await this.generateAccessToken(payload);
        const userObject = user.toObject();

        const {password: _password, ...safeUser} = userObject;
        return {
            message: 'Login successfully',
            accessToken,
            user: safeUser
        }
        
    }
    private async generateAccessToken(payload: JwtPayload){
        const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
        const expiresIn = this.configService.getOrThrow<SignOptions['expiresIn']>('JWT_ACCESS_EXPIRES_IN')
         return this.jwtService.signAsync(payload, {
            secret,
            expiresIn
         });
    }
}
