import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Registration, RegistrationDocument } from './schemas/registration.schema';
import { Model, Types } from 'mongoose';
import { EventsService } from 'src/events/events.service';
import { EventStatus } from 'src/events/enums/event-status.enum';
import { RegistrationStatus } from './enums/registration-status.enum';

@Injectable()
export class RegistrationsService {
    constructor(
        @InjectModel(Registration.name)
        private readonly registrationModel : Model<RegistrationDocument>,
        private readonly eventsService: EventsService
    ){}

    private validateCanRegister(event: any){
        if(event.status !== EventStatus.PUBLISHED){
            throw new BadRequestException("Only published event can be registered")
        }
        const now = new Date();
        if(event.registrationDeadline < now){
            throw new BadRequestException("Registration deadline has passed")
        }
        if(event.startTime <= now){
            throw new BadRequestException("Cannot register event that has already started")
        }
    }
    async register(eventId: string, userId: string){
        const event = await this.eventsService.findRawById(eventId);
        this.validateCanRegister(event);

        const registeredCount = await this.registrationModel.countDocuments({
            eventId: new Types.ObjectId(eventId),
            status: {
                $in: [
                    RegistrationStatus.REGISTERED,
                    RegistrationStatus.CHECKED_IN
                ]
            }
        })

        if(registeredCount >= event.capacity){
            throw new BadRequestException("Event is full")
        }
        const existedRegistration = await this.registrationModel.findOne({eventId: new Types.ObjectId(eventId), userId: new Types.ObjectId(userId)}).exec()
        if(existedRegistration){
            if(existedRegistration.status === RegistrationStatus.REGISTERED ||
                existedRegistration.status === RegistrationStatus.CHECKED_IN
            ){
                throw new BadRequestException("You have already registered this event")
            }
            // Nếu trước đó đã huỷ, cho đăng ký lại
            existedRegistration.status = RegistrationStatus.REGISTERED;
            existedRegistration.registeredAt = new Date();
            existedRegistration.cancelledAt = undefined;
            existedRegistration.checkedInAt = undefined;

            await existedRegistration.save();
            return {
                message: 'Register event successfully',
                Registration: existedRegistration
            }
        }
        const registration = await this.registrationModel.create({
            eventId: new Types.ObjectId(eventId),
            userId: new Types.ObjectId(userId),
            status: RegistrationStatus.REGISTERED,
            registeredAt: new Date()
        })
        return {
            message: 'Register event successfully',
            registration
        }
        
    }

    async cancelRegistration(eventId: string, userId: string){
        const registration = await this.registrationModel.findOne({
            eventId: new Types.ObjectId(eventId),
            userId: new Types.ObjectId(userId)
        }).exec();
        if(!registration){
            throw new NotFoundException("Registration not found")
        }
        if(registration.status === RegistrationStatus.CANCELlED){
            throw new BadRequestException('Registration has already been cancelled')
        }
        if(registration.status === RegistrationStatus.CHECKED_IN){
            throw new BadRequestException('Cannot cancel after check-in')
        }
        registration.status = RegistrationStatus.CANCELlED;
        registration.cancelledAt = new Date();
        await registration.save();
        return{
            message: "Cancel registration successfully",
            registration
        }
    }

    async findMyRegistration(userId: string){
        return  this.registrationModel.find({userId: new Types.ObjectId(userId)})
        .populate({path: 'eventId',
             select: 'title slug description startTime endTime registrationDeadline capacity status', 
            populate: [{
                path:"categoryId",
                select: "name slug"
            }, {
                path: "roomId",
                select: "name code capacity floor"
            }]
        }).sort({createAt: -1}).exec()
    }

    async findEventRegistrations(eventId: string){
        await this.eventsService.findRawById(eventId)
        return this.registrationModel.find({eventId: new Types.ObjectId(eventId)})
        .populate("userId", "fullName email role isActive")
        .sort({createdAt: -1}).exec()
    }

    async checkIn(registrationId: string){
        const registration = await this.registrationModel.findById(registrationId).exec();
        if(!registration){
            throw new BadRequestException("Registration not found")
        }
        if(registration.status === RegistrationStatus.CANCELlED){
            throw new BadRequestException("Cannot check-in cancelled registration")
        }
        if(registration.status === RegistrationStatus.CHECKED_IN){
            throw new BadRequestException("Registration has already been checked-in")
        }
        const event = await this.eventsService.findRawById(registration.eventId.toString())
        if(event.status === EventStatus.CANCELLED){
            throw new BadRequestException("Cannot check-in cancelled event")
        }
        registration.status = RegistrationStatus.CHECKED_IN;
        registration.checkedInAt = new Date();
        await registration.save();
        return {
            message: "Check-in successfully",
            registration
        }

    }
    

    async findAllForAdmin() {
  return this.registrationModel
    .find()
    .populate('userId', 'fullName email')
    .populate(
      'eventId',
      'title slug thumbnail startTime endTime status',
    )
    .sort({ createdAt: -1 })
    .lean();
}

async cancelByAdmin(id: string) {
  const registration = await this.registrationModel.findById(id);

  if (!registration) {
    throw new NotFoundException('Registration not found');
  }

  if (registration.status !== RegistrationStatus.REGISTERED) {
    throw new BadRequestException(
      'Only registered registration can be cancelled',
    );
  }

  registration.status = RegistrationStatus.CANCELlED;
  registration.cancelledAt = new Date();

  return registration.save();
}
}
