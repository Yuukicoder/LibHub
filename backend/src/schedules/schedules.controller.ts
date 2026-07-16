import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
    constructor(
        private readonly schedulesService: SchedulesService
    ){}

    @Post('events/:eventId/schedules')
    create(@Param() eventId: string, @Body() createScheduleDto: CreateScheduleDto){
        return this.schedulesService.create(eventId, createScheduleDto)
    }

    @Get('events/:eventId/schedules')
    findByEvent(@Param() eventId: string){
        return this.schedulesService.findByEvent(eventId)
    }

    @Get('schedules/:id')
    findOne(@Param() scheduleId: string){
        return this.schedulesService.findOne(scheduleId)
    }

    @Patch('schedules/:id')
    update(@Param() scheduleId: string, @Body() updateScheduleDto: UpdateScheduleDto){
        return this.schedulesService.update(scheduleId, updateScheduleDto)
    }
    
    @Delete('schedules/:id')
    remove(@Param() scheduleId: string){
        return this.schedulesService.remove(scheduleId)
    }
} 
