import { supabase } from '@/lib/supabase'
import type { DatabaseRecord } from '@/types/database'

export interface QueryResult<T = DatabaseRecord> {
  data: T[] | null
  error: Error | null
  isLoading: boolean
}

export interface PaginationOptions {
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
}

export interface DatabaseServiceOptions extends PaginationOptions {
  select?: string
  filters?: Record<string, any>
}

/**
 * Generic function to fetch data from any table
 */
export async function getTableData(
  tableName: string,
  options: DatabaseServiceOptions = {}
): Promise<QueryResult> {
  try {
    let query = supabase
      .from(tableName)
      .select(options.select || '*')

    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true })
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return {
      data,
      error: null,
      isLoading: false,
    }
  } catch (error) {
    console.error(`Error fetching data from table ${tableName}:`, error)

    return {
      data: null,
      error: error as Error,
      isLoading: false,
    }
  }
}

/**
 * Get a single record by ID
 */
export async function getRecordById(
  tableName: string,
  id: string | number
): Promise<QueryResult> {
  return getTableData(tableName, {
    filters: { id },
    limit: 1,
  })
}

/**
 * Get table structure/columns (for dynamic table display)
 */
export async function getTableStructure(tableName: string): Promise<string[]> {
  try {
    // Try to get one record to infer column structure
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (data && data.length > 0) {
      // Extract column names from the first record
      return Object.keys(data[0])
    }

    // If no data, return common column names
    return ['id', 'created_at', 'updated_at']
  } catch (error) {
    console.error(`Error getting table structure for ${tableName}:`, error)
    return ['id', 'created_at', 'updated_at']
  }
}