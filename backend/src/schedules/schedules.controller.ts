import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { RolesGuards } from 'src/common/guards/roles.guards';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuards)
@Controller()
export class SchedulesController {
    constructor(
        private readonly schedulesService: SchedulesService
    ){}

    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Post('events/:eventId/schedules')
    create(@Param('eventId') eventId: string, @Body() createScheduleDto: CreateScheduleDto){
        return this.schedulesService.create(eventId, createScheduleDto)
    }

    @Get('events/:eventId/schedules')
    findByEvent(@Param('eventId') eventId: string){
        return this.schedulesService.findByEvent(eventId)
    }
    
    @Get('schedules')
    findAllSchedule(){
        return this.schedulesService.getAllSchedule();
    }

    @Get('schedules/:id')
    findOne(@Param('id') id: string){
        return this.schedulesService.findOne(id)
    }

    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Patch('schedules/:id')
    update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto){
        return this.schedulesService.update(id, updateScheduleDto)
    }
    
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Delete('schedules/:id')
    remove(@Param("id") id: string){
        return this.schedulesService.remove(id)
    }
} 
