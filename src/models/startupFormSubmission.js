import { model, Schema } from "mongoose";

const startupSubmissionSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  aboutYourStartup: { type: String, required: true },
  whyYou: { type: String, required: true },
  projectPresentation: { type: String, default: null },
});

const StartupFormSubmission = model(
  "StartupFormSubmission",
  startupSubmissionSchema
);

export default StartupFormSubmission;
