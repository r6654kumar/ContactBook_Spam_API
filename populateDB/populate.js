import { User, Contact } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const populateDatabase = async () => {
  for (let i = 0; i < 10; i++) {
    const user = await User.create({
      name: faker.name.fullName(),
      phone_number: faker.phone.number(),
      password: await bcrypt.hash('password', 8),
      email: faker.internet.email(),
    });

    for (let j = 0; j < 5; j++) {
      await Contact.create({
        name: faker.name.fullName(),
        phone_number: faker.phone.number(),
        userId: user.id
      });
    }
  }
};

populateDatabase();
