import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Schedule, ScheduleSchema } from './schema/schedule.schema';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Schedule.name,
      schema: ScheduleSchema
    }]),
    EventsModule
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService]
})
export class SchedulesModule {}
