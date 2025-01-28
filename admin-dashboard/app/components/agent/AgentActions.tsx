import { useLoadingState } from '../../hooks/useLoadingState';
import { agentService } from '../../services/agent.service';
import { Button } from '../../design-system/components/Button';

interface AgentActionsProps {
  agentId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const AgentActions = ({ agentId, onSuccess, onError }: AgentActionsProps) => {
  const { withLoading, isLoading } = useLoadingState();

  const handleCopyToken = async () => {
    try {
      const { token } = await withLoading('copyToken', () =>
        agentService.getAgentToken(agentId)
      );
      await navigator.clipboard.writeText(token);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to copy token:', err);
      if (err instanceof Error) {
        onError?.(err);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        await withLoading('deleteAgent', () => agentService.deleteAgent(agentId));
        onSuccess?.();
      } catch (err) {
        console.error('Failed to delete agent:', err);
        if (err instanceof Error) {
          onError?.(err);
        }
      }
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyToken}
        disabled={isLoading('copyToken')}
      >
        {isLoading('copyToken') ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        )}
        <span className="ml-2">Copy Token</span>
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isLoading('deleteAgent')}
      >
        {isLoading('deleteAgent') ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
        <span className="ml-2">Delete Agent</span>
      </Button>
    </div>
  );
}; 