import { Module } from "@nestjs/common";
import { PersonsController } from "./persons.controller";

@Module({
	controllers: [PersonsController]
})
export class PersonsModule {}
