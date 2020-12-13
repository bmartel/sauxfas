import { DocId } from "./internal";
import { ReplicationStatus } from "./replication";

export interface SchedulerJob {}

export interface SchedulerJobOptions {
  query: {
    limit?: number;
    skip?: number;
  };
}

export interface SchedulerJobResult {
  offset: number;
  total_rows: number;
  id: string;
  database: string;
  doc_id: string;
  history: Array<{ type: string; timestamp: Date | string }>;
  pid: string;
  node: string;
  source: string;
  target: string;
  start_time: Date | string;
}

export interface SchedulerDocOptions {
  replicator?: string;
  id?: DocId;
  query?: {
    limit?: number;
    skip?: number;
  };
}

export interface SchedulerInfo {
  revisions_checked: number;
  missing_revisions_found: number;
  docs_read: number;
  docs_written: number;
  changes_pending: number;
  doc_write_failures: number;
  checkpointed_source_seq: number;
}

export interface SchedulerDocResult {
  offset: number;
  total_rows: number;
  id: string;
  state: ReplicationStatus;
  database: string;
  doc_id: string;
  node: string;
  source: string;
  target: string;
  start_time: Date | string;
  last_updated: Date | string;
  info: SchedulerInfo;
  error_count: number;
}
