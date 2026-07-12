import { UserRole } from "src/common/enums/user-role.enum";

// Payload là phần data nhúng vào access token
// ko nhét password hoặc thông tin nhạy cảm vào JWT
export interface JwtPayload {
    sub: string, //subject: userId
    email: string,
    role: UserRole
}
