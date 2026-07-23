import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt'
import { UpdateRoomDto } from 'src/rooms/dto/update-room.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

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

 async updateRole(userId: string, role: UserRole) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestException('User ID không hợp lệ');
  }

  const user = await this.userModel.findById(userId);

  if (!user) {
    throw new NotFoundException(
      'Không tìm thấy người dùng',
    );
  }

  // Không cho thay đổi role của Admin.
  if (user.role === UserRole.ADMIN) {
    throw new BadRequestException(
      'Không thể thay đổi role của Admin',
    );
  }

  // Role mới chỉ được là Reader hoặc Staff.
  const allowedRoles: UserRole[] = [
    UserRole.READER,
    UserRole.STAFF,
  ];

  if (!allowedRoles.includes(role)) {
    throw new BadRequestException(
      'Chỉ được chuyển role giữa Reader và Staff',
    );
  }

  // Role hiện tại cũng phải là Reader hoặc Staff.
  if (!allowedRoles.includes(user.role)) {
    throw new BadRequestException(
      'Role hiện tại không được phép thay đổi',
    );
  }

  if (user.role === role) {
    throw new BadRequestException(
      `Người dùng đã có role ${role}`,
    );
  }

  user.role = role;

  await user.save();

  const { password, ...safeUser } = user.toObject();

  return safeUser;
}


   async updateStatus(
    userId: string,
    isActive: boolean,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy người dùng',
      );
    }

    // Không cho khóa tài khoản admin.
    if (
      user.role === UserRole.ADMIN &&
      isActive === false
    ) {
      throw new BadRequestException(
        'Không thể khóa tài khoản Admin',
      );
    }

    user.isActive = isActive;

    await user.save();

    const { password, ...safeUser } = user.toObject();

    return safeUser;
  }
}
