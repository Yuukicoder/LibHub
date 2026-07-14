import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { RoomStatus } from "../enums/room-status.enum";
import { HydratedDocument } from "mongoose";

export type RoomDocument = HydratedDocument<Room>
@Schema({
    timestamps: true,
    collection: "rooms"
})
export class Room {
    @Prop(
        {
            required: true,
            trim: true,
            maxLength: 100
        }
    )
    name!:string;

    @Prop({
        required: true,
        unique: true, 
        lowercase: true, 
        trim: true
    })
    code!: string;

    @Prop({
        required: true, 
        min: 1
    })
    capacity!: number;

    @Prop({
        trim: true, 
        maxLength: 100,
        default: null
    })
    floor?: string;

    @Prop({
        type: [String],
        default: []
    })
    equipment!: string[];

    @Prop({
        trim: true,
        maxLength: 500,
        default: null
    })
    description?: string;

    @Prop({
        type: String, 
        enum: RoomStatus,
        default: RoomStatus.AVAILABLE
    })
    status!: RoomStatus;
}
export const RoomSchema = SchemaFactory.createForClass(Room);
RoomSchema.index({code: 1}, {unique: true});
RoomSchema.index({status: 1});