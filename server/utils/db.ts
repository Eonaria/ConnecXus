/**
 * server/utils/db.ts
 * MySQL connection pool — lazy initialized, shared across all Nitro requests
 */
import mysql from 'mysql2/promise'

let _pool: mysql.Pool | null = null

export function getDb(): mysql.Pool {
  if (_pool) return _pool

  const config = useRuntimeConfig()

  _pool = mysql.createPool({
    host:               (config.dbHost as string)     || 'localhost',
    port:               Number(config.dbPort)          || 3306,
    user:               (config.dbUser as string)     || 'root',
    password:           (config.dbPassword as string) || '',
    database:           (config.dbName as string)     || 'connecxus_db',
    waitForConnections: true,
    connectionLimit:    30,
    maxIdle:            15,
    idleTimeout:        60000,
    queueLimit:         0,
    enableKeepAlive:    true,
    keepAliveInitialDelay: 10000,
    connectTimeout:     10000,
    charset:            'utf8mb4',
    timezone:           '+07:00',
  })

  return _pool
}
