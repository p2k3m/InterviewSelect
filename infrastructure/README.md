# Infrastructure Notes

The MVP relies on AWS serverless primitives wired through API Gateway. The `serverless.yml` file documents the logical topology and can be deployed with the Serverless Framework once the Lambda artifacts are built.

## Deployment Workflow
1. Build Lambda bundles:
   ```bash
   npm install
   npm run build --workspace user-service
   npm run build --workspace marketplace-service
   ```
2. Package the user service handlers into zip archives (see `backend/user-service/scripts/package.ts`).
3. Deploy via Serverless:
   ```bash
   npx serverless deploy --stage dev --region us-east-1
   ```

GitHub Actions automates the same steps for the dev environment and runs the test suites before deployment.
