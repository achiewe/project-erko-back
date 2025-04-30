import { Schema, model } from "mongoose";

const formSubmissionSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    telegram: { type: String, required: false },
    instagram: { type: String, required: false },
    about: { type: String, required: false },
    resonate: { type: String, required: false },
    privacy: { type: Boolean, required: true },
    additionalMedia: { type: String, required: false }, // File URL
    resume: { type: String, required: false }, // File URL
    type: { type: String, required: true },
  },
  { timestamps: true }
);

const FormSubmission = model("FormSubmission", formSubmissionSchema);

export default FormSubmission;
