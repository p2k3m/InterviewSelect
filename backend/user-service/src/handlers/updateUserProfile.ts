import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getDynamoDocumentClient } from '../utils/dynamoClient';
import { applyProfileUpdates } from '../utils/validation';
import type { UpdateUserProfileInput } from '../models';

const USER_TABLE = process.env.USER_TABLE ?? 'interviewselect-users';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
    }

    const payload = JSON.parse(event.body) as UpdateUserProfileInput;
    if (!payload.id) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing profile id' }) };
    }

    if (!payload.profile || Object.keys(payload.profile).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'No profile updates supplied' }) };
    }

    const dynamo = getDynamoDocumentClient();
    const existingProfile = await dynamo.send(
      new GetCommand({
        TableName: USER_TABLE,
        Key: { id: payload.id },
      })
    );

    if (!existingProfile.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Profile not found' }) };
    }

    const updatedProfile = applyProfileUpdates(existingProfile.Item, payload);

    await dynamo.send(
      new PutCommand({
        TableName: USER_TABLE,
        Item: updatedProfile,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ profile: updatedProfile }),
    };
  } catch (error) {
    console.error('Failed to update profile', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
