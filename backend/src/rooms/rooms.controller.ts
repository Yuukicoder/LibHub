import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateRoomDto } from './dto/update-room.dto';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
    constructor(
        private readonly roomsService: RoomsService
    ){}

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

    @Patch("id")
    update(@Param("id") id: string,@Body() updateRoomDto: UpdateRoomDto){
        return this.roomsService.update(id, updateRoomDto)
    }

    @Delete("id")
    delete(@Param("id") id: string){
        return this.roomsService.remove(id)
    }
}
