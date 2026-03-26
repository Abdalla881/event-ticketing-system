import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TicketTypesService } from '../service/ticket-types.service';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';

@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  // @desc    Create a new ticket type
  // @route   POST api/v1/ticket-types
  // @access  private [organizer]
  @Post()
  create(@Body() createTicketTypeDto: CreateTicketTypeDto) {
    return this.ticketTypesService.create(createTicketTypeDto);
  }

  // @desc    Get all ticket types for a specific event
  // @route   GET api/v1/ticket-types/event/:eventId
  // @access  public
  @Get('event/:eventId')
  findAllByEvent(@Param('eventId', new ParseUUIDPipe()) eventId: string) {
    return this.ticketTypesService.findAllByEvent(eventId);
  }

  // @desc    Get a single ticket type by id
  // @route   GET api/v1/ticket-types/:id
  // @access  public
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ticketTypesService.findOne(id);
  }

  // @desc    Update a ticket type
  // @route   PATCH api/v1/ticket-types/:id
  // @access  private [organizer]
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
  ) {
    return this.ticketTypesService.update(id, updateTicketTypeDto);
  }

  // @desc    Delete a ticket type
  // @route   DELETE api/v1/ticket-types/:id
  // @access  private [organizer]
  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ticketTypesService.delete(id);
  }
}
