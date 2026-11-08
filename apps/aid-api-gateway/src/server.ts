import express, { Request, Response } from "express";
import { evaluateAidEligibility, HouseholdProfile } from "@civic/eligibility-engine";
import { generateApplicationPacket } from "@civic/form-autofiller";

const app = express();
app.use(express.json());

app.post("/api/aid/evaluate", (req: Request, res: Response) => {
  const profile = req.body as HouseholdProfile;

  const evaluationResults = evaluateAidEligibility(profile);
  const applicationPacket = generateApplicationPacket(profile, evaluationResults);

  res.status(200).json({
    profile,
    evaluationResults,
    applicationPacket
  });
});

const PORT = Number(process.env.PORT) || 4300;
app.listen(PORT, () => {
  console.log(`Civic Aid Pipeline Gateway running on port ${PORT}`);
});
