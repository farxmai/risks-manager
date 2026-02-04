import mongoose, { Document, Schema } from "mongoose";

export enum RiskStatus {
  UNRESOLVED = "UNRESOLVED",
  RESOLVED = "RESOLVED",
}

export interface IRisk {
  name: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  status: RiskStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RiskDocument = Document & IRisk;

const RiskSchema = new Schema<RiskDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RiskStatus),
      default: RiskStatus.UNRESOLVED,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and performance
RiskSchema.index({ name: "text", description: "text" });
RiskSchema.index({ categoryId: 1 });
RiskSchema.index({ status: 1 });
RiskSchema.index({ createdAt: -1 });

export const Risk = mongoose.model<RiskDocument>("Risk", RiskSchema);
