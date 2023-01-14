import { Schema, model } from "mongoose";
import type { ChallengeStructure } from "../../types";

const challengeSchema = new Schema<ChallengeStructure>({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
});

const Challenge = model("Challenge", challengeSchema, "challenges");

export default Challenge;
