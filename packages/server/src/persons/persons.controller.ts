import {
	Controller,
	HttpException,
	HttpStatus,
	Post,
	UploadedFile,
	UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import * as path from "path";

interface IPersonResponse {
	BMI: string[];
	BMICategory: string[];
	HealthRisk: string[];
	NoOfOverweightPersons: number;
}

const BmiCategoryAndHealthRisk = [
	"Underweight::Malnutrition",
	"Normal weight::Low",
	"Overweight::Enhanced",
	"Moderately obese::Medium",
	"Severely obese::High",
	"Very severely obese::Very high"
];

@Controller("persons")
export class PersonsController {
	private readJSONFile(file: Express.Multer.File): Record<string, any> {
		let data = {};
		try {
			const fileToParse =
				file?.path ||
				path.resolve(__dirname, "..", "..", "./data.json");
			data = JSON.parse(fs.readFileSync(fileToParse, "utf8"));
		} catch (error) {
			return { message: "File not found or file contains error", error };
		}

		return data;
	}

	private calculateCategories(bmi: number): number {
		if (bmi < 18.5) return 0;
		if (bmi >= 18.5 && bmi < 25) return 1;
		if (bmi >= 25 && bmi < 30) return 2;
		if (bmi >= 30 && bmi < 35) return 3;
		if (bmi >= 35 && bmi < 40) return 4;
		return 5;
	}

	@Post("upload")
	@UseInterceptors(
		FileInterceptor("person", {
			fileFilter: (req: any, file: any, cb: any) => {
				// Handling Default Case
				if (!file) cb(null, true);

				if (file.mimetype.match(/\/(json)$/)) {
					// Only JSON files allowed
					cb(null, true);
				} else {
					// Rejecting all other files
					cb(
						new HttpException(
							`Unsupported file type ${path.extname(
								file.originalname
							)}`,
							HttpStatus.BAD_REQUEST
						),
						false
					);
				}
			},
			dest: "./uploads"
		})
	)
	upload(@UploadedFile() file?: Express.Multer.File): Record<string, any> {
		const data = this.readJSONFile(file);

		if (data.error) return data;

		let noOfOverweightPersons = 0;

		const response: IPersonResponse = {
			BMI: [],
			BMICategory: [],
			HealthRisk: [],
			NoOfOverweightPersons: 0
		};

		if (data instanceof Array) {
			data.forEach((person) => {
				let bmi = 0,
					risk = ["", ""];
				if (person?.HeightCm && person.WeightKg) {
					bmi = person.WeightKg / Math.pow(person?.HeightCm / 100, 2);
					const category = this.calculateCategories(bmi);

					if (category == 2) noOfOverweightPersons++;

					risk = BmiCategoryAndHealthRisk[category].split("::");
				}

				response.BMI = [...response.BMI, `${bmi.toFixed(1)}kg/m2`];
				response.BMICategory = [...response.BMICategory, risk[0]];
				response.HealthRisk = [...response.HealthRisk, risk[1]];
			});
		}

		response.NoOfOverweightPersons = noOfOverweightPersons;

		return response;
	}
}
