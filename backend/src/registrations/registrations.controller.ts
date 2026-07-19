import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuards } from 'src/common/guards/roles.guards';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuards)
@Controller()
export class RegistrationsController {

    constructor(
        private readonly registrationsService: RegistrationsService
    ){}

    @Get('registrations')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findAllForAdmin(){
        return this.registrationsService.findAllForAdmin()
    }

    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.READER)
    @Post("events/:eventId/register")
    register(@Param('eventId') eventId: string, @CurrentUser() user: any){
        return this.registrationsService.register(eventId, user.id)
    }
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.READER)
    @Delete('events/:eventId/register')
    cancelRegistration(@Param("eventId") eventId: string, @CurrentUser() user: any){
        return this.registrationsService.cancelRegistration(eventId, user.id)
    }

     @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.READER)
    @Get("me/registrations")
    findMyRegistrations(@CurrentUser() user:any){
        return this.registrationsService.findMyRegistration(user.id)
    }

     @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Get("events/:eventId/registrations")
    findEventRegistrations(@Param("eventId") eventId: string){
        return this.registrationsService.findEventRegistrations(eventId)
    }

     @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Patch("registrations/:id/check-in")
    checkIn(@Param("id") id: string){
        return this.registrationsService.checkIn(id)
    }

    @Patch('registrations/:id/cancel')
@Roles(UserRole.ADMIN, UserRole.STAFF)
cancelByAdmin(@Param('id') id: string) {
  return this.registrationsService.cancelByAdmin(id);
    }
}
