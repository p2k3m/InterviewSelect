export type UserType = 'freelancer' | 'company';

export interface BaseUserProfile {
  id: string;
  email: string;
  type: UserType;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile extends BaseUserProfile {
  type: 'freelancer';
  name: string;
  bio?: string;
  yearsOfExperience?: number;
  skills?: string[];
  avatarUrl?: string;
}

export interface CompanyProfile extends BaseUserProfile {
  type: 'company';
  organizationName: string;
  teamRoles?: string[];
}

export type UserProfile = FreelancerProfile | CompanyProfile;

export interface FreelancerProfileInput {
  name?: string;
  bio?: string;
  yearsOfExperience?: number;
  skills?: string[];
  avatarUrl?: string;
}

export interface CompanyProfileInput {
  organizationName?: string;
  teamRoles?: string[];
}

export type RegisterUserInput =
  | {
      email: string;
      password: string;
      type: 'freelancer';
      profile: FreelancerProfileInput;
    }
  | {
      email: string;
      password: string;
      type: 'company';
      profile: CompanyProfileInput;
    };

export type UpdateUserProfileInput =
  | {
      id: string;
      profile: FreelancerProfileInput;
    }
  | {
      id: string;
      profile: CompanyProfileInput;
    };
