export interface ReplicationHistory {
  doc_write_failures: number;
  docs_read: number;
  docs_written: number;
  end_last_seq: number;
  end_time: Date | string;
  missing_checked: number;
  missing_found: number;
  recorded_seq: number;
  session_id: string;
  start_last_seq: number;
  start_time: Date | string;
}

export enum ReplicationStatus {
  Initializing = "initializing",
  Running = "running",
  Completed = "completed",
  Pending = "pending",
  Crashing = "crashing",
  Error = "error",
  Failed = "failed",
}

export interface Replication {
  history: Array<ReplicationHistory>;
  replication_id_version: number;
  session_id: string;
  source_last_seq: number;
}

export interface ActiveTask {
  changes_done: number;
  database: string;
  pid: string;
  progress: number;
  started_on: number;
  status: string;
  task: string;
  total_changes: number;
  type: string;
  updated_on: number;
}

export interface ReplicateOptions {
  data: {
    source: string;
    target: string;
    cancel?: boolean;
    filter?: string;
    doc_ids?: Array<string>;
    continuous?: boolean;
    create_target?: boolean;
  };
}
