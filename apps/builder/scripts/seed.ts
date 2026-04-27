import { runSeed } from "../src/lib/server/seed";

runSeed()
  .then(result => {
    console.log(`Seed complete for ${result.resources} resource definition(s).`);
  })
  .catch(error => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  });
