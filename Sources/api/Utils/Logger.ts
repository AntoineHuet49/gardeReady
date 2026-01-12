/**
 * Logger utilitaire pour l'application GardeReady
 * Fournit des méthodes de logging formatées avec couleurs et contexte
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private context: string;
    private static logLevel: LogLevel = LogLevel.DEBUG;

    constructor(context: string) {
        this.context = context;
    }

    /**
     * Configure le niveau de log global
     */
    public static setLogLevel(level: LogLevel): void {
        Logger.logLevel = level;
    }

    /**
     * Log de debug avec emoji 🔵
     */
    public debug(message: string, data?: unknown): void {
        if (Logger.logLevel <= LogLevel.DEBUG) {
            this.log('🔵', 'DEBUG', message, data);
        }
    }

    /**
     * Log d'information avec emoji ℹ️
     */
    public info(message: string, data?: unknown): void {
        if (Logger.logLevel <= LogLevel.INFO) {
            this.log('ℹ️', 'INFO', message, data);
        }
    }

    /**
     * Log d'avertissement avec emoji ⚠️
     */
    public warn(message: string, data?: unknown): void {
        if (Logger.logLevel <= LogLevel.WARN) {
            this.log('⚠️', 'WARN', message, data);
        }
    }

    /**
     * Log d'erreur avec emoji ❌
     */
    public error(message: string, error?: unknown): void {
        if (Logger.logLevel <= LogLevel.ERROR) {
            this.log('❌', 'ERROR', message);
            
            if (error instanceof Error) {
                console.error(`  └─ Type: ${error.constructor.name}`);
                console.error(`  └─ Message: ${error.message}`);
                if (error.stack) {
                    console.error(`  └─ Stack:\n${this.indentStack(error.stack)}`);
                }
            } else if (error && typeof error === 'object') {
                console.error(`  └─ Details:`, JSON.stringify(error, null, 2));
            } else if (error) {
                console.error(`  └─ Error:`, error);
            }
        }
    }

    /**
     * Log de succès avec emoji ✅
     */
    public success(message: string, data?: unknown): void {
        if (Logger.logLevel <= LogLevel.INFO) {
            this.log('✅', 'SUCCESS', message, data);
        }
    }

    /**
     * Log pour données reçues avec emoji 📥
     */
    public received(message: string, data: unknown): void {
        if (Logger.logLevel <= LogLevel.DEBUG) {
            this.log('📥', 'RECEIVED', message, data);
        }
    }

    /**
     * Log pour données envoyées avec emoji 📤
     */
    public sent(message: string, data: unknown): void {
        if (Logger.logLevel <= LogLevel.DEBUG) {
            this.log('📤', 'SENT', message, data);
        }
    }

    /**
     * Log pour opérations de base de données avec emoji 💾
     */
    public database(message: string, data?: unknown): void {
        if (Logger.logLevel <= LogLevel.DEBUG) {
            this.log('💾', 'DATABASE', message, data);
        }
    }

    /**
     * Log pour les requêtes HTTP avec emoji 🌐
     */
    public http(message: string, data?: unknown): void {
        if (Logger.logLevel <= LogLevel.DEBUG) {
            this.log('🌐', 'HTTP', message, data);
        }
    }

    /**
     * Méthode de log interne
     */
    private log(emoji: string, level: string, message: string, data?: unknown): void {
        const timestamp = new Date().toISOString();
        const contextStr = `[${this.context}]`;
        
        console.log(`${emoji} ${timestamp} ${level.padEnd(8)} ${contextStr} ${message}`);
        
        if (data !== undefined) {
            if (typeof data === 'object') {
                console.log(`  └─ Data:`, JSON.stringify(data, this.getCircularReplacer(), 2));
            } else {
                console.log(`  └─ Data:`, data);
            }
        }
    }

    /**
     * Indente le stack trace pour une meilleure lisibilité
     */
    private indentStack(stack: string): string {
        return stack.split('\n').map(line => `     ${line}`).join('\n');
    }

    /**
     * Remplace les références circulaires par [Circular]
     */
    private getCircularReplacer() {
        const seen = new WeakSet();
        return (key: string, value: unknown) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        };
    }

    /**
     * Log une erreur Sequelize avec détails
     */
    public sequelizeError(message: string, error: unknown): void {
        this.error(message);
        
        if (error && typeof error === 'object' && 'name' in error) {
            const err = error as {
                name?: string;
                sql?: string;
                parameters?: unknown[];
                fields?: unknown;
                original?: unknown;
            };
            
            console.error(`  └─ Sequelize Details:`);
            if (err.name) console.error(`     ├─ Name: ${err.name}`);
            if (err.sql) console.error(`     ├─ SQL: ${err.sql}`);
            if (err.parameters) console.error(`     ├─ Parameters:`, err.parameters);
            if (err.fields) console.error(`     ├─ Fields:`, err.fields);
            if (err.original) console.error(`     └─ Original:`, err.original);
        }
    }

    /**
     * Log les détails d'une requête HTTP
     */
    public httpRequest(req: {
        method?: string;
        url?: string;
        body?: unknown;
        headers?: Record<string, unknown>;
    }): void {
        if (Logger.logLevel <= LogLevel.DEBUG) {
            this.log('🌐', 'HTTP REQ', `${req.method} ${req.url}`);
            
            if (req.headers) {
                console.log(`  ├─ Headers:`, {
                    'content-type': req.headers['content-type'],
                    'origin': req.headers['origin'],
                    'referer': req.headers['referer']
                });
            }
            
            if (req.body && Object.keys(req.body as object).length > 0) {
                console.log(`  └─ Body:`, JSON.stringify(req.body, null, 2));
            }
        }
    }
}

/**
 * Factory pour créer des loggers avec contexte
 */
export function createLogger(context: string): Logger {
    return new Logger(context);
}

/**
 * Configure le niveau de log depuis les variables d'environnement
 */
export function configureLogLevel(): void {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    
    switch (envLevel) {
        case 'DEBUG':
            Logger.setLogLevel(LogLevel.DEBUG);
            break;
        case 'INFO':
            Logger.setLogLevel(LogLevel.INFO);
            break;
        case 'WARN':
            Logger.setLogLevel(LogLevel.WARN);
            break;
        case 'ERROR':
            Logger.setLogLevel(LogLevel.ERROR);
            break;
        default:
            // Par défaut en DEBUG pour le développement
            Logger.setLogLevel(process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG);
    }
    
    const logger = new Logger('Application');
    logger.info(`Log level configured: ${LogLevel[Logger['logLevel']]}`);
}
