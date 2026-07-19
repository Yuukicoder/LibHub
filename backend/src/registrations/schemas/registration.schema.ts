import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { RegistrationStatus } from "../enums/registration-status.enum";

export type RegistrationDocument = HydratedDocument<Registration>
@Schema({
    timestamps: true,
    collection: "registrations"
})
export class Registration {
    @Prop({
        type: Types.ObjectId,
        ref: "User", 
        required: true
    })
    userId!: Types.ObjectId

    @Prop({
        type: Types.ObjectId,
        ref: "Event",
        required: true
    })
    eventId!: Types.ObjectId

    @Prop({
        type: String,
        enum: RegistrationStatus,
        default: RegistrationStatus.REGISTERED
    })
    status!: RegistrationStatus;

    @Prop({
        default: Date.now
    })
    registeredAt!: Date;

    @Prop({
        default: null
    })
    cancelledAt?: Date;

    @Prop({
        default: null
    })
    checkedInAt?: Date
}
export const RegistrationSchema = SchemaFactory.createForClass(Registration)

// 1 user chỉ có 1 registration record cho 1 event
// Nếu đã huỷ, thì phải mở lại bằng cách đổi status về registered
RegistrationSchema.index({
    userId: 1,
    eventId: 1
}, {
    unique: true
});
RegistrationSchema.index({
    eventId: 1,
    status: 1
})
RegistrationSchema.index({
    userId:1,
    status: 1
})