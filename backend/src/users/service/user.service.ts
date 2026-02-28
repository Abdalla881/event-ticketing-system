import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findAll() {}

  async findOne(id: string) {}

  async create(createUserData) {}
  async update(id: string, updateUserData) {}
  async delete(id: string) {}
}
