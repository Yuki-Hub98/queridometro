import { appDataSource } from "./appDataSource";
import { User } from "../entities/User";

export async function seedUsers() {
  const userRepository = appDataSource.getRepository(User);

  const users = [
    { name: "Yuki", phone: "5592992856498", estalecas: 40, aniversario: "28/07"},
    { name: "Symon", phone: "5592981970100", estalecas: 40, aniversario: "09/03"},
    { name: "Manu", phone: "0000000000000", estalecas: 40, aniversario: "06/05"}

  ];

  for (const userData of users) {
    const exists = await userRepository.findOne({
      where: { phone: userData.phone },
    });

    if (!exists) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✅Usuário ${user.name} criado`);
    }
  }
}
