import { Agent } from '@/app/types/sessions';

interface RagDetailsProps {
  agent: Agent;
}

export const RagDetails = ({ agent }: RagDetailsProps) => {
  return (
    <div className="bg-white rounded-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">RAG Configuration</h3>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">PDF File</label>
                <p className="mt-1 text-sm text-gray-500">{agent.pdfPath}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Agent Token</label>
                <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">{agent.token}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 