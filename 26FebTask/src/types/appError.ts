export interface AppError extends Error {
  statusCode?: number;
  code?:       number;           // Mongoose/MongoDB error codes (e.g. 11000)
  keyPattern?: Record<string, number>;
}
