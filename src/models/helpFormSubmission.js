import { model, Schema } from "mongoose";

const helpSubmissionSchema = new Schema({
  tellUsHelp: { type: String, required: true },
  additionalHelpMedia: { type: String, default: null },
});

const HelpFormSubmission = model("HelpFormSubmission", helpSubmissionSchema);

export default HelpFormSubmission;
