import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
export type CategoryDocument = HydratedDocument<Category>
@Schema({
    timestamps: true,
    collection: "categories"
})
export class Category {
    @Prop(
        {
            required: true,
            trim: true, 
            maxLength: 100
        }
    )
    name!: string;
    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    })
    slug!: string;
    @Prop(
        {
            trim: true, 
            maxLength: 500,
            default: null
        }
    )
    description?:string;
    @Prop({
        default: true
    })
    isActive!: boolean;

}
export const CategorySchema = SchemaFactory.createForClass(Category);
// Tìm category theo slug nhanh hơn
CategorySchema.index({slug: 1}, {unique: true})