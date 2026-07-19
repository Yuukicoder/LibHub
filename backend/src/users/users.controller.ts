import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuards)
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ){}

    @Roles(UserRole.ADMIN)
    @Get()
    findAll(){
        return this.userService.findAll()
    }
}
