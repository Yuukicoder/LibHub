import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import slugify from 'slugify'
import { RoomStatus } from './enums/room-status.enum';
import { UpdateRoomDto } from './dto/update-room.dto';
@Injectable()
export class RoomsService {
    constructor(
        @InjectModel(Room.name)
        private readonly roomModel: Model<RoomDocument>
    ){}

      private generateRoomCode(name: string){
            return slugify(name, {
                lower: true,
                strict: true,
                locale: "vi",
                trim: true
            })
        }
    async create(createRoomDto: CreateRoomDto){
        const {name, capacity, floor, equipment, description, status} = createRoomDto;
        const code = this.generateRoomCode(name);
        const existedRoom = await this.roomModel.findOne({code}).exec();
        if(existedRoom) {
            throw new ConflictException("Room already exists")
        }
        const room = await this.roomModel.create({
            name, 
            code,
            capacity,
            floor,
            equipment: equipment??[],
            description, 
            status: status?? RoomStatus.AVAILABLE
        })
        return room;
    }

    async findAll(){
        return this.roomModel.find().sort({createdAt: -1}).exec();
    }

    async findOne(id: string){
        const room = await this.roomModel.findById(id).exec();
        if(!room){
            throw new NotFoundException("Room Not Found")
        }
        return room;
    }
    
    async update(id: string, updateRoomDto: UpdateRoomDto){
        const room = await this.roomModel.findById(id).exec();
        if(!room){
            throw new NotFoundException("Room Not Found")
        }
        if(updateRoomDto.name){
            const newCode = this.generateRoomCode(updateRoomDto.name);

            const existedRoom = await this.roomModel.findOne({code: newCode}).exec();
            if(!existedRoom){
                throw new ConflictException("Room already exists")
            }
            room.name = updateRoomDto.name;
            room.code = newCode;
        }

        if(updateRoomDto.capacity !== undefined){
           if(updateRoomDto.capacity<1){
            throw new BadRequestException("Room capacity must be greater than 0")
           }
           room.capacity = updateRoomDto.capacity;
        }
        if(updateRoomDto.floor !== undefined){
            room.floor = updateRoomDto.floor
        }
        if(updateRoomDto.equipment !== undefined){
            room.equipment = updateRoomDto.equipment
        }
        if(updateRoomDto.description !== undefined){
            room.description = updateRoomDto.description
        }
        if(updateRoomDto.status !== undefined){
            room.status = updateRoomDto.status;
        }
        await room.save();
        return room;

    }

    async remove(id: string){
        const room = await this.roomModel.findByIdAndDelete(id).exec();
        if(!room){
            throw new NotFoundException("Room Not Found")
        }
        return {
            message: "Delete room successfully",
            room
        }
    }

}
