import fs from 'node:fs'
import path from 'node:path'
import prettier from 'prettier'

type EnumMap = Record<string, string[]>

type ColumnReference = {
  schema?: string
  table: string
  columns: string[]
}

type Column = {
  name: string
  dbType: string
  notNull: boolean
  hasDefault: boolean
  checkValues?: string[]
  references?: ColumnReference
  isPrimary: boolean
}

type Table = {
  name: string
  columns: Column[]
  primaryKeys: Set<string>
}

type SchemaModel = {
  enums: EnumMap
  tables: Table[]
}

const ROOT = path.resolve(__dirname, '..')
const SCHEMA_PATH = path.join(ROOT, 'apps/web/schema.sql')
const DB_TYPES_PATH = path.join(ROOT, 'apps/web/src/types/database.types.ts')
const PKG_DB_PATH = path.join(ROOT, 'packages/types/src/db.ts')

const INDENT_SIZE = 2

const stripQuotes = (value: string): string => value.trim().replace(/^'(.*)'$/, '$1')

const indentBlock = (text: string, spaces: number): string =>
  text
    .split('\n')
    .map((line) => (line ? `${' '.repeat(spaces)}${line}` : line))
    .join('\n')

const parseEnums = (sql: string): EnumMap => {
  const enums: EnumMap = {}
  const enumRegex = /CREATE TYPE\s+(\w+)\s+AS\s+ENUM\s*\(([^)]+)\)/gi

  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = enumRegex.exec(sql)) !== null) {
    const [, name, values] = match
    enums[name] = values
      .split(',')
      .map(stripQuotes)
      .map((v) => v.trim())
  }

  return enums
}

