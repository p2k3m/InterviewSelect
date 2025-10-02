import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let documentClient: DynamoDBDocumentClient | null = null;

export function getDynamoDocumentClient(): DynamoDBDocumentClient {
  if (!documentClient) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }
        : undefined,
    });
    documentClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return documentClient;
}

export function resetDocumentClient() {
  documentClient = null;
}
