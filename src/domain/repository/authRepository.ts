import { User } from "../entity/user"

export interface AuthRepository {
    login(email: string, password: string): Promise<Object>
    forgotPassword(email: string): Promise<string>
}