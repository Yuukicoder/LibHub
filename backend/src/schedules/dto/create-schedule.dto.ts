import { Type } from "class-transformer";
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateScheduleDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title!: string;

    @IsOptional()
    @MaxLength(1000)
    @IsString()
    description?: string;

    @Type(() => Date)
    @IsDate()
    startTime!: Date;

    @Type(() => Date)
    @IsDate()
    endTime!: Date;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    speakerName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    locationNote?: string;
    @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(0)
    order!: number;
}
