import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums/user-role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuards implements CanActivate{
    constructor(private readonly reflector: Reflector){}
    
    canActivate(context: ExecutionContext): boolean {
        //Lấy danh sách role được khai báo bằng @Roles()
        // Có thể khai báo ở class controller hoặc method
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [
                context.getHandler(),
                context.getClass()
            ]
        )

        // Nếu route không khai báo @Roles()
        // THÌ CHO ĐI QUA
        if(!requiredRoles || requiredRoles.length === 0){
            return true;
        }
        const request = context.switchToHttp().getRequest();

        // request.user được gắn từ JWTStrategy.validate()
        const user = request.user;
        if(!user){
            return false;
        }
        // Kiểm tra role của user có nằm trong danh sách role được cho phép ko
        return requiredRoles.includes(user.role)
    }
}
