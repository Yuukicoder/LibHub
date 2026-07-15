import { Type } from "class-transformer"
import { IsDate, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator"

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title!: string

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string

    @IsString()
    @IsOptional()
    thumbnail?: string

    @IsMongoId()
    categoryId!: string

    @IsMongoId()
    roomId!: string

    @Type(()=>Date)
    @IsDate()
    startTime!: Date

      @Type(()=>Date)
    @IsDate()
    endTime!: Date

      @Type(()=>Date)
    @IsDate()
    registrationDeadline!: Date

    @Type(() =>Number)
    @IsInt()
    @Min(1)
    capacity!: number
    
}
