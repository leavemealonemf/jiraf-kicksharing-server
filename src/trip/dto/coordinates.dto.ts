import { ApiProperty } from "@nestjs/swagger";

export class SaveCoordinatesDto {
    @ApiProperty({ default: 12 })
    tripId: number;
    @ApiProperty({ default: [55.753930, 37.620795] })
    latLon: number[];
}