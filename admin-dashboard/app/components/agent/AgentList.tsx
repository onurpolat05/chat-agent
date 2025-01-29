'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentCreationModal } from './AgentCreationModal';
import { agentService } from '../../services/agent.service';
import { type Agent } from '../../types/sessions';
import { Button } from '../../design-system/components/Button';
import { useLoadingState } from '../../hooks/useLoadingState';

interface AgentListProps {
  agents: Agent[];
  onCreateAgent: (name: string, files: File[]) => Promise<Agent>;
  onDeleteAgent: (id: string) => Promise<void>;
}

export const AgentList = ({ agents, onCreateAgent, onDeleteAgent }: AgentListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { withLoading, isLoading } = useLoadingState();
  const router = useRouter();

  const handleCopyToken = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { token } = await withLoading(`copyToken_${agentId}`, () =>
        agentService.getAgentToken(agentId)
      );
      await navigator.clipboard.writeText(token);
      setCopiedToken(agentId);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
      alert('Failed to copy token. Please try again.');
    }
  };

  const handleDelete = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        await withLoading(`deleteAgent_${agentId}`, () => onDeleteAgent(agentId));
      } catch (error) {
        console.error('Failed to delete agent:', error);
        alert('Failed to delete agent. Please try again.');
      }
    }
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/agents/${agentId}/sessions`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900">Q&A Agents</h2>
        <Button
          variant="default"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading('createAgent')}
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Agent
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 relative group ${
              isLoading(`deleteAgent_${agent.id}`) ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }`}
            onClick={() => !isLoading(`deleteAgent_${agent.id}`) && handleAgentClick(agent.id)}
          >
            <Button
              variant="destructive"
              size="icon"
              onClick={(e) => handleDelete(agent.id, e)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              disabled={isLoading(`deleteAgent_${agent.id}`)}
            >
              {isLoading(`deleteAgent_${agent.id}`) ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </Button>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">{agent.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-medium">ID:</span>
                <span className="ml-2 font-mono text-xs">{agent.id}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Created:</span>
                <span className="ml-2">{new Date(agent.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Access Token:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleCopyToken(agent.id, e)}
                    disabled={isLoading(`copyToken_${agent.id}`)}
                  >
                    {isLoading(`copyToken_${agent.id}`) ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : copiedToken === agent.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <code className="text-xs font-mono text-gray-800 break-all">{agent.maskedToken}</code>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AgentCreationModal
        isOpen={isModalOpen}
        onClose={() => !isLoading('createAgent') && setIsModalOpen(false)}
        onCreateAgent={onCreateAgent}
      />
    </div>
  );
}; 
