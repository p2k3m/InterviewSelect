# MVP Validation Plan

This document summarizes how to validate the Phase 0 MVP with internal stakeholders and 5–10 beta users.

## Test Accounts
- **Freelancer testers**: Create Cognito users with the `freelancer` type and populate DynamoDB profiles via the registration endpoint.
- **Company testers**: Use the same flow with the `company` type; assign `organizationName` and optional `teamRoles` values.

## Manual Test Script
1. Sign up through the `/users` API using the Postman collection in `docs/assets/api-collection.json` or curl:
   ```bash
   curl -X POST "$API_BASE/users" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "freelancer+demo@example.com",
       "password": "Password123!",
       "type": "freelancer",
       "profile": {
         "name": "Demo Freelancer",
         "bio": "Focus on system design interviews",
         "yearsOfExperience": 6,
         "skills": ["System Design", "Leadership"]
       }
     }'
   ```
2. Confirm the user exists in Cognito and that the profile document is stored in DynamoDB.
3. Load the React SPA (deployed via GitHub Actions). Verify navigation across dashboard, profile, edit, and interviewer list routes.
4. Update the profile through the `/users/{id}` endpoint and ensure changes are reflected in DynamoDB and the SPA mock data (manually update `frontend/src/pages/ProfilePage.tsx` for now).
5. Delete the test user using `/users/{id}?email=...` to exercise the cleanup path.

## Metrics to Capture
- Time to complete registration flow end-to-end.
- Qualitative feedback on the profile edit UX and interviewer discovery list.
- Stability of LocalStack-powered integration tests and deployment automation.

## Next Steps
- Replace mock interviewer data with Marketplace Service DynamoDB queries once search APIs are available.
- Wire the profile edit form to the User Service update endpoint using Cognito-authenticated requests.
- Expand the deployment workflow with preview environments per pull request.
