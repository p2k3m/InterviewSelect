import { randomUUID } from 'crypto';
import {
  CompanyProfile,
  CompanyProfileInput,
  FreelancerProfile,
  FreelancerProfileInput,
  RegisterUserInput,
  UpdateUserProfileInput,
  UserProfile,
  UserType,
} from '../models';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUserType(type: string): asserts type is UserType {
  if (type !== 'freelancer' && type !== 'company') {
    throw new Error('Invalid user type. Supported types: freelancer, company');
  }
}

function assertFreelancerProfileInput(profile: FreelancerProfileInput): asserts profile is FreelancerProfileInput {
  if (!profile.name) {
    throw new Error('Freelancer profile requires a name');
  }
  if (
    typeof profile.yearsOfExperience !== 'undefined' &&
    (typeof profile.yearsOfExperience !== 'number' || profile.yearsOfExperience < 0)
  ) {
    throw new Error('Years of experience must be a positive number');
  }
}

function assertCompanyProfileInput(profile: CompanyProfileInput): asserts profile is CompanyProfileInput {
  if (!profile.organizationName) {
    throw new Error('Company profile requires an organizationName');
  }
}

export function validateRegisterInput(input: RegisterUserInput): RegisterUserInput {
  if (!EMAIL_REGEX.test(input.email)) {
    throw new Error('Invalid email address');
  }
  if (!input.password || input.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  validateUserType(input.type);

  if (input.type === 'freelancer') {
    assertFreelancerProfileInput(input.profile);
  } else {
    assertCompanyProfileInput(input.profile);
  }

  return input;
}

export function buildProfileFromInput(input: RegisterUserInput, now = new Date()): UserProfile {
  const isoNow = now.toISOString();
  const baseProfile = {
    id: randomUUID(),
    email: input.email,
    type: input.type,
    createdAt: isoNow,
    updatedAt: isoNow,
  } as const;

  if (input.type === 'freelancer') {
    const profile: FreelancerProfile = {
      ...baseProfile,
      type: 'freelancer',
      name: input.profile.name!,
      bio: input.profile.bio,
      yearsOfExperience: input.profile.yearsOfExperience,
      skills: input.profile.skills ?? [],
      avatarUrl: input.profile.avatarUrl,
    };
    return profile;
  }

  const profile: CompanyProfile = {
    ...baseProfile,
    type: 'company',
    organizationName: input.profile.organizationName!,
    teamRoles: input.profile.teamRoles ?? [],
  };
  return profile;
}

export function applyProfileUpdates(current: UserProfile, input: UpdateUserProfileInput, now = new Date()): UserProfile {
  const isoNow = now.toISOString();
  if (current.type === 'freelancer') {
    const payload = input.profile as FreelancerProfileInput;
    return {
      ...current,
      name: payload.name ?? current.name,
      bio: payload.bio ?? current.bio,
      yearsOfExperience: payload.yearsOfExperience ?? current.yearsOfExperience,
      skills: payload.skills ?? current.skills,
      avatarUrl: payload.avatarUrl ?? current.avatarUrl,
      updatedAt: isoNow,
    };
  }

  const payload = input.profile as CompanyProfileInput;
  return {
    ...current,
    organizationName: payload.organizationName ?? current.organizationName,
    teamRoles: payload.teamRoles ?? current.teamRoles,
    updatedAt: isoNow,
  };
}
