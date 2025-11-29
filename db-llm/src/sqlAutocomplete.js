import { CompletionContext } from "@codemirror/autocomplete"

/**
 * Create a schema-aware SQL autocomplete extension for CodeMirror
 * Provides intelligent suggestions for tables, columns, and SQL keywords
 * 
 * Features:
 * - Context-aware suggestions (tables after FROM, columns after SELECT)
 * - Color-coded suggestions (tables, columns, keywords)
 * - Type information for columns
 * - Smart matching (case-insensitive, partial matches)
 */
export function createSQLAutocomplete(schema) {
    if (!schema || !schema.tables) {
        return () => null
    }

    return function sqlAutocomplete(context) {
        const word = context.matchBefore(/\w*/)
        if (!word) return null
        if (word.from === word.to && !context.explicit) return null

        const line = context.state.doc.lineAt(context.pos)
        const textBefore = line.text.slice(0, context.pos - line.from).toUpperCase()
        const wordText = word.text.toLowerCase()

        // Determine what type of suggestions to show based on context
        const afterSelect = /SELECT\s+(?:\w+,\s*)*$/.test(textBefore)
        const afterFrom = /FROM\s+$/.test(textBefore) || /JOIN\s+$/.test(textBefore)
        const afterWhere = /WHERE\s+(?:\w+\s*[=<>!]+\s*)?$/.test(textBefore)
        const afterOn = /ON\s+$/.test(textBefore)
        const afterDot = /(\w+)\.\s*$/.exec(textBefore)

        let options = []

        // After table.column syntax, suggest columns from that specific table
        if (afterDot) {
            const tableName = afterDot[1].toLowerCase()
            const table = schema.tables.find(t => t.name.toLowerCase() === tableName)

            if (table) {
                options = table.columns.map(col => ({
                    label: col.name,
                    type: "property",
                    detail: col.type,
                    info: `${col.name} (${col.type})${col.nullable ? ' - nullable' : ''}`,
                    boost: 99 // High priority
                }))
            }
        }
        // After FROM/JOIN, suggest table names
        else if (afterFrom) {
            options = schema.tables.map(table => ({
                label: table.name,
                type: "class",
                detail: `${table.columns.length} columns`,
                info: `Table: ${table.name}\nColumns: ${table.columns.map(c => c.name).join(', ')}`,
                boost: 95
            }))
        }
        // After SELECT or WHERE, suggest columns from all tables
        else if (afterSelect || afterWhere || afterOn) {
            // Add all columns with table prefix
            schema.tables.forEach(table => {
                table.columns.forEach(col => {
                    options.push({
                        label: col.name,
                        apply: col.name,
                        type: "property",
                        detail: `${table.name}.${col.type}`,
                        info: `${col.name} from ${table.name} (${col.type})`,
                        boost: 80
                    })
                })
            })

            // Also suggest table names for qualified access
            schema.tables.forEach(table => {
                options.push({
                    label: table.name,
                    type: "class",
                    detail: "table",
                    boost: 70
                })
            })
        }
        // Default: suggest everything (keywords, tables, columns)
        else {
            // Add SQL keywords
            if (schema.keywords) {
                options.push(...schema.keywords.map(keyword => ({
                    label: keyword,
                    type: "keyword",
                    boost: keyword.startsWith(wordText.toUpperCase()) ? 90 : 50
                })))
            }

            // Add tables
            options.push(...schema.tables.map(table => ({
                label: table.name,
                type: "class",
                detail: `${table.columns.length} columns`,
                boost: 60
            })))

            // Add columns (less priority in general context)
            schema.tables.forEach(table => {
                table.columns.forEach(col => {
                    options.push({
                        label: col.name,
                        type: "property",
                        detail: `${table.name}.${col.type}`,
                        boost: 40
                    })
                })
            })
        }

        // Filter options based on current word
        if (wordText) {
            options = options.filter(opt =>
                opt.label.toLowerCase().includes(wordText)
            )
        }

        // Remove duplicates (keep highest boost)
        const seen = new Map()
        options.forEach(opt => {
            const key = opt.label.toLowerCase()
            if (!seen.has(key) || seen.get(key).boost < opt.boost) {
                seen.set(key, opt)
            }
        })
        options = Array.from(seen.values())

        // Sort by boost (higher first), then alphabetically
        options.sort((a, b) => {
            if (b.boost !== a.boost) return b.boost - a.boost
            return a.label.localeCompare(b.label)
        })

        return {
            from: word.from,
            options: options,
            validFor: /^\w*$/
        }
    }
}
