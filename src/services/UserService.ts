import { appDataSource } from "../database/appDataSource";
import { User } from "../entities/User";

export class UserService {
  private userRepository = appDataSource.getRepository(User);

  async getUserByName(name: string){
    const user = await  this.userRepository.findOneBy({name : name})

    return user?.id
  }
}
