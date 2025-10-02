# InterviewSelect Architecture Design

## 1. System Overview
InterviewSelect delivers a transparent interviewer marketplace with end-to-end scheduling, execution, and reporting. The platform is built on AWS using a serverless microservices pattern to achieve elasticity, resilience, and rapid iteration.

## 2. High-Level Architecture
- **Client Applications**
  - React (TypeScript) Single-Page Application served from Amazon S3 with CloudFront CDN and AWS WAF protection.
  - Native mobile applications (iOS, Android) planned for future phases, leveraging the same API layer.
- **Identity and Access Management**
  - Amazon Cognito User Pools for authentication (email, Google, LinkedIn) and Identity Pools for temporary AWS credentials.
  - JWT-based authorization with scoped access tokens and fine-grained IAM roles for microservices.
- **API Gateway Layer**
  - REST APIs through Amazon API Gateway for CRUD operations.
  - WebSocket API Gateway for interview session signaling and presence.
  - Request validation, throttling, and usage plans per client type.
- **Microservices (AWS Lambda + Node.js 20)**
  - **User Service**: Manages profiles, credentials, verification workflows, and S3 asset uploads.
  - **Marketplace Service**: Synchronizes DynamoDB changes into OpenSearch (Elasticsearch-compatible) for search; invokes Amazon SageMaker endpoints for AI recommendations.
  - **Booking Service**: Handles availability lookups, calendar sync, payment orchestration with Stripe, and conflict detection via DynamoDB transactions.
  - **Interview Service**: Coordinates AWS Chime SDK sessions, manages participant state, and triggers recording pipelines.
  - **Reporting Service**: Consumes events from queues to generate transcripts (AWS Transcribe), AI summaries (Amazon Bedrock), and PDF scorecards (Puppeteer on Lambda).
  - **Analytics Service**: Streams booking and interview telemetry to Amazon Kinesis, persists to S3 data lake, and exposes dashboards via Athena/QuickSight.
- **Data Stores**
  - Amazon DynamoDB for operational data (users, bookings, transactions).
  - Amazon S3 for recordings, reports, certification uploads, and static web assets.
  - Amazon OpenSearch Service for marketplace search indexes.
  - AWS Secrets Manager for API keys, Stripe credentials, and OAuth secrets.
  - Amazon ElastiCache (Redis) for caching availability, recommendation results, and rate limiting state.
- **Eventing and Workflow Orchestration**
  - Amazon EventBridge for domain events (profile updated, booking confirmed).
  - Amazon SQS for decoupled processing in reporting and payout flows.
  - AWS Step Functions for long-running workflows (e.g., post-interview report pipeline).

## 3. Component Interactions
1. **Authentication**
   - User signs in via Cognito → receives JWT → SPA stores tokens securely.
   - Cognito triggers (Lambda) enforce custom password policies, verification emails, and admin approval flows.
2. **Profile Lifecycle**
   - SPA calls User Service through API Gateway → Lambda writes to DynamoDB.
   - DynamoDB Streams push profile updates to a Lambda that indexes data into OpenSearch.
3. **Search and Recommendations**
   - Company queries marketplace → API Gateway → Marketplace Service → OpenSearch.
   - Recommendation endpoint fetches hiring context from DynamoDB/S3, invokes SageMaker model, caches responses in Redis.
4. **Booking Flow**
   - Booking Service validates slot availability, triggers Stripe Payment Intent, and writes booking record with idempotency keys.
   - Successful booking emits EventBridge event → notifies interviewer and company via SES/SNS.
   - Calendar integration occurs via Google Calendar API with circuit breaker wrapper (Polly.js) to protect against external outages.
5. **Interview Execution**
   - Participants join via WebSocket API; Interview Service stores connection metadata in DynamoDB.
   - Chime meeting resources created on demand; video/audio flows directly via Chime media services.
   - Session events (join, leave, recording start) streamed to EventBridge for real-time dashboards.
6. **Reporting Pipeline**
   - When session ends, Interview Service emits `session.completed` event.
   - Step Functions orchestrates transcript generation (Transcribe), AI summary (Bedrock), PDF generation, and storage in S3.
   - Signed URLs generated via pre-signed S3 URLs; notifications sent through SES.
7. **Payments and Payouts**
   - Stripe webhooks received via dedicated Lambda; verifies signature and updates booking status.
   - Payout scheduler runs as EventBridge rule triggering Lambda to initiate Stripe transfers after admin approval window.

## 4. Security Architecture
- **Authentication/Authorization**: Cognito JWTs verified at API Gateway; Lambda authorizers enforce role scopes.
- **Data Protection**: All data encrypted at rest (DynamoDB, S3, OpenSearch) and in transit (TLS). KMS CMKs manage encryption keys.
- **Network Security**: API Gateway fronted by AWS WAF, CloudFront geo-restrictions, and AWS Shield for DDoS mitigation.
- **Secrets Management**: Credentials stored in Secrets Manager with rotation Lambda functions (e.g., Stripe, OAuth clients).
- **Compliance Controls**: Audit logs written to CloudWatch Logs and centralized in AWS CloudTrail; access reviewed regularly.

## 5. Reliability and Observability
- **High Availability**: Multi-AZ deployments for DynamoDB, OpenSearch, and failover strategies via Route 53 health checks.
- **Resilience Patterns**: Circuit breakers, retries with exponential backoff, and dead-letter queues protect against cascading failures.
- **Monitoring**: CloudWatch dashboards for latency, error rate, booking volume; alarms integrate with PagerDuty/Slack.
- **Tracing**: AWS X-Ray enabled on all Lambdas; correlation IDs propagate via API Gateway custom headers.
- **Logging**: Structured JSON logging with Winston; logs shipped to centralized storage (e.g., OpenSearch or Datadog) for analytics.

## 6. Data Management
- **Data Modeling**: DynamoDB single-table design with partition keys by user/booking; GSIs for queries (e.g., by interviewer, company, status).
- **Data Retention**: Video recordings stored for 90 days by default; retention extensions tracked per booking.
- **Backup and Recovery**: DynamoDB Point-In-Time Recovery enabled; S3 versioning for critical buckets; periodic export to Glacier for long-term archival.
- **Privacy Controls**: Pseudonymize data in analytics streams; provide data deletion and export tooling per GDPR.

## 7. Scalability Considerations
- Lambda provisioned concurrency for hot paths (booking, search) to minimize cold starts.
- API Gateway throttling and usage plans to prevent abuse; auto-scaling search clusters based on CPU and query metrics.
- Use AWS Global Accelerator or CloudFront Functions to reduce latency for international users.

## 8. Future Architecture Extensions
- Introduce GraphQL API via AWS AppSync for richer client queries.
- Add real-time analytics dashboards with Amazon Managed Service for Prometheus + Grafana.
- Explore multi-region active-active deployments with DynamoDB Global Tables and Route 53 latency-based routing.
- Extend analytics pipeline with machine learning feature store for interviewer performance scoring.

