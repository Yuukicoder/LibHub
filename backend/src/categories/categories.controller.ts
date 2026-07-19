import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuards)
@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService : CategoriesService
    ){}
    @Post()
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    create(@Body() createCategoryDto: CreateCategoryDto){
        return this.categoriesService.create(createCategoryDto)
    }
    @Get()
    findAll(){
        return this.categoriesService.findAll()
    }
    @Get(':id')
    findOne(@Param('id') id:string){
        return this.categoriesService.findOne(id)
    }
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @Patch(':id')
    update(@Param('id') id:string, @Body() updateCategoryDto: UpdateCategoryDto){
        return this.categoriesService.update(id, updateCategoryDto)
    }
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    delete(@Param('id') id: string){
        return this.categoriesService.remove(id)
    }
}
