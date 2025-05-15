import swaggerJSDoc from "swagger-jsdoc";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Fitpull Overflow API Docs",
			version: "1.0.0",
			description: "핏풀 오버플로우 MVP API 문서입니다.",
		},
		servers: [
			{
				url: "http://18.234.131.168:3000",
			},
		],
	},
	apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
