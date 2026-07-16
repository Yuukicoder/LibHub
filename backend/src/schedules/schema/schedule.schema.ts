import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ScheduleDocument = HydratedDocument<Schedule>
@Schema({
    timestamps: true,
    collection: "schedules"
})
export class Schedule {
    @Prop({
        type: Types.ObjectId, 
        ref: "Event",
        required: true
    }
    )
    eventId!: Types.ObjectId;

    @Prop({
        required: true,
        trim: true,
        maxLength: 150
    })
    title!: string;

    @Prop({
        trim: true, 
        maxLength: 1000, 
        default: null
    })
    description?: string;

    @Prop({
        required: true
    })
    startTime!: Date;

    @Prop({
        required: true
    })
    endTime!: Date;

    @Prop({
        trim: true,
        maxLength: 100,
        default: null 
    })
    speakerName?:string;

    @Prop({
        trim: true,
        maxLength: 100,
        default: null 
    })
    locationNote?: string;

    @Prop({
        default: 0
    })
    order!: number;
}
export const ScheduleSchema = SchemaFactory.createForClass(Schedule)

ScheduleSchema.index({eventId: 1, startTime: 1})
ScheduleSchema.index({eventId: 1, order: 1})