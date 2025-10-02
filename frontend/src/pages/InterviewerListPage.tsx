import Layout from '../components/Layout';

const interviewers = [
  {
    name: 'Alex Rivera',
    specialty: 'Frontend Engineering',
    focus: 'Design system governance, accessibility audits, mentorship frameworks',
  },
  {
    name: 'Priya Desai',
    specialty: 'Backend Architecture',
    focus: 'Serverless design, scaling Node.js microservices, operational excellence',
  },
  {
    name: 'Martin Fischer',
    specialty: 'Data Engineering',
    focus: 'Analytics platforms, orchestration, and real-time ingestion pipelines',
  },
];

const InterviewerListPage = () => (
  <Layout title="Featured Interviewers" subtitle="Stubbed marketplace service data">
    <ul className="list">
      {interviewers.map((interviewer) => (
        <li key={interviewer.name} className="list-item">
          <h3>{interviewer.name}</h3>
          <p className="list-item-subtitle">{interviewer.specialty}</p>
          <p>{interviewer.focus}</p>
        </li>
      ))}
    </ul>
  </Layout>
);

export default InterviewerListPage;
