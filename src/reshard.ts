export interface ReshardJobCreateOptions {
  data: {
    type?: string;
    db?: string;
    node?: string;
    range?: string;
    shard?: string;
    error?: string;
  };
}
