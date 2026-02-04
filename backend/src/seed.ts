import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./db";
import { Category } from "./models/Category";
import { Risk, RiskStatus } from "./models/Risk";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/risks-manager";

const categoryDescriptions = [
  "Risks related to financial aspects of the project or organization",
  "Risks associated with technical implementation and infrastructure",
  "Risks related to project timeline and scheduling",
  "Risks involving team members and human resources",
  "Risks related to compliance and regulatory requirements",
  "Risks involving external vendors and third-party services",
  "Risks related to market conditions and competition",
  "Risks involving operational processes and procedures",
  "Risks related to security and data protection",
  "Risks involving stakeholder management and communication",
];

const riskTemplates = [
  {
    name: "Budget Overrun",
    desc: "Project may exceed allocated budget due to unforeseen expenses",
  },
  {
    name: "Resource Shortage",
    desc: "Insufficient skilled personnel available for critical tasks",
  },
  {
    name: "Technical Debt",
    desc: "Accumulated technical debt may slow down development",
  },
  {
    name: "Scope Creep",
    desc: "Project scope expanding beyond original requirements",
  },
  {
    name: "Vendor Dependency",
    desc: "Heavy reliance on single vendor creates risk",
  },
  {
    name: "Data Breach",
    desc: "Potential security vulnerability in data storage",
  },
  {
    name: "Performance Issues",
    desc: "System may not meet performance requirements under load",
  },
  {
    name: "Regulatory Changes",
    desc: "New regulations may require significant changes",
  },
  {
    name: "Market Competition",
    desc: "Competitors launching similar products",
  },
  {
    name: "Technology Obsolescence",
    desc: "Core technology becoming outdated",
  },
  {
    name: "Integration Complexity",
    desc: "Integration with legacy systems more complex than expected",
  },
  {
    name: "Stakeholder Misalignment",
    desc: "Key stakeholders have conflicting priorities",
  },
  {
    name: "Quality Assurance Gap",
    desc: "Testing coverage may be insufficient",
  },
  {
    name: "Communication Breakdown",
    desc: "Poor communication between teams causing delays",
  },
  {
    name: "Dependency Delay",
    desc: "External dependencies not meeting deadlines",
  },
];

const users = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Henry",
];

async function seed(): Promise<void> {
  try {
    console.log("🌱 Starting seed process...");

    await connectDB(MONGODB_URI);

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Risk.deleteMany({});
    await Category.deleteMany({});

    // Create 20 categories
    console.log("📁 Creating categories...");
    const categories = await Category.create(
      Array.from({ length: 20 }, (_, i) => ({
        name: `Category ${i + 1}`,
        description: categoryDescriptions[i % categoryDescriptions.length],
        createdBy: users[i % users.length],
      }))
    );

    console.log(`✅ Created ${categories.length} categories`);

    // Create 1000 risks
    console.log("⚠️  Creating risks...");
    const risks = [];

    for (let i = 0; i < 1000; i++) {
      const template = riskTemplates[i % riskTemplates.length];
      const category = categories[i % categories.length];
      const status =
        Math.random() > 0.3 ? RiskStatus.UNRESOLVED : RiskStatus.RESOLVED;

      risks.push({
        name: `${template.name} ${Math.floor(i / riskTemplates.length) + 1}`,
        description: `${template.desc} - Instance ${i + 1}`,
        categoryId: category._id,
        status,
        createdBy: users[i % users.length],
      });
    }

    await Risk.insertMany(risks);
    console.log(`✅ Created ${risks.length} risks`);

    console.log("🎉 Seed completed successfully!");
    console.log("\nStatistics:");
    console.log(`- Total Categories: ${categories.length}`);
    console.log(`- Total Risks: ${risks.length}`);
    console.log(
      `- Resolved Risks: ${
        risks.filter((r) => r.status === RiskStatus.RESOLVED).length
      }`
    );
    console.log(
      `- Unresolved Risks: ${
        risks.filter((r) => r.status === RiskStatus.UNRESOLVED).length
      }`
    );
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  }
}

seed();
