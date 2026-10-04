export interface AppBindings {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  ENVIRONMENT?: string;
}

export type AppContext = {
  Bindings: AppBindings;
};
