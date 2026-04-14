import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "generate AI Pulse daily brief",
  { hourUTC: 2, minuteUTC: 30 },  // 8:00 AM IST
  internal.aiPulse.generateDailyBrief,
  {}
);

export default crons;
