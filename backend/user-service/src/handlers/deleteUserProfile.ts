import { AdminDeleteUserCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getDynamoDocumentClient } from '../utils/dynamoClient';

const USER_TABLE = process.env.USER_TABLE ?? 'interviewselect-users';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

function getCognitoClient() {
  return new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
    endpoint: process.env.COGNITO_ENDPOINT,
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
      : undefined,
  });
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const userId = event.pathParameters?.id;
    const email = event.queryStringParameters?.email;

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing user id' }) };
    }

    const dynamo = getDynamoDocumentClient();
    await dynamo.send(
      new DeleteCommand({
        TableName: USER_TABLE,
        Key: { id: userId },
      })
    );

    if (USER_POOL_ID && email) {
      const cognito = getCognitoClient();
      await cognito.send(
        new AdminDeleteUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
        })
      );
    }

    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    console.error('Failed to delete profile', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
