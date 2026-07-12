import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Login } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type {Request} from 'express'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}

    @Post('register')
    register(@Body() register: RegisterDto){
        return this.authService.Register(register)
    }

    @Post('login')
    login(@Body() login: Login){
        return this.authService.Login(login)
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    // Mặc định request ko chứa user nên ràng buộc thêm unknown
    getMe(@Req() request: Request & {user: unknown}){
        return {
            user: request.user
        }
    }


}
