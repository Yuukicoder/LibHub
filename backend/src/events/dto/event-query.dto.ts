import { Type } from "class-transformer";
import { EventStatus } from "../enums/event-status.enum";
import { IsEnum, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from "class-validator";

export enum SortOrder{
    ASC = "asc",
    DESC = "desc"
}
export class EventQueryDto {

    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsEnum(EventStatus)
    status?: EventStatus;

    @IsOptional()
    @IsMongoId()
    categoryId?: string;

    @IsOptional()
    @IsMongoId()
    roomId?: string;

    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsEnum(SortOrder)
    sort?: SortOrder = SortOrder.ASC;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;
    
      @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;
}
