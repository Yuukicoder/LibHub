import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UserRole } from "src/common/enums/user-role.enum";

export type UserDocument = HydratedDocument<User>;
@Schema({
    timestamps: true
})
export class User {
    @Prop({
        required: true,
        trim: true, 
        maxLength: 100
    })
    fullName!: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    })
    email!: string;

    @Prop({
        required: true,
        select: false // khi query user sẽ k trả về password
    })
    password!: string;

    @Prop({
       type: String,
       enum: UserRole,
        default: UserRole.READER
    })
    role!: UserRole

    @Prop({
        default: true
    })
    isActive!: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({email: 1});