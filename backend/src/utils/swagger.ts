import { resolve } from "path";
import { config } from "dotenv";

config();

const url = process.env.BASE_URL;
export const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Circle API",
      description: "API for social media app",
      version: "1.0.0",
    },
    servers: [
      {
        url,
        description: "Local Server",
      },
    ],
  },
  apis: [resolve(process.cwd(), "src/routes/*.ts")],
};
