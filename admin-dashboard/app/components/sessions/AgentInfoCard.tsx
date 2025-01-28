import { Agent } from '@/app/types/sessions';

interface AgentInfoCardProps {
  agent: Agent;
}

export const AgentInfoCard = ({ agent }: AgentInfoCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{agent.name}</h2>
      <p className="text-sm text-gray-500">Created: {new Date(agent.createdAt).toLocaleString()}</p>
    </div>
  );
}; 