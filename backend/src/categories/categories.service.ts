import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import slugify from 'slugify'
import { UpdateCategoryDto } from './dto/update-category.dto';
@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name)
        private readonly categoryModel: Model<CategoryDocument>
    ){} 
    private generateSlug(name: string){
        return slugify(name, {
            lower: true,
            strict: true,
            locale: "vi",
            trim: true
        })
    }
    async create(createCategoryDto: CreateCategoryDto){
        const {name, description, isActive} = createCategoryDto;
        const slug = this.generateSlug(name);
        const existedCategory = await this.categoryModel.findOne({slug}).exec();
        if(existedCategory) throw new ConflictException("Category is already existed")
        const category = await this.categoryModel.create({
            name, 
            slug,
            description,
            isActive
        })
        return category
    }
    async findAll(){
        return this.categoryModel.find().sort({createdAt: -1}).exec();
    }
    async findOne(id: string){
        const category = await this.categoryModel.findById(id).exec();
        if(!category) 
        {
            throw new NotFoundException("Category not found")
        }
        return category
    }
    async update(id: string, updateCategoryDto: UpdateCategoryDto){
        const category = await this.categoryModel.findById(id).exec();
        if(!category) {
            throw new NotFoundException("Category not found")
        }
        if(updateCategoryDto.name){
            const newSlug = this.generateSlug(updateCategoryDto.name)
            const existedCategory = await this.categoryModel.findOne({slug: newSlug, _id: {$ne: id}}).exec();
            if(existedCategory) {
                throw new ConflictException("Category already existed")
            }
            category.slug = newSlug;
            category.name = updateCategoryDto.name
        }
        if(updateCategoryDto.description !== undefined){
            category.description = updateCategoryDto.description;
        }
        if(updateCategoryDto.isActive !== undefined){
            category.isActive = updateCategoryDto.isActive
        }
        await category.save();
        return category;
        
    }
    async remove(id: string){
        const category = await this.categoryModel.findByIdAndDelete(id).exec();
        if(!category) {
            throw new NotFoundException("Category not found")
        }
        return {
            message: "Delete category successfully",
            category
        }
    }

}
