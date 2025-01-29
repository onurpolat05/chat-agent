'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { type Agent } from '../../types/sessions';

const SUPPORTED_FILE_TYPES = [
  { extension: '.pdf', label: 'PDF Document' },
  { extension: '.csv', label: 'CSV File' },
  { extension: '.docx', label: 'Word Document' },
  { extension: '.epub', label: 'EPUB Book' },
  { extension: '.txt', label: 'Text File' },
  { extension: '.json', label: 'JSON File' },
  { extension: '.md', label: 'Markdown File' },
];

interface AgentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (name: string, files: File[]) => Promise<Agent>;
}

export const AgentCreationModal = ({
  isOpen,
  onClose,
  onCreateAgent,
}: AgentCreationModalProps) => {
  const [agentName, setAgentName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!SUPPORTED_FILE_TYPES.some(type => type.extension === extension)) {
      setError(`Unsupported file type. Supported types: ${SUPPORTED_FILE_TYPES.map(t => t.extension).join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || selectedFiles.length === 0) {
      setError('Please enter an agent name and upload at least one document');
      return;
    }

    setIsLoading(true);
    try {
      await onCreateAgent(agentName, selectedFiles);
      onClose();
      // Reset form
      setAgentName('');
      setSelectedFiles([]);
      setError(null);
    } catch (error) {
      console.error('Error creating agent:', error);
      setError(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const newFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(e.dataTransfer.files).forEach(file => {
      if (validateFile(file)) {
        newFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.join(', ')}`);
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setError(null);
      const newFiles: File[] = [];
      const invalidFiles: string[] = [];

      Array.from(e.target.files).forEach(file => {
        if (validateFile(file)) {
          newFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        setError(`Invalid file types: ${invalidFiles.join(', ')}`);
      }

      if (newFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...newFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-xl bg-white shadow-2xl transform transition-all">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Create New Q&A Agent
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Create a new AI agent by providing a name and uploading one or more supported documents for training.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documents <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : selectedFiles.length > 0 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={SUPPORTED_FILE_TYPES.map(type => type.extension).join(',')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  multiple
                  required={selectedFiles.length === 0}
                />
                <div className="text-center">
                  {selectedFiles.length > 0 ? (
                    <div className="space-y-2">
                      <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-green-600">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-green-500">Click or drag to add more files</p>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Supported types: {SUPPORTED_FILE_TYPES.map(type => type.extension).join(', ')}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !agentName || selectedFiles.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Agent
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 