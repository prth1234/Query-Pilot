import { useState, useEffect, useRef } from 'react'
import { Box, Text } from '@primer/react-brand'
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DatabaseIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SearchIcon,
    FilterIcon,
    XIcon,
    SortAscIcon,
    SortDescIcon,
    GearIcon,
    DownloadIcon,
    CopyIcon,
    FileIcon
} from '@primer/octicons-react'
import { MdFullscreen, MdFullscreenExit } from "react-icons/md"
import TableSettings from './TableSettings'
import './ResultsTable.css'

const DEFAULT_SETTINGS = {
    rowHeight: 'compact', // compact, normal, comfortable
    fontSize: 12,
    showStripedRows: true,
    showHoverEffect: true,
    showBorders: true,
    stickyHeader: true,
    wrapText: false,
    showNullAsText: true,
    fontFamily: 'arial', // monospace, sans-serif, serif
    headerStyle: 'dark', // dark, light, colored
    cellPadding: 'normal', // compact, normal, comfortable
    showRowNumbers: true,
}

const ROW_HEIGHT_MAP = {
    compact: '10px',
    normal: '12px',
    comfortable: '16px'
}

function ResultsTable({ results, error, isLoading, executionTime, compact = true, lastRunAt, onClearResult }) {
    const [currentPage, setCurrentPage] = useState(1)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const [columnFilters, setColumnFilters] = useState({})
    const [sortConfig, setSortConfig] = useState({ column: null, direction: null })
    const [showColumnFilters, setShowColumnFilters] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [settings, setSettings] = useState(() => {
        // Load settings from localStorage
        try {
            const saved = localStorage.getItem('tableSettings')
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
        } catch {
            return DEFAULT_SETTINGS
        }
    })

    // Export functionality state
    const [showExportMenu, setShowExportMenu] = useState(false)

    const rowsPerPage = 300

    const settingsRef = useRef(null)
    const exportMenuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [settingsRef])

    // Close export menu on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [exportMenuRef])

    // Save settings to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('tableSettings', JSON.stringify(settings))
        } catch (err) {
            console.error('Failed to save settings:', err)
        }
    }, [settings])

    // Error state management
    const [isErrorExpanded, setIsErrorExpanded] = useState(false)

    if (isLoading) {
        return (
            <Box className="results-container loading">
                <div className="loading-progress-bar"></div>
                <div className="loading-state">
                    <Text className="loading-text">Executing query...</Text>
                </div>
            </Box>
        )
    }

    if (error) {
        const errorLines = error.split('\n')
        const isLongError = errorLines.length > 2
        const isVeryLongError = errorLines.length > 6

        const downloadErrorLog = () => {
            const blob = new Blob([error], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `query_error_${Date.now()}.log`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }

        return (
            <Box className="results-container error">
                <div className="error-state">
                    <XCircleIcon size={48} className="error-icon" />
                    <h3 className="error-title">Query Failed</h3>
                    <div className="error-message-container">
                        <p className={`error-message ${!isErrorExpanded ? 'truncated' : ''}`}>
                            {isErrorExpanded ? error : errorLines.slice(0, 2).join('\n')}
                        </p>
                        {isLongError && (
                            <div className="error-actions">
                                <button
                                    className="error-toggle-button"
                                    onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                                >
                                    {isErrorExpanded ? 'Show Less' : 'Read More'}
                                </button>
                                {isVeryLongError && (
                                    <button
                                        className="error-download-button"
                                        onClick={downloadErrorLog}
                                    >
                                        <DownloadIcon size={14} />
                                        <span>Download Error Log</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Box>
        )
    } // End if (error)

    if (!results) {
        return (
            <Box className="results-container empty">
                <div className="empty-state">
                    <DatabaseIcon size={64} className="empty-icon" />
                    <h3 className="empty-title">Ready to Execute</h3>
                    <p className="empty-message">
                        Write your SQL query above and click "Run" or press ⌘+Enter
                    </p>
                </div>
            </Box>
        )
    }

    const { columns, rows } = results



    // Apply global filter
    let filteredRows = rows.filter(row => {
        if (!globalFilter) return true
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(globalFilter.toLowerCase())
        )
    })

    // Apply column filters
    Object.keys(columnFilters).forEach(column => {
        const filterValue = columnFilters[column]
        if (filterValue) {
            filteredRows = filteredRows.filter(row =>
                String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
            )
        }
    })

    // Apply sorting
    if (sortConfig.column) {
        filteredRows.sort((a, b) => {
            const aValue = a[sortConfig.column]
            const bValue = b[sortConfig.column]

            if (aValue === null || aValue === undefined) return 1
            if (bValue === null || bValue === undefined) return -1

            let comparison = 0
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue
            } else {
                comparison = String(aValue).localeCompare(String(bValue))
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison
        })
    }

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentRows = filteredRows.slice(startIndex, endIndex)

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1))
    }

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen)
    }

    const handleSort = (column) => {
        let direction = 'asc'
        if (sortConfig.column === column && sortConfig.direction === 'asc') {
            direction = 'desc'
        } else if (sortConfig.column === column && sortConfig.direction === 'desc') {
            direction = null
        }

        setSortConfig({ column: direction ? column : null, direction })
    }

    const handleColumnFilterChange = (column, value) => {
        setColumnFilters(prev => {
            if (!value) {
                const newFilters = { ...prev }
                delete newFilters[column]
                return newFilters
            }
            return { ...prev, [column]: value }
        })
        setCurrentPage(1)
    }

    const clearAllFilters = () => {
        setGlobalFilter('')
        setColumnFilters({})
        setCurrentPage(1)
    }

    const activeFilterCount = Object.keys(columnFilters).length + (globalFilter ? 1 : 0)

    // Export as CSV (download)
    const exportAsCSV = () => {
        if (!results) return

        const { columns, rows } = results
        const csvRows = []

        // Add header
        csvRows.push(columns.join(','))

        // Add data rows
        filteredRows.forEach(row => {
            const values = columns.map(col => {
                const val = row[col]
                // Handle null/undefined
                if (val === null || val === undefined) return ''
                // Escape quotes and wrap in quotes if contains comma
                const stringVal = String(val)
                if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                    return `"${stringVal.replace(/"/g, '""')}"`
                }
                return stringVal
            })
            csvRows.push(values.join(','))
        })

        const csvContent = csvRows.join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `query_results_${Date.now()}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setShowExportMenu(false)
    }

    // Export as PDF (download)
    const exportAsPDF = async () => {
        if (!results) return

        try {
            // Dynamic import of jsPDF
            const { jsPDF } = await import('jspdf')
            const { default: autoTable } = await import('jspdf-autotable')

            const doc = new jsPDF({
                orientation: columns.length > 5 ? 'landscape' : 'portrait'
            })

            // Add title
            doc.setFontSize(16)
            doc.text('Query Results', 14, 15)

            // Add execution info
            doc.setFontSize(10)
            doc.text(`Rows: ${filteredRows.length}`, 14, 22)
            if (executionTime) {
                doc.text(`Execution Time: ${executionTime}ms`, 14, 28)
            }

            // Prepare table data
            const tableData = filteredRows.map(row =>
                columns.map(col => {
                    const val = row[col]
                    return val !== null && val !== undefined ? String(val) : 'NULL'
                })
            )

            // Generate table
            autoTable(doc, {
                head: [columns],
                body: tableData,
                startY: 35,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [59, 130, 246] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
            })

            doc.save(`query_results_${Date.now()}.pdf`)
            setShowExportMenu(false)
        } catch (error) {
            console.error('Error exporting PDF:', error)
            alert('Failed to export PDF. Please try again.')
        }
    }

    // Copy as JSON
    const copyAsJSON = () => {
        if (!results) return

        const jsonData = JSON.stringify(filteredRows, null, 2)
        navigator.clipboard.writeText(jsonData).then(() => {
            alert('Copied as JSON to clipboard!')
            setShowExportMenu(false)
        }).catch(err => {
            console.error('Failed to copy:', err)
            alert('Failed to copy to clipboard')
        })
    }

    // Copy as CSV
    const copyAsCSV = () => {
        if (!results) return

        const { columns, rows } = results
        const csvRows = []

        // Add header
        csvRows.push(columns.join(','))

        // Add data rows
        filteredRows.forEach(row => {
            const values = columns.map(col => {
                const val = row[col]
                if (val === null || val === undefined) return ''
                const stringVal = String(val)
                if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                    return `"${stringVal.replace(/"/g, '""')}"`
                }
                return stringVal
            })
            csvRows.push(values.join(','))
        })

        const csvContent = csvRows.join('\n')
        navigator.clipboard.writeText(csvContent).then(() => {
            alert('Copied as CSV to clipboard!')
            setShowExportMenu(false)
        }).catch(err => {
            console.error('Failed to copy:', err)
            alert('Failed to copy to clipboard')
        })
    }



    // Generate dynamic styles based on settings
    const tableClassNames = [
        'results-table',
        settings.showStripedRows ? 'striped' : '',
        settings.showHoverEffect ? 'hover-effect' : '',
        settings.showBorders ? 'with-borders' : '',
        settings.wrapText ? 'wrap-text' : '',
        `font-${settings.fontFamily}`,
        `header-${settings.headerStyle}`,
        `row-height-${settings.rowHeight}`,
        settings.columnDividers ? 'column-dividers' : ''
    ].filter(Boolean).join(' ')

    return (
        <Box className={`results-container ${isFullScreen ? 'full-screen' : ''} ${compact ? 'compact' : ''}`}>
            {/* Results Header */}
            <div className="results-header">
                <div className="results-header-left">
                    <CheckCircleIcon size={16} className="success-icon" />
                    <Text className="results-title">Query Results</Text>
                    <div className="results-badge">{filteredRows.length} rows</div>
                    {filteredRows.length !== rows.length && (
                        <div className="results-badge filtered">
                            {rows.length} total
                        </div>
                    )}
                </div>
                <div className="results-header-right">
                    {/* Execution Info */}
                    {lastRunAt && (
                        <div className="execution-time">
                            <span>Last run: {new Date(lastRunAt).toLocaleTimeString()}</span>
                        </div>
                    )}
                    {executionTime && (
                        <div className="execution-time">
                            <ClockIcon size={14} />
                            <span>{executionTime}ms</span>
                        </div>
                    )}

                    {/* Global Search */}
                    <div className="global-search">
                        <SearchIcon size={14} />
                        <input
                            type="text"
                            placeholder="Search all columns..."
                            value={globalFilter}
                            onChange={(e) => {
                                setGlobalFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="global-search-input"
                        />
                        {globalFilter && (
                            <button
                                className="clear-search-button"
                                onClick={() => setGlobalFilter('')}
                            >
                                <XIcon size={12} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <button
                        className={`icon-button ${showColumnFilters ? 'active' : ''}`}
                        onClick={() => setShowColumnFilters(!showColumnFilters)}
                        title="Toggle column filters"
                    >
                        <FilterIcon size={16} />
                        {activeFilterCount > 0 && (
                            <span className="filter-badge">{activeFilterCount}</span>
                        )}
                    </button>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <button
                            className="icon-button"
                            onClick={clearAllFilters}
                            title="Clear all filters"
                        >
                            <XIcon size={16} />
                        </button>
                    )}

                    {/* Settings Toggle */}
                    {/* Settings Toggle */}
                    <div className="settings-wrapper" style={{ position: 'relative' }} ref={settingsRef}>
                        <button
                            className={`icon-button ${showSettings ? 'active' : ''}`}
                            onClick={() => setShowSettings(!showSettings)}
                            title="Table settings"
                        >
                            <GearIcon size={16} />
                        </button>
                        {showSettings && (
                            <TableSettings
                                settings={settings}
                                onSettingsChange={setSettings}
                                onClose={() => setShowSettings(false)}
                                onReset={() => setSettings(DEFAULT_SETTINGS)}
                            />
                        )}
                    </div>

                    {/* Export Menu */}
                    <div className="settings-wrapper" style={{ position: 'relative' }} ref={exportMenuRef}>
                        <button
                            className={`icon-button ${showExportMenu ? 'active' : ''}`}
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            title="Export results"
                            disabled={!results || filteredRows.length === 0}
                        >
                            <DownloadIcon size={16} />
                        </button>
                        {showExportMenu && (
                            <div className="export-menu">
                                <div className="export-menu-header">Export Results</div>

                                <button
                                    onClick={exportAsCSV}
                                    className="export-menu-item"
                                >
                                    <FileIcon size={14} />
                                    <span>Download CSV</span>
                                </button>

                                <button
                                    onClick={exportAsPDF}
                                    className="export-menu-item"
                                >
                                    <FileIcon size={14} />
                                    <span>Download PDF</span>
                                </button>

                                <div className="export-menu-divider"></div>

                                <button
                                    onClick={copyAsCSV}
                                    className="export-menu-item"
                                >
                                    <CopyIcon size={14} />
                                    <span>Copy as CSV</span>
                                </button>

                                <button
                                    onClick={copyAsJSON}
                                    className="export-menu-item"
                                >
                                    <CopyIcon size={14} />
                                    <span>Copy as JSON</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Fullscreen Toggle */}
                    <button className="icon-button" onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                        {isFullScreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
                    </button>

                    {/* Clear Results Button */}
                    {onClearResult && (
                        <button
                            className="clear-results-badge"
                            onClick={onClearResult}
                            title="Clear results only"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>



            {/* Table Container */}
            <div className="table-wrapper">
                <table className={tableClassNames} style={{ fontSize: `${settings.fontSize}px` }}>
                    <thead className={settings.stickyHeader ? 'sticky' : ''}>
                        <tr>
                            {settings.showRowNumbers && <th className="row-index-header">#</th>}
                            {columns.map((column, index) => (
                                <th key={index} className="column-header">
                                    <div className="column-header-content">
                                        <div className="column-header-row">
                                            <span className="column-name">{column}</span>
                                            <button
                                                className="sort-button"
                                                onClick={() => handleSort(column)}
                                                title={`Sort by ${column}`}
                                            >
                                                {sortConfig.column === column ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <SortAscIcon size={14} className="sort-icon active" />
                                                    ) : (
                                                        <SortDescIcon size={14} className="sort-icon active" />
                                                    )
                                                ) : (
                                                    <SortAscIcon size={14} className="sort-icon" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        {/* Column Filters Row */}
                        {showColumnFilters && (
                            <tr className="filter-row">
                                {settings.showRowNumbers && <td className="filter-cell-index"></td>}
                                {columns.map((column, index) => (
                                    <td key={index} className="filter-cell">
                                        <div className="filter-input-wrapper">
                                            <SearchIcon size={12} className="filter-icon" />
                                            <input
                                                type="text"
                                                placeholder={`Filter ${column}...`}
                                                value={columnFilters[column] || ''}
                                                onChange={(e) => handleColumnFilterChange(column, e.target.value)}
                                                className="filter-input"
                                            />
                                            {columnFilters[column] && (
                                                <button
                                                    className="clear-filter-button"
                                                    onClick={() => handleColumnFilterChange(column, '')}
                                                >
                                                    <XIcon size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map((row, rowIndex) => (
                                <tr
                                    key={startIndex + rowIndex}
                                    className={`table-row ${settings.highlightOnHover ? 'highlight-hover' : ''}`}
                                >
                                    {settings.showRowNumbers && (
                                        <td className="row-index">{startIndex + rowIndex + 1}</td>
                                    )}
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="table-cell"
                                        >
                                            <div className="cell-content">
                                                {row[column] !== null && row[column] !== undefined
                                                    ? String(row[column])
                                                    : settings.showNullAsText
                                                        ? <span className="null-value">NULL</span>
                                                        : ''
                                                }
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={(settings.showRowNumbers ? 1 : 0) + columns.length} className="no-results">
                                    <div className="no-results-content">
                                        <SearchIcon size={32} className="no-results-icon" />
                                        <p>No results match your filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <div className="pagination-info">
                        {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} of {filteredRows.length}
                        {filteredRows.length !== rows.length && ` (filtered from ${rows.length})`}
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="pagination-button"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeftIcon size={14} />
                        </button>
                        <div className="page-indicator">
                            {currentPage}/{totalPages}
                        </div>
                        <button
                            className="pagination-button"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRightIcon size={14} />
                        </button>
                    </div>
                </div>
            )}
        </Box>
    )
}

export default ResultsTable
