import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Registration, RegistrationSchema } from './schemas/registration.schema';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports:[
    MongooseModule.forFeature([{
      name: Registration.name,
      schema: RegistrationSchema
    }]),
    EventsModule
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService]
})
export class RegistrationsModule {}
