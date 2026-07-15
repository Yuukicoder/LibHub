import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { RoomStatus } from "../enums/room-status.enum";

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    capacity!: number;

    @IsString()
     @IsOptional()
    @MaxLength(100)
    floor?: string;

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(20)
    @IsString({each: true})
    equipment?:string[];

    @IsString()
     @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsOptional()
     @IsEnum(RoomStatus)
    status?:RoomStatus
}
