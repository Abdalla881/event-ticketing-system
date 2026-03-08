import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { OrganizersService } from '../service/organizers.service';
import { CreateOrganizerDto } from '../dto/create-organizer.dto';
import { UpdateOrganizerDto } from '../dto/update-organizer.dto';
@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  // @desc Get all organizers
  // @route GET api/v1/organizers
  // @access public
  @Get()
  findAll() {
    return this.organizersService.findAll();
  }

  // @desc Create a new organizer
  // @route POST api/v1/organizers
  // @access private[admin]
  @Post()
  create(@Body() createOrganizerData: CreateOrganizerDto) {
    return this.organizersService.create(createOrganizerData);
  }

  // @desc Get an organizer by id
  // @route GET api/v1/organizers/:id
  // @access public
  @Get('/:id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizersService.findOne(id);
  }

  // @desc Update an organizer by id
  // @route PUT api/v1/organizers/:id
  // @access private[admin]
  @Put('/:id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateOrganizerData: UpdateOrganizerDto,
  ) {
    return this.organizersService.update(id, updateOrganizerData);
  }

  // @desc Delete an organizer by id
  // @route DELETE api/v1/organizers/:id
  // @access private[admin]
  @Delete('/:id')
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizersService.delete(id);
  }
}
