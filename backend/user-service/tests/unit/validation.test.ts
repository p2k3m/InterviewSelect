import { buildProfileFromInput, validateRegisterInput, applyProfileUpdates } from '../../src/utils/validation';
import type { RegisterUserInput, UpdateUserProfileInput } from '../../src/models';

describe('validateRegisterInput', () => {
  it('throws for invalid email', () => {
    const input = {
      email: 'invalid',
      password: 'password123',
      type: 'freelancer',
      profile: { name: 'Test User' },
    } satisfies RegisterUserInput;

    expect(() => validateRegisterInput(input)).toThrow('Invalid email address');
  });

  it('throws when freelancer missing name', () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      type: 'freelancer',
      profile: {},
    } satisfies RegisterUserInput;

    expect(() => validateRegisterInput(input)).toThrow('Freelancer profile requires a name');
  });

  it('passes for valid company', () => {
    const input = {
      email: 'company@example.com',
      password: 'password123',
      type: 'company',
      profile: { organizationName: 'Acme' },
    } satisfies RegisterUserInput;

    expect(validateRegisterInput(input)).toBe(input);
  });
});

describe('buildProfileFromInput', () => {
  it('creates freelancer profile with uuid', () => {
    const input = {
      email: 'free@example.com',
      password: 'password123',
      type: 'freelancer',
      profile: { name: 'Free Lancer', yearsOfExperience: 3 },
    } satisfies RegisterUserInput;

    const profile = buildProfileFromInput(input, new Date('2024-01-01T00:00:00Z'));
    expect(profile).toMatchObject({
      email: 'free@example.com',
      name: 'Free Lancer',
      yearsOfExperience: 3,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    expect(profile.id).toBeDefined();
  });
});

describe('applyProfileUpdates', () => {
  it('updates freelancer profile fields', () => {
    const existing = buildProfileFromInput(
      {
        email: 'free@example.com',
        password: 'password123',
        type: 'freelancer',
        profile: { name: 'Free Lancer', bio: 'Initial' },
      },
      new Date('2024-01-01T00:00:00Z')
    );

    const input: UpdateUserProfileInput = {
      id: existing.id,
      profile: { bio: 'Updated bio' },
    };

    const updated = applyProfileUpdates(existing, input, new Date('2024-01-02T00:00:00Z'));
    if ('bio' in updated) {
      expect(updated.bio).toBe('Updated bio');
    } else {
      throw new Error('Expected freelancer profile');
    }
    expect(updated.updatedAt).toBe('2024-01-02T00:00:00.000Z');
  });
});
