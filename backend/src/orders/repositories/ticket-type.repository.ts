import { TicketTypesService } from "src/ticket-types/service/ticket-types.service";
import { Injectable } from "@nestjs/common";

export interface ITicketTypeRepository {
    findOne(id: string);
}

@Injectable()
export class TicketTypeRepositoryImpl implements ITicketTypeRepository {
    constructor(private readonly ticketTypeService: TicketTypesService) { }
    async findOne(id: string) {
        return await this.ticketTypeService.findOne(id);
    }
}