const parseSchema = (sql: string): SchemaModel => {
  const enums = parseEnums(sql)
  const tableRegex = /CREATE TABLE\s+public\.([^(]+)\(([\s\S]*?)\)\s*;/gi
  const tables: Table[] = []

  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = tableRegex.exec(sql)) !== null) {
    const [, rawName, rawBody] = match
    const tableName = rawName.trim()
    const segments: string[] = []
    let buffer = ''
    let parenDepth = 0

    rawBody.split('\n').forEach((rawLine) => {
      const line = rawLine.trim()
      if (!line || line.startsWith('--')) return

      const opens = (line.match(/\(/g) ?? []).length
      const closes = (line.match(/\)/g) ?? []).length
      parenDepth += opens - closes

      buffer = buffer ? `${buffer} ${line}` : line

      const endsWithComma = line.endsWith(',')
      if (parenDepth <= 0 && endsWithComma) {
        segments.push(buffer.replace(/,$/, ''))
        buffer = ''
        parenDepth = 0
      }
    })

    if (buffer) {
      segments.push(buffer.replace(/,$/, ''))
    }

    const primaryKeys = new Set<string>()
    segments.forEach((segment) => {
      if (/^PRIMARY KEY/i.test(segment)) {
        const pkMatch = segment.match(/\(([^)]+)\)/)
        if (pkMatch) {
          pkMatch[1]
            .split(',')
            .map((part) => part.trim().replace(/"/g, ''))
            .forEach((pk) => primaryKeys.add(pk))
        }
      }
    })

    const columns: Column[] = []
    segments.forEach((segment) => {
      if (/^(PRIMARY KEY|UNIQUE|CONSTRAINT)/i.test(segment)) return

      const colMatch =
        segment.match(/^"?(?<name>[a-zA-Z0-9_]+)"?\s+(?<type>[^\s]+)(?<rest>[\s\S]*)$/) ||
        undefined

      if (!colMatch || !colMatch.groups) return
      const { name, type, rest } = colMatch.groups
      const constraintText = rest ?? ''
      const hasDefault = /default/i.test(constraintText)
      const notNull = /not null/i.test(constraintText) || /primary key/i.test(constraintText)
      const isPrimary = primaryKeys.has(name) || /primary key/i.test(constraintText)

      const referenceMatch = constraintText.match(
        /references\s+([^\s(]+)(?:\s*\(([^)]+)\))?/i
      )
      let references: ColumnReference | undefined
      if (referenceMatch) {
        const [_, refTableRaw, refCols] = referenceMatch
        const [refSchema, refTable] = refTableRaw.includes('.')
          ? refTableRaw.split('.', 2)
          : [undefined, refTableRaw]
        const columns = refCols
          ? refCols.split(',').map((col) => col.trim().replace(/"/g, ''))
          : ['id']
        references = { schema: refSchema, table: refTable, columns }
      }

      const checkMatch = constraintText.match(/check\s*\(\s*[\s\S]*?in\s*\(([\s\S]*?)\)\s*\)/i)
      const checkValues = checkMatch
        ? checkMatch[1]
            .split(',')
            .map(stripQuotes)
            .map((v) => v.trim())
        : undefined
      if (/check/i.test(constraintText) && /in\s*\(/i.test(constraintText) && !checkValues) {
        console.warn(`Could not parse CHECK constraint for ${tableName}.${name}: ${constraintText}`)
      }

      columns.push({
        name,
        dbType: type.replace(/,$/, ''),
        notNull,
        hasDefault,
        checkValues,
        references,
        isPrimary,
      })
    })

    tables.push({ name: tableName, columns, primaryKeys })
  }

  return { enums, tables }
}

const mapScalarType = (dbType: string): string => {
  const normalized = dbType.toLowerCase()
  if (normalized === 'text' || normalized === 'citext' || normalized === 'uuid') return 'string'
  if (normalized === 'timestamptz') return 'string'
  if (normalized === 'json' || normalized === 'jsonb') return 'Json'
  if (normalized === 'boolean') return 'boolean'
  if (['integer', 'bigint', 'numeric'].includes(normalized)) return 'number'
  return 'unknown'
}

const columnTsType = (column: Column, enums: EnumMap): string => {
  const enumValues = column.checkValues ?? enums[column.dbType]
  const baseType = enumValues && enumValues.length > 0 ? enumValues.map((v) => `'${v}'`).join(' | ') : mapScalarType(column.dbType)
  return column.notNull || column.isPrimary ? baseType : `${baseType} | null`
}

const isInsertRequired = (column: Column): boolean =>
  column.notNull && !column.hasDefault && !column.isPrimary

const renderRelationships = (table: Table): string => {
  const relationships = table.columns
    .filter((col) => col.references)
    .map((col) => {
      const ref = col.references!
      const foreignKeyName = `${table.name}_${col.name}_fkey`
      const referencedRelation = ref.table.split('.').pop() ?? ref.table
      const isOneToOne = col.isPrimary && table.primaryKeys.size === 1
      return `{
  foreignKeyName: "${foreignKeyName}"
  columns: ["${col.name}"]
  isOneToOne: ${isOneToOne ? 'true' : 'false'}
  referencedRelation: "${referencedRelation}"
  referencedColumns: [${ref.columns.map((c) => `"${c}"`).join(', ')}]
}`
    })

  if (!relationships.length) return '[]'

  return `[
${indentBlock(relationships.join(',\n'), INDENT_SIZE * 5)}
${' '.repeat(INDENT_SIZE * 4)}]`
}

const renderTable = (table: Table, enums: EnumMap): string => {
  const rowFields = table.columns
    .map((col) => `${col.name}: ${columnTsType(col, enums)}`)
    .join('\n')
  const insertFields = table.columns
    .map((col) => `${col.name}${isInsertRequired(col) ? '' : '?'}: ${columnTsType(col, enums)}`)
    .join('\n')
  const updateFields = table.columns
    .map((col) => `${col.name}?: ${columnTsType(col, enums)}`)
    .join('\n')

  return `${table.name}: {
        Row: {
${indentBlock(rowFields, INDENT_SIZE * 4)}
        }
        Insert: {
${indentBlock(insertFields, INDENT_SIZE * 4)}
        }
        Update: {
${indentBlock(updateFields, INDENT_SIZE * 4)}
        }
        Relationships: ${renderRelationships(table)}
      }`
}

const renderDatabaseTypes = (schema: SchemaModel): string => {
  const tableBlocks = schema.tables.map((table) => renderTable(table, schema.enums)).join('\n')
  const enumEntries = Object.entries(schema.enums)
    .map(([name, values]) => `${name}: ${values.map((v) => `'${v}'`).join(' | ')}`)
    .join('\n')

  return `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "local-schema"
  }
  public: {
    Tables: {
${indentBlock(tableBlocks, INDENT_SIZE * 3)}
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
${indentBlock(enumEntries || '[_ in never]: never', INDENT_SIZE * 3)}
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
`
}

const renderPackageDbTypes = (): string => `
import type { Database as SupabaseDatabase, Json as SupabaseJson } from '../../apps/web/src/types/database.types'

export type Database = SupabaseDatabase
export type Json = SupabaseJson

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
`

const formatTs = async (content: string): Promise<string> =>
  prettier.format(content, { parser: 'typescript', semi: false })

const writeIfChanged = (targetPath: string, contents: string): boolean => {
  const existing = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : ''
  if (existing === contents) return false
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, contents)
  return true
}

const main = async () => {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8')
  const schema = parseSchema(schemaSql)

  const generatedDbTypes = await formatTs(renderDatabaseTypes(schema))
  const generatedPkgDb = await formatTs(renderPackageDbTypes())

  const writeMode = process.argv.includes('--write')
  const diffs: string[] = []

  if (writeMode) {
    if (writeIfChanged(DB_TYPES_PATH, generatedDbTypes)) {
      console.log(`Updated ${path.relative(ROOT, DB_TYPES_PATH)}`)
    }
    if (writeIfChanged(PKG_DB_PATH, generatedPkgDb)) {
      console.log(`Updated ${path.relative(ROOT, PKG_DB_PATH)}`)
    }
  } else {
    const currentDbTypes = fs.readFileSync(DB_TYPES_PATH, 'utf8')
    const currentPkgDb = fs.readFileSync(PKG_DB_PATH, 'utf8')

    if (currentDbTypes !== generatedDbTypes) {
      diffs.push(path.relative(ROOT, DB_TYPES_PATH))
    }
    if (currentPkgDb !== generatedPkgDb) {
      diffs.push(path.relative(ROOT, PKG_DB_PATH))
    }
  }

  if (diffs.length) {
    console.error('Type drift detected in:', diffs.join(', '))
    console.error('Run `tsx scripts/check-type-drift.ts --write` to regenerate.')
    process.exit(1)
  }

  console.log('Type drift check passed.')
}

main().catch((error) => {
  console.error('Failed to run type drift check:')
  console.error(error)
  process.exit(1)
})
