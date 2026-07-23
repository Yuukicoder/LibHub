import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateUserRoleDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

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

     @Patch(':id/role')
  updateRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.userService.updateRole(userId, dto.role);
  }

    @Patch(':id/status')
  updateStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateStatus(
      userId,
      dto.isActive,
    );
  }
}
