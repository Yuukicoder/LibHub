import { SetMetadata } from "@nestjs/common"
import { UserRole } from "../enums/user-role.enum"

// Key dùng để lưu metadata role trên controller hoặc route handler
export const ROLES_KEY = 'roles'
// Decorator này dùng để khai báo route cần role nào
// Ví dụ:
// @Roles(UserRole.ADMIN)
// @Roles(UserRole.ADMIN, UserRole.STAFF)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
