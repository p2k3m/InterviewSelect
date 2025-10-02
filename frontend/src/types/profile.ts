export interface ProfileSummary {
  type: 'freelancer' | 'company';
  name: string;
  email: string;
  bio: string;
  yearsOfExperience: number;
  skills: string[];
}

export interface EditableProfile extends ProfileSummary {
  companyName?: string;
  teamRoles?: string[];
}
