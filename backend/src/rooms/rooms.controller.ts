import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RolesGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuards)
@Controller('rooms')
export class RoomsController {
    constructor(
        private readonly roomsService: RoomsService
    ){}

    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Post()
    create(@Body() createRoomDto: CreateRoomDto){
        return this.roomsService.create(createRoomDto)
    }

    @Get()
    findAll(){
        return this.roomsService.findAll()
    }
    @Get(":id")
    findOne(@Param('id') id: string){
        return this.roomsService.findOne(id)
    }

    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Patch(":id")
    update(@Param("id") id: string,@Body() updateRoomDto: UpdateRoomDto){
        return this.roomsService.update(id, updateRoomDto)
    }

    @Roles(UserRole.ADMIN)
    @Delete(":id")
    delete(@Param("id") id: string){
        return this.roomsService.remove(id)
    }
}
