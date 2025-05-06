import { typeToFlattenedError } from "zod";
/**
 * This file contains types utilized across the entire BSCH API
 */

/**
 * Metadata contains pagination data and statistics
 */
interface Metadata {
  count: number;
  offset: number;
  limit: number;
  pagination: Pagination;
}

/**
 * Pagination
 */
interface Pagination {
  next: boolean;
  totalPages: number;
  currentPage: number;
}

/**
 * All API responses follow this format.
 */
export interface APIResponse<T = unknown> {
  error?: string | Error;
  message: string;
  items?: T[] | null | undefined;
  data?: Record<string, T> | T;
  metadata?: Metadata;
  validationError?: typeToFlattenedError<Record<string, unknown>> | null;
}

export interface Analytics {
  approved: number;
  totalClans: number;
  awaitingApproval: number;
  reportedClans?: number;
}
/**
 * Sort directions
 */
export type SortDirections = "asc" | "desc";
export const sortDirections: SortDirections[] = ["asc", "desc"];
