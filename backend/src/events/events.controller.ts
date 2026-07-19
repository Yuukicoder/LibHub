import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { EventQueryDto } from './dto/event-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RolesGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuards)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()

  create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(createEventDto, user.id);
  }

  @Get()
  findAll(@Query() query: EventQueryDto){
    return this.eventsService.findAll(query)
  }

  @Get(":id")
  findOne(@Param("id") id:string){
    return this.eventsService.findOne(id)
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(":id")
  update(@Param("id") id:string, @Body() updateEventDto: UpdateEventDto){
    return this.eventsService.update(id,updateEventDto)
  }

  @Roles(UserRole.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string){
    return this.eventsService.remove(id)
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(":id/publish")
  publish(@Param('id') id: string){
    return this.eventsService.publish(id)
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(":id/cancel")
  cancel(@Param("id") id:string){
    return this.eventsService.cancel(id)
  }
}
