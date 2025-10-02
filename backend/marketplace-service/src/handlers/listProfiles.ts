import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

const MOCK_PROFILES = [
  {
    id: 'freelancer-1',
    name: 'Alex Rivera',
    role: 'Senior Frontend Engineer',
    expertise: ['React', 'TypeScript', 'Design Systems'],
    yearsOfExperience: 7,
  },
  {
    id: 'freelancer-2',
    name: 'Priya Desai',
    role: 'Backend Architect',
    expertise: ['Node.js', 'Microservices', 'AWS'],
    yearsOfExperience: 9,
  },
  {
    id: 'freelancer-3',
    name: 'Martin Fischer',
    role: 'Data Engineer',
    expertise: ['Python', 'Airflow', 'Snowflake'],
    yearsOfExperience: 6,
  },
];

export const handler = async (
  _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => ({
  statusCode: 200,
  body: JSON.stringify({ profiles: MOCK_PROFILES }),
});

export type MarketplaceProfile = (typeof MOCK_PROFILES)[number];
export default MOCK_PROFILES;
