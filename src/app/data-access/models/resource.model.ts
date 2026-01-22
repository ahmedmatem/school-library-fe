export type ResourceType = 'FILE' | 'LINK';
export type ResourceFormat = 'PDF' | 'EPUB' | 'VIDEO' | 'AUDIO' | 'DOC' | 'PPT' | 'OTHER';

export type Audience = 'ALL' | `${number}` | `${number}${'А'|'Б'|'В'|'Г'}` | string;

export interface Resource {
  id: string;
  title: string;
  author?: string;
  description?: string;
  type: ResourceType;
  format: ResourceFormat;
  subject: string;     // "БЕЛ", "История"...
  language: string;    // "bg"
  tags: string[];
  createdAt: string;   // ISO
  fileUrl?: string;    // ако type=FILE
  externalUrl?: string;// ако type=LINK
  visibility?: Audience[];  // ['ALL'] or ['7'] or ['7A'] or mixed
}

export interface Filters {
  query: string;
  subject: string;
  type: '' | ResourceType;
  format: '' | ResourceFormat;
  tag: string;
}
