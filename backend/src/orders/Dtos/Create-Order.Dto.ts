import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

class CreateOrderItemDto {
    @IsNotEmpty()
    @IsString()
    ticketTypeId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

}

export class CreateOrderDto {

    @IsNotEmpty()
    @IsArray()
    items: CreateOrderItemDto[];
}