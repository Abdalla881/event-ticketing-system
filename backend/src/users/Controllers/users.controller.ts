import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from '../service/user.service';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @desc Get all users
  // @route GET api/v1/users
  // @access private[admin]
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // @desc Create a new user
  // @route POST api/v1/users
  // @access private[admin]
  @Post()
  create(@Body() createUserData) {
    return this.usersService.create(createUserData);
  }

  // @desc Get a user by id
  // @route GET api/v1/users/:id
  // @access public
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // @desc Update a user by id
  // @route PUT api/v1/users/:id
  // @access private[admin]
  @Put('/:id')
  update(@Param('id') id: string, @Body() updateUserData) {
    return this.usersService.update(id, updateUserData);
  }

  // @desc Delete a user by id
  // @route DELETE api/v1/users/:id
  // @access private[admin]
  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
