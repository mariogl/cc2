import mongoose from "mongoose";
import environment from "../loadEnvironment.js";

const connectDatabase = async (mongoDbUrl: string) => {
  mongoose.set("strictQuery", false);
  mongoose.set("debug", environment.mongoDb.debug);
  mongoose.set("toJSON", {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return ret;
    },
  });

  await mongoose.connect(mongoDbUrl);
};

export default connectDatabase;
