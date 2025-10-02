import { FormEvent, useState } from 'react';
import Layout from '../components/Layout';
import type { EditableProfile } from '../types/profile';

const initialProfile: EditableProfile = {
  type: 'freelancer',
  name: 'Jordan Blake',
  email: 'jordan@example.com',
  bio: 'Seasoned interviewer who has led over 200 technical screens for high-growth startups.',
  yearsOfExperience: 8,
  skills: ['System Design', 'Behavioral Interviews', 'Scale-ups'],
};

const ProfileEditPage = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Changes saved locally. Connect the form to the User Service API to persist.');
  };

  return (
    <Layout title="Edit Profile" subtitle="Wire up to the User Service PUT /users endpoint">
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Name</span>
          <input
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
          />
        </label>
        <label className="form-field">
          <span>Bio</span>
          <textarea
            value={profile.bio}
            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
          />
        </label>
        <label className="form-field">
          <span>Years of Experience</span>
          <input
            type="number"
            value={profile.yearsOfExperience}
            onChange={(event) => setProfile({ ...profile, yearsOfExperience: Number(event.target.value) })}
          />
        </label>
        <label className="form-field">
          <span>Skills (comma separated)</span>
          <input
            value={profile.skills.join(', ')}
            onChange={(event) => setProfile({ ...profile, skills: event.target.value.split(',').map((skill) => skill.trim()) })}
          />
        </label>
        <button type="submit" className="button">
          Save Changes
        </button>
        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </Layout>
  );
};

export default ProfileEditPage;
