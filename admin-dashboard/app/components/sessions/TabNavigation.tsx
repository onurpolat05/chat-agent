import { TabType } from '@/app/types/sessions';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex">
        <button
          onClick={() => onTabChange('sessions')}
          className={`py-4 px-6 text-sm font-medium border-b-2 ${
            activeTab === 'sessions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Sessions
        </button>
        <button
          onClick={() => onTabChange('rag')}
          className={`py-4 px-6 text-sm font-medium border-b-2 ${
            activeTab === 'rag'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          RAG Details
        </button>
      </nav>
    </div>
  );
}; 