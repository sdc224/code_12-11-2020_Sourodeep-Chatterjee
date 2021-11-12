import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { PersonsModule } from "./../src/persons/persons.module";

describe("PersonsController (e2e)", () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [PersonsModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it("/persons/upload (POST)", () => {
		return request(app.getHttpServer()).post("/persons/upload").expect(201);
	});
});
