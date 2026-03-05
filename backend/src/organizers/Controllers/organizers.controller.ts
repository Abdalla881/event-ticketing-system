import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
@Controller('organizers')
export class OrganizersController {
  // @desc Get all organizers
  // @route GET api/v1/organizers
  // @access public
  @Get()
  findAll() {}

  // @desc Create a new organizer
  // @route POST api/v1/organizers
  // @access private[admin]
  @Post()
  create(@Body() createOrganizerData) {}

  // @desc Get an organizer by id
  // @route GET api/v1/organizers/:id
  // @access public
  @Get('/:id')
  findOne(@Param('id') id: string) {}

  // @desc Update an organizer by id
  // @route PUT api/v1/organizers/:id
  // @access private[admin]
  @Put('/:id')
  update(@Param('id') id: string, @Body() updateOrganizerData) {}

  // @desc Delete an organizer by id
  // @route DELETE api/v1/organizers/:id
  // @access private[admin]
  @Delete('/:id')
  delete(@Param('id') id: string) {}
}
