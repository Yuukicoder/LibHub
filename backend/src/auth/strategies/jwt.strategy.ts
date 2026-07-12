import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ){
        super(
            {
                // lấy token từ header:
                // Authorization: Bearer <Token>
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                // Không cho token hết hạn đi qua
                ignoreExpiration: false,
                // Secret dùng để verify token
                secretOrKey: configService.getOrThrow<string>(
                    'JWT_ACCESS_SECRET'
                )
            }
        )
    }
    async validate(payload: JwtPayload){
        // Hàm validate sẽ chạy sau khi token hợp lệ
        // Kiểm tra user còn tồn tại và hợp lệ không
        const user = await this.usersService.findById(payload.sub);
        if(!user || !user.isActive) {
            throw new UnauthorizedException("Invalid token");
        }
        return {
            id: user.id.toString(),
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    }
}
