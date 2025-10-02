import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const DashboardPage = () => (
  <Layout title="Welcome to InterviewSelect">
    <p className="description">
      This MVP validates the end-to-end flow between AWS Cognito authentication, profile storage in
      DynamoDB, and discoverability in the marketplace. Use the navigation links to explore the
      primary user journeys.
    </p>
    <section className="card-grid">
      <article className="card">
        <h3>Manage Your Profile</h3>
        <p>Review the read-only profile view or jump into edit mode to make changes.</p>
        <div className="card-actions">
          <Link to="/profile" className="button">
            View Profile
          </Link>
          <Link to="/profile/edit" className="button button-secondary">
            Edit Profile
          </Link>
        </div>
      </article>
      <article className="card">
        <h3>Browse Interviewers</h3>
        <p>See a curated, hard-coded list of subject matter experts ready for validation interviews.</p>
        <div className="card-actions">
          <Link to="/interviewers" className="button">
            Explore List
          </Link>
        </div>
      </article>
    </section>
  </Layout>
);

export default DashboardPage;
