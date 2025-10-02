import Layout from '../components/Layout';
import type { ProfileSummary } from '../types/profile';

const mockProfile: ProfileSummary = {
  type: 'freelancer',
  name: 'Jordan Blake',
  email: 'jordan@example.com',
  bio: 'Seasoned interviewer who has led over 200 technical screens for high-growth startups.',
  yearsOfExperience: 8,
  skills: ['System Design', 'Behavioral Interviews', 'Scale-ups'],
};

const ProfilePage = () => (
  <Layout title="Your Profile" subtitle="Synced with DynamoDB after Cognito sign-up">
    <section className="profile">
      <header>
        <h2>{mockProfile.name}</h2>
        <p className="profile-email">{mockProfile.email}</p>
        <span className="badge">{mockProfile.type === 'freelancer' ? 'Freelancer' : 'Company'}</span>
      </header>
      <p className="profile-bio">{mockProfile.bio}</p>
      <dl className="profile-details">
        <div>
          <dt>Experience</dt>
          <dd>{mockProfile.yearsOfExperience} years</dd>
        </div>
        <div>
          <dt>Key Skills</dt>
          <dd>{mockProfile.skills.join(', ')}</dd>
        </div>
      </dl>
    </section>
  </Layout>
);

export default ProfilePage;
