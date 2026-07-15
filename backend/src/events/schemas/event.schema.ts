import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { EventStatus } from "../enums/event-status.enum";

export type EventDocument = HydratedDocument<Event>
@Schema({
    timestamps: true,
    collection: "events"
})
export class Event {
    @Prop({
        required: true,
        trim: true,
        maxLength: 150
    }
    )
    title!: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true, 
        trim: true
    })
    slug!: string;

    @Prop({
        trim: true,
        maxLength: 2000,
        default: null
    })
    description?: string;

    @Prop({
        trim: true,
        default: null
    })
    thumbnail?:string;

    @Prop({
        type: Types.ObjectId,
        ref: "Category",
        required: true
    })
    categoryId!: Types.ObjectId;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: "Room"
    })
    roomId!: Types.ObjectId;

    @Prop({
        required: true,
    })
    startTime!: Date;

    @Prop({
        required: true
    })
    endTime!: Date;

    @Prop({
        required: true
    })
    registrationDeadline!: Date;
    
    @Prop({
        required: true,
        min: 1
    })
    capacity!: number;

    @Prop({
        type: String,
        enum: EventStatus,
        default: EventStatus.DRAFT
    })
    status!: EventStatus;

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true
    })
    createdBy!: Types.ObjectId;
}
export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({slug: 1}, {unique: true});
EventSchema.index({startTime: 1});
EventSchema.index({status: 1});
EventSchema.index({categoryId: 1});
EventSchema.index({roomId: 1});
EventSchema.index({title: 'text', description: 'text'});
