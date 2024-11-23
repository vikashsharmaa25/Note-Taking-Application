import mongoose from "mongoose";

export const connection = async (): Promise<void> => {
  try {
    await mongoose
      .connect(process.env.MONGO_URL as string)
      .then(() => {
        console.log("Successfully connected to the database");
      })
      .catch((err: Error) => {
        console.error("Database connection problem:", err.message);
      });
  } catch (error) {
    console.error("Unexpected error during database connection:", error);
  }
};
