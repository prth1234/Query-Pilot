import { useState } from 'react'
import { Box, Text } from '@primer/react-brand'
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DatabaseIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@primer/octicons-react'
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import './ResultsTable.css'

function ResultsTable({ results, error, isLoading, executionTime }) {
    const [currentPage, setCurrentPage] = useState(1)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const rowsPerPage = 300

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

    const { columns, rows, rowCount } = results
    const totalPages = Math.ceil(rows.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentRows = rows.slice(startIndex, endIndex)

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1))
    }

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen)
    }

    return (
        <Box className={`results-container ${isFullScreen ? 'full-screen' : ''}`}>
            {/* Results Header - Horizontal Layout */}
            <div className="results-header">
                <div className="results-header-left">
                    <CheckCircleIcon size={16} className="success-icon" />
                    <Text className="results-title">Query Results</Text>
                    <div className="results-badge">{rows.length} rows</div>
                </div>
                <div className="results-header-right">
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
                <table className="results-table">
                    <thead>
                        <tr>
                            <th className="row-index-header">#</th>
                            {columns.map((column, index) => (
                                <th key={index} className="column-header">
                                    <div className="column-header-content">
                                        <span className="column-name">{column}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row, rowIndex) => (
                            <tr key={startIndex + rowIndex} className="table-row">
                                <td className="row-index">{startIndex + rowIndex + 1}</td>
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="table-cell">
                                        <div className="cell-content">
                                            {row[column] !== null && row[column] !== undefined
                                                ? String(row[column])
                                                : <span className="null-value">NULL</span>
                                            }
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <div className="pagination-info">
                        {startIndex + 1}-{Math.min(endIndex, rows.length)} of {rows.length}
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
