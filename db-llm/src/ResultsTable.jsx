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
    GearIcon
} from '@primer/octicons-react'
import { MdFullscreen, MdFullscreenExit } from "react-icons/md"
import TableSettings from './TableSettings'
import './ResultsTable.css'

const DEFAULT_SETTINGS = {
    rowHeight: 'compact', // compact, normal, comfortable
    fontSize: 13,
    showStripedRows: true,
    showHoverEffect: true,
    showBorders: true,
    stickyHeader: true,
    wrapText: false,
    showNullAsText: true,
    fontFamily: 'monospace', // monospace, sans-serif, serif
    headerStyle: 'dark', // dark, light, colored
    cellPadding: 'normal', // compact, normal, comfortable
    showRowNumbers: true,
}

const ROW_HEIGHT_MAP = {
    compact: '10px',
    normal: '12px',
    comfortable: '16px'
}

function ResultsTable({ results, error, isLoading, executionTime }) {
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
    const rowsPerPage = 300

    const settingsRef = useRef(null)

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

    // Save settings to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('tableSettings', JSON.stringify(settings))
        } catch (err) {
            console.error('Failed to save settings:', err)
        }
    }, [settings])

    if (isLoading) {
        return (
            <Box className="results-container loading">
                <div className="loading-state">
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                    <Text className="loading-text">Executing query...</Text>
                </div>
            </Box>
        )
    }

    if (error) {
        return (
            <Box className="results-container error">
                <div className="error-state">
                    <XCircleIcon size={48} className="error-icon" />
                    <h3 className="error-title">Query Failed</h3>
                    <p className="error-message">{error}</p>
                </div>
            </Box>
        )
    }

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
        <Box className={`results-container ${isFullScreen ? 'full-screen' : ''}`}>
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

                    {executionTime && (
                        <div className="execution-time">
                            <ClockIcon size={14} />
                            <span>{executionTime}ms</span>
                        </div>
                    )}
                    <button className="icon-button" onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                        {isFullScreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
                    </button>
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
