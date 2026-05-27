import serverless from "serverless-http";
import { app } from "../../server";

// Express serverless wrapper for Netlify deployment
export const handler = serverless(app);
