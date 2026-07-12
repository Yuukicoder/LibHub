import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>, 
    ){}

    async create(createUserDto: CreateUserDto){
       const {fullName, email, password, role} = createUserDto;
        const existedUser = await this.userModel.findOne({email}).exec();
        if(existedUser) {
            throw new ConflictException("Email already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userModel.create({
            fullName,
            email,
            password: hashedPassword, 
            role
        })
        const userObject = user.toObject();
        const {password: _password, ...safeUser} = userObject;
        return safeUser;
    }
    async findByEmail(email: string){
        return this.userModel.findOne({email}).exec();
    }
    async findById(id: string){
        const result = this.userModel.findById(id).select("-password").exec();
        if(!result){
            throw new NotFoundException("User not found")
        }
        return result;
    }
    async findAll(){
        return this.userModel.find().select("-password").sort({createdAt:-1}).exec();
    }
    async findByEmailWithPassword(email: string){
        return this.userModel.findOne({email}).select("+password").exec();
    }
}
