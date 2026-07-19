import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('registrations')
export class RegistrationsController {
    constructor(
        private readonly registrationsService: RegistrationsService
    ){}

    @Post("events/:eventId/register")
    register(@Param('eventId') eventId: string, @CurrentUser() user: any){
        return this.registrationsService.register(eventId, user.id)
    }

    @Delete('events/:eventId/register')
    cancelRegistration(@Param("eventId") eventId: string, @CurrentUser() user: any){
        return this.registrationsService.cancelRegistration(eventId, user.id)
    }

    @Get("me/registrations")
    findMyRegistrations(@CurrentUser() user:any){
        return this.registrationsService.findMyRegistration(user.id)
    }

    @Get("events/:eventId/registrations")
    findEventRegistrations(@Param("eventId") eventId: string){
        return this.registrationsService.findEventRegistrations(eventId)
    }

    @Patch("registrations/:id/check-in")
    checkIn(@Param("id") id: string){
        return this.registrationsService.checkIn(id)
    }
}
