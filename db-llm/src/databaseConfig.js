// Database configuration with connection details
import mysqlLogo from './assets/mysql-logo.png'
import postgresqlLogo from './assets/postgresql-logo.png'
import mongodbLogo from './assets/mongodb-logo.png'
import snowflakeLogo from './assets/snowflake-logo.png'
import bigqueryLogo from './assets/bigquery-logo.png'
import databricksLogo from './assets/databricks-logo.png'

export const databases = [
    {
        id: 'mysql',
        name: 'MySQL',
        category: 'Relational',
        description: 'Open-source relational database management system',
        logo: mysqlLogo,
        available: true,
        connectionFields: [
            { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
            { name: 'port', label: 'Port', type: 'number', placeholder: '3306', required: true },
            { name: 'database', label: 'Database Name', type: 'text', placeholder: 'mydb', required: true },
            { name: 'user', label: 'Username', type: 'text', placeholder: 'root', required: true },
            { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
        ]
    },
    {
        id: 'postgresql',
        name: 'PostgreSQL',
        category: 'Relational',
        description: 'Advanced open-source relational database',
        logo: postgresqlLogo,
        available: true,
        connectionFields: [
            { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
            { name: 'port', label: 'Port', type: 'number', placeholder: '5432', required: true },
            { name: 'database', label: 'Database Name', type: 'text', placeholder: 'postgres', required: true },
            { name: 'user', label: 'Username', type: 'text', placeholder: 'postgres', required: true },
            { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
        ]
    },
    {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'NoSQL',
        description: 'Document-oriented NoSQL database',
        logo: mongodbLogo,
        available: true,
        usesConnectionString: true,
        connectionFields: [
            {
                name: 'connectionString',
                label: 'Connection String',
                type: 'textarea',
                placeholder: 'mongodb+srv://cluster.mongodb.net/',
                required: true,
                helpText: 'The connection URI. You can omit credentials here and use the fields below if preferred.'
            },
            {
                name: 'username',
                label: 'Username (Optional)',
                type: 'text',
                placeholder: 'myUser',
                required: false,
                helpText: 'Overrides username in connection string'
            },
            {
                name: 'password',
                label: 'Password (Optional)',
                type: 'password',
                placeholder: '••••••••',
                required: false,
                helpText: 'Overrides password in connection string'
            }
        ]
    },
    // {
    //     id: 'snowflake',
    //     name: 'Snowflake',
    //     category: 'Data Warehouse',
    //     description: 'Cloud-based data warehousing platform',
    //     logo: snowflakeLogo,
    //     available: false,
    //     comingSoon: true,
    //     connectionFields: [
    //         { name: 'account', label: 'Account', type: 'text', placeholder: 'xy12345.us-east-1', required: true },
    //         { name: 'warehouse', label: 'Warehouse', type: 'text', placeholder: 'COMPUTE_WH', required: true },
    //         { name: 'database', label: 'Database', type: 'text', placeholder: 'MYDB', required: true },
    //         { name: 'schema', label: 'Schema', type: 'text', placeholder: 'PUBLIC', required: true },
    //         { name: 'username', label: 'Username', type: 'text', placeholder: 'user', required: true },
    //         { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
    //     ]
    // },
    // {
    //     id: 'bigquery',
    //     name: 'BigQuery',
    //     category: 'Data Warehouse',
    //     description: 'Google Cloud serverless data warehouse',
    //     logo: bigqueryLogo,
    //     available: false,
    //     comingSoon: true,
    //     connectionFields: [
    //         { name: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-project-123', required: true },
    //         { name: 'dataset', label: 'Dataset', type: 'text', placeholder: 'my_dataset', required: true },
    //         { name: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: 'Paste service account JSON', required: true },
    //     ]
    // },
    // {
    //     id: 'databricks',
    //     name: 'Databricks',
    //     category: 'Data Warehouse',
    //     description: 'Unified analytics platform built on Apache Spark',
    //     logo: databricksLogo,
    //     available: false,
    //     comingSoon: true,
    //     connectionFields: [
    //         { name: 'host', label: 'Server Hostname', type: 'text', placeholder: 'dbc-xxx.cloud.databricks.com', required: true },
    //         { name: 'httpPath', label: 'HTTP Path', type: 'text', placeholder: 'sql/protocolv1/o/xxx', required: true },
    //         { name: 'token', label: 'Access Token', type: 'password', placeholder: 'dapi***', required: true },
    //     ]
    // },
    // {
    //     id: 'deltalake',
    //     name: 'Delta Lake',
    //     category: 'Data Lake',
    //     description: 'Open-source storage layer for data lakes',
    //     icon: '🔺',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'dynamodb',
    //     name: 'DynamoDB',
    //     category: 'NoSQL',
    //     description: 'AWS fully managed NoSQL database',
    //     icon: '⚡',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'redshift',
    //     name: 'Redshift',
    //     category: 'Data Warehouse',
    //     description: 'AWS cloud data warehouse',
    //     icon: '🔴',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'sqlite',
    //     name: 'SQLite',
    //     category: 'Relational',
    //     description: 'Lightweight embedded database',
    //     icon: '🪶',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'mariadb',
    //     name: 'MariaDB',
    //     category: 'Relational',
    //     description: 'MySQL fork with enhanced features',
    //     icon: '🦭',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'cassandra',
    //     name: 'Cassandra',
    //     category: 'NoSQL',
    //     description: 'Distributed wide-column store',
    //     icon: '🎯',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'oracle',
    //     name: 'Oracle',
    //     category: 'Relational',
    //     description: 'Enterprise relational database',
    //     icon: '🏛️',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'mssql',
    //     name: 'SQL Server',
    //     category: 'Relational',
    //     description: 'Microsoft SQL Server',
    //     icon: '🪟',
    //     available: false,
    //     comingSoon: true,
    // },
    // {
    //     id: 'clickhouse',
    //     name: 'ClickHouse',
    //     category: 'Data Warehouse',
    //     description: 'Fast columnar database for analytics',
    //     icon: '⚙️',
    //     available: false,
    //     comingSoon: true,
    // },
]
