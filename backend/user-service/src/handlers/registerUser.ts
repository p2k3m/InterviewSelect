import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { buildProfileFromInput, validateRegisterInput } from '../utils/validation';
import { getDynamoDocumentClient } from '../utils/dynamoClient';
import type { RegisterUserInput } from '../models';

const USER_TABLE = process.env.USER_TABLE ?? 'interviewselect-users';

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

async function signUpUser(input: RegisterUserInput, profileId: string) {
  const client = getCognitoClient();
  const clientId = process.env.COGNITO_APP_CLIENT_ID;

  if (!clientId) {
    throw new Error('COGNITO_APP_CLIENT_ID is not configured');
  }

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: input.email,
    Password: input.password,
    UserAttributes: [
      { Name: 'email', Value: input.email },
      { Name: 'custom:profileId', Value: profileId },
      { Name: 'custom:userType', Value: input.type },
    ],
  });

  await client.send(command);
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
    }

    const parsedInput = JSON.parse(event.body) as RegisterUserInput;
    validateRegisterInput(parsedInput);
    const profile = buildProfileFromInput(parsedInput);

    await signUpUser(parsedInput, profile.id);

    const dynamo = getDynamoDocumentClient();
    await dynamo.send(
      new PutCommand({
        TableName: USER_TABLE,
        Item: profile,
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ profile }),
    };
  } catch (error) {
    console.error('Failed to register user', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
