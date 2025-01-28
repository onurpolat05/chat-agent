import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { EPubLoader } from 'langchain/document_loaders/fs/epub';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { Document } from '@langchain/core/documents';
import path from 'path';

export type SupportedFileType = 'pdf' | 'csv' | 'docx' | 'epub' | 'txt' | 'json';

interface DocumentLoaderOptions {
  splitPages?: boolean;
  csvDelimiter?: string;
  jsonPointer?: string[];
}

export class DocumentLoaderFactory {
  private static readonly supportedExtensions = new Set([
    '.pdf', '.csv', '.docx', '.epub', '.txt', '.json'
  ]);

  static isSupported(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.has(ext);
  }

  static getFileType(filePath: string): SupportedFileType {
    const ext = path.extname(filePath).toLowerCase();
    return ext.slice(1) as SupportedFileType;
  }

  static createLoader(filePath: string, options: DocumentLoaderOptions = {}): Promise<Document[]> {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.pdf':
        return new PDFLoader(filePath, {
          splitPages: options.splitPages ?? true
        }).load();

      case '.csv':
        return new CSVLoader(filePath, {
          separator: options.csvDelimiter
        }).load();

      case '.docx':
        return new DocxLoader(filePath).load();

      case '.epub':
        return new EPubLoader(filePath).load();

      case '.txt':
        return new TextLoader(filePath).load();

      case '.json':
        return new JSONLoader(filePath, options.jsonPointer).load();

      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }
} 
