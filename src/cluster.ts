export enum ClusterSetupStatus {
  ClusterDisabled = "cluster_disabled",
  ClusterEnabled = "cluster_enabled",
  ClusterFinished = "cluster_finished",
  SingleNodeDisabled = "single_node_disabled",
  SingleNodeEnabled = "single_node_enabled",
}

export enum ClusterSetupAction {
  EnableSingleNode = "enable_single_node",
  EnableCluster = "enable_cluster",
  AddNode = "add_node",
  FinishCluster = "finish_cluster",
}

export interface ClusterSetupState {
  state: ClusterSetupStatus;
}

export interface ClusterSetupStatusOptions {
  query: {
    ensure_dbs_exist?: Array<string>;
  };
}

export interface ClusterSetupOptions {
  data: {
    action: ClusterSetupAction;
    bind_address?: string;
    username?: string;
    password?: string;
    port?: number;
    node_count?: number;
    remote_node?: string;
    remote_current_user?: string;
    remote_current_password?: string;
    host?: string;
    ensure_dbs_exist?: Array<string>;
  };
}
