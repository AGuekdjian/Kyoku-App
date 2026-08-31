import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
const { Schema, model, models } = mongoose;
const schema = new Schema(
  {
    key: { type: String, default: "dojo", unique: true },
    dojoName: { type: String, default: "Kyoku" },
    weightStaleDays: { type: Number, default: 90, min: 1, max: 730 },
    logoStorageKey: String,
  },
  { timestamps: true },
);
export type SettingsRecord = InferSchemaType<typeof schema>;
export const Settings =
  (models.Settings as Model<SettingsRecord> | undefined) ??
  model<SettingsRecord>("Settings", schema);
