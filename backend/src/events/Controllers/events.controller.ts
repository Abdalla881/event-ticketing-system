import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EventsService } from '../service/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  // @desc    Create a new event
  // @route   POST api/v1/events
  // @access  private [organizer]
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // @desc    Get all events
  // @route   GET api/v1/events
  // @access  public
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // @desc    Get a single event by id
  // @route   GET api/v1/events/:id
  // @access  public
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventsService.findOne(id);
  }

  // @desc    Update event status (lifecycle)
  // @route   PATCH api/v1/events/:id/status
  // @access  private [event owner organizer]
  // Note: requestingOrganizerId is passed as query param until JWT guard is wired up
  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateEventStatusDto: UpdateEventStatusDto) {
    return this.eventsService.updateStatus(id, updateEventStatusDto);
  }

  // @desc    Delete an event
  // @route   DELETE api/v1/events/:id
  // @access  private [event owner organizer]
  // Note: requestingOrganizerId is passed as query param until JWT guard is wired up
  @Delete(':id')
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('organizer_id', new ParseUUIDPipe()) requestingOrganizerId: string,
  ) {
    return this.eventsService.delete(id, requestingOrganizerId);
  }
}
