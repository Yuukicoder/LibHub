import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Schedule, ScheduleDocument } from './schema/schedule.schema';
import { Model, QueryFilter, Types } from 'mongoose';
import { EventsService } from 'src/events/events.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { EventStatus } from 'src/events/enums/event-status.enum';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
    constructor(
        @InjectModel(Schedule.name)
        private readonly scheduleModel: Model<ScheduleDocument>,
        private readonly eventService: EventsService
    ){}

    private async validateScheduleTime(
        scheduleStartTime: Date,
        scheduleEndTime: Date, 
        eventStartTime: Date, 
        eventEndTime: Date
    ){
        if(scheduleEndTime <= scheduleStartTime){
            throw new BadRequestException("Schedule end time must be after start time")
        }
        if(scheduleStartTime < eventStartTime || scheduleEndTime > eventEndTime){
            throw new BadRequestException("Schedule time must be within event time")
        }
    }

    private async validateScheduleOverlap(
        eventId: string,
        startTime: Date, 
        endTime: Date, 
        excludedScheduleId?: string
    ){
        const filter: QueryFilter<ScheduleDocument>= {
            eventId: new Types.ObjectId(eventId),
            startTime: {
                $lt: endTime
            },
            endTime:{
                $gt: startTime
            }
        }

        if(excludedScheduleId){
            filter._id = {
                $ne: new Types.ObjectId(excludedScheduleId)
            }
        }

        const conflictSchedule = await this.scheduleModel.findOne(filter).exec();
        if(conflictSchedule){
            throw new ConflictException("Another schedule already exists in this time range")
        }
    }
    async create(eventId: string, createScheduleDto: CreateScheduleDto){
        const event = await this.eventService.findRawById(eventId)
        if(event.status === EventStatus.CANCELLED){
            throw new BadRequestException("Cannot add schedule to cancelled event")
        }
        const {
            title,
            description,
            startTime,
            endTime, 
            speakerName, 
            locationNote,
            order
        } = createScheduleDto
        this.validateScheduleTime(startTime, endTime, event.startTime, event.endTime);

        await this.validateScheduleOverlap(eventId, startTime, endTime);

        const schedule = await this.scheduleModel.create({
            eventId: new Types.ObjectId(eventId),
            title,
            description,
            startTime,
            endTime,
            speakerName, 
            locationNote,
            order: order ?? 0
        })
        return schedule
    }

    async findByEvent(eventId: string){
        await this.eventService.findRawById(eventId);
        return this.scheduleModel.find({eventId: new Types.ObjectId(eventId)})
        .sort({startTime: 1, order: 1}).exec()
    }

    async findOne(id: string){
        const schedule = await this.scheduleModel.findById(id)
        .populate("eventId", "title slug startTime endTime status").exec();
        if(!schedule){
            throw new NotFoundException("Schedule not found")
        }
        return schedule
    }

    async update(id: string, updateScheduleDTO: UpdateScheduleDto){
        const schedule = await this.scheduleModel.findById(id).exec();
        if(!schedule){
            throw new NotFoundException("Schedule not found")
        }
        const event = await this.eventService.findRawById(schedule.eventId.toString());
        if(event.status === EventStatus.CANCELLED){
            throw new BadRequestException("Cannot update schedule of cancelled event")
        }

        const nextStartTime = updateScheduleDTO.startTime ?? schedule.startTime;
        const nextEndTime = updateScheduleDTO.endTime ?? schedule.endTime;

        this.validateScheduleTime(
            nextStartTime, 
            nextEndTime,
            event.startTime,
            event.endTime
        )
        await this.validateScheduleOverlap(
            schedule.eventId.toString(),
            nextStartTime,
            nextEndTime,
            id
        )
        if(updateScheduleDTO.title !== undefined){
            schedule.title = updateScheduleDTO.title
        }
        if(updateScheduleDTO.description !== undefined){
            schedule.description = updateScheduleDTO.description
        }
        if(updateScheduleDTO.startTime !== undefined){
            schedule.startTime = updateScheduleDTO.startTime
        }
        if(updateScheduleDTO.endTime !== undefined){
            schedule.endTime = updateScheduleDTO.endTime
        }
        if(updateScheduleDTO.speakerName !== undefined){
            schedule.speakerName = updateScheduleDTO.speakerName
        }
        if(updateScheduleDTO.locationNote !== undefined){
            schedule.locationNote = updateScheduleDTO.locationNote
        }
        if(updateScheduleDTO.order !== undefined){
            schedule.order = updateScheduleDTO.order
        }
        await schedule.save();
        return schedule;
        

    }

    async remove(id: string){
        const schedule = await this.scheduleModel.findByIdAndDelete(id).exec();
        if(!schedule){
            throw new NotFoundException("Schedule not found")
        }
        return {
            message: "Delete schedule successfully",
            schedule
        }
    }

    
}
