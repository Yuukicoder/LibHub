import { BadGatewayException, BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { Model, QueryFilter, Types } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { RoomStatus } from 'src/rooms/enums/room-status.enum';
import { EventStatus } from './enums/event-status.enum';
import slugify from 'slugify'
import { RoomsService } from 'src/rooms/rooms.service';
import { EventQueryDto, SortOrder } from './dto/event-query.dto';
import { Type } from 'class-transformer';
import { UpdateEventDto } from './dto/update-event.dto';
@Injectable()
export class EventsService {
    constructor(
        @InjectModel(Event.name)
        private readonly eventModel: Model<EventDocument>,
        private readonly categoriesService: CategoriesService,
        private readonly roomsService: RoomsService
    ){}
    private async validateCategory(categoryId: string){
        await this.categoriesService.findOne(categoryId)
    }

    private async validateRoom(room: any, eventCapacity: number){
        if(room.status !== RoomStatus.AVAILABLE){
            throw new BadRequestException("Room is not available")
        }
        if(eventCapacity > room.capacity){
            throw new BadRequestException("Event capacity cannot exceed room capacity")
        }
    }

    private async validateEventTime(
        startTime: Date, 
        endTime: Date, 
        registrationDeadline: Date
    ){
        if(endTime <= startTime){
            throw new BadGatewayException("End time must be after start time")
        }

        if(registrationDeadline >= startTime){
            throw new BadGatewayException("Registration deadline must be befor start time")
        }
    }

    private async validateRoomAvailability(
        roomId: string,
        startTime: Date, 
        endTime: Date,
        excludedEventId?:string 
    ){
        const filter: QueryFilter<EventDocument> = {
            roomId: new Types.ObjectId(roomId),
            status: {
                $ne: EventStatus.CANCELLED
            },
            startTime:{
                $lt: endTime
            },
            endTime:{
                $gt: startTime
            }
        }
        if(excludedEventId){
            filter._id = {
                $ne: new Types.ObjectId(excludedEventId)
            }
        }

        const conflictEvent = await this.eventModel.findOne(filter).exec();
        if(conflictEvent){
            throw new ConflictException("Room already has another event in this time range")
        }
    }

    private async generateUniqueSlug(title: string, excludedEventId?: string){
        const baseSlug = slugify(title, {
            lower: true,
            locale: "vi",
            strict: true,
            trim: true
        })
        let slug= baseSlug;
        let counter = 1; 
        while (await this.isSlugExists(slug, excludedEventId)){
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        return slug;
    }

    private async isSlugExists(slug: string, excludedEventId?: string){
        const filter: QueryFilter<EventDocument> = {slug}
        if(excludedEventId){
            filter._id = {
                $ne: new Types.ObjectId(excludedEventId)
            }
        }
        const event  = await this.eventModel.findOne(filter).exec();
        return Boolean(event);
    }
    async create(createEventDto: CreateEventDto, userId: string){
        const {title, description, thumbnail, categoryId, roomId, startTime, endTime, registrationDeadline, capacity} = createEventDto;
        await this.validateCategory(categoryId);
        const room = await this.roomsService.findOne(roomId);
        this.validateRoom(room, capacity);
        this.validateEventTime(startTime, endTime, registrationDeadline);
        await this.validateRoomAvailability(roomId, startTime, endTime);
        
        const slug = await this.generateUniqueSlug(title);
        const event = await this.eventModel.create({
            title,
            slug,
            description,
            thumbnail,
            categoryId: new Types.ObjectId(categoryId),
            roomId: new Types.ObjectId(roomId),
            startTime,
            endTime,
            registrationDeadline,
            capacity,
            status: EventStatus.DRAFT,
            createdBy: new Types.ObjectId(userId)
        })
        return event;

    }

    async findAll(query: EventQueryDto){
        const {
            keyword,
            status,
            categoryId,
            roomId,
            date, 
            sort = SortOrder.ASC,
            page = 1,
            limit = 10
        } = query;

        const filter : QueryFilter<EventDocument> = {};
        if(keyword){
            filter.$or = [
                
                    {title: {$regex: keyword, $options: "i"}},
                   { description: {$regex: keyword, $options: "i"}}
            
            ]
        }

        if(status){
            filter.status = status;
        }
        if(categoryId){
            filter.categoryId = new Types.ObjectId(categoryId)
        }
        if(roomId){
            filter.roomId = new Types.ObjectId(roomId)
        }
        if(date){
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999z`);
            if(
                Number.isNaN(startOfDay.getTime()) || 
                Number.isNaN(endOfDay.getTime()) 
            ){
                throw new BadGatewayException("Date must have format YYYY-MM-DD")
            }
            filter.startTime = {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }
        const skip = (page-1)*limit;
        const sortDirection = sort === SortOrder.DESC ? -1 : 1;
        const [events, total] = await Promise.all([
            this.eventModel.find(filter).populate("categoryId", "name slug")
            .populate("roomId", "name code capacity")
            .populate("createdBy", "fullName email role")
            .sort({startTime: sortDirection})
            .skip(skip)
            .limit(limit)
            .exec(),

            this.eventModel.countDocuments(filter)
        ])
        return {
            events,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total/limit)
            }
        }
    }
    async findOne(id: string){
        const event = await this.eventModel.findById(id).populate("categoryId", "name slug")
            .populate("roomId", "name code capacity")
            .populate("createdBy", "fullName email role")
            .exec()
            if(!event){
                throw new NotFoundException("Event not found")
            }
            return event;
    }
    async findRawById(id: string){
        const event = await this.eventModel.findById(id).exec();
        if(!event){
            throw new NotFoundException("Event not found")
        }
        return event
    }

    async update(id: string, updateEventDto: UpdateEventDto){
        const event = await this.eventModel.findById(id).exec();
        if(!event){
            throw new NotFoundException("Event Not Found")
        }
        if(event.status === EventStatus.CANCELLED){
            throw new BadRequestException("Cannot update cancel event")
        }
        const nextCategoryId = updateEventDto.categoryId ?? event.categoryId.toString();

        const nextRoomId = updateEventDto.roomId ?? event.roomId.toString();

        const nextCapacity = updateEventDto.capacity ?? event.capacity;

        const nextStartTime = updateEventDto.startTime ?? event.startTime;

        const nextEndTime = updateEventDto.endTime ?? event.endTime;

        const nextRegistrationDeadline = updateEventDto.registrationDeadline ?? event.registrationDeadline;

        await this.validateCategory(nextCategoryId);
        
        const room  = await this.roomsService.findOne(nextRoomId);
        this.validateRoom(room, nextCapacity);
        this.validateEventTime(nextStartTime, nextEndTime,nextRegistrationDeadline);
        await this.validateRoomAvailability(nextRoomId, nextStartTime, nextEndTime, id)
        if(updateEventDto.title){
            event.title = updateEventDto.title;
            event.slug = await this.generateUniqueSlug(updateEventDto.title, id)
        }
        if(updateEventDto.description !== undefined){
            event.description = updateEventDto.description;
        }
        if(updateEventDto.thumbnail !== undefined){
            event.thumbnail = updateEventDto.thumbnail;
        }
        event.categoryId = new Types.ObjectId(nextCategoryId);
        event.roomId = new Types.ObjectId(nextRoomId);
        event.capacity = nextCapacity;
        event.startTime = nextStartTime;
        event.endTime = nextEndTime;
        event.registrationDeadline = nextRegistrationDeadline;
        
        await event.save();
        return event;
    }

    async remove(id: string){
        const event = await this.eventModel.findByIdAndDelete(id).exec();
        if(!event){
            throw new NotFoundException("Event not found")
        }
        return {
            message: "Delete event successfully",
            event
        }
    }

    async publish(id: string){
        const event = await this.eventModel.findById(id).exec();
        if(!event){
            throw new NotFoundException("Event not found")
        }

        if(event.status === EventStatus.CANCELLED){
            throw new BadRequestException("Cannot publish cancelled event")
        }
        event.status = EventStatus.PUBLISHED;
        await event.save();
        
        return {
            message: "Publish event successfully",
            event
        }
    }

    async cancel(id: string){
        const event = await this.eventModel.findById(id).exec();
        if(!event){
            throw new NotFoundException("Event not found")
        }

        event.status = EventStatus.CANCELLED;
        await event.save();
        return {
            message: "Cancel event successfully",
            event
        }
    }
    
    
}
