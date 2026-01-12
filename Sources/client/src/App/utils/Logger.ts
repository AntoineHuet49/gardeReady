/**
 * Logger utilitaire pour le client GardeReady
 * Fournit des méthodes de logging formatées avec couleurs et contexte
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
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
                console.error(`  └─ Message: ${error.message}`);
                if (error.stack) {
                    console.error(`  └─ Stack:`, error.stack);
                }
            } else if (error && typeof error === 'object') {
                console.error(`  └─ Details:`, error);
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
     * Log pour données envoyées avec emoji 📤
     */
    public sent(message: string, data: unknown): void {
        if (Logger.logLevel <= LogLevel.DEBUG) {
            this.log('📤', 'SENT', message, data);
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
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 12); // HH:mm:ss.SSS
        const contextStr = `[${this.context}]`;
        
        console.log(`${emoji} ${timestamp} ${level.padEnd(8)} ${contextStr} ${message}`);
        
        if (data !== undefined) {
            if (typeof data === 'object') {
                console.log(`  └─ Data:`, data);
            } else {
                console.log(`  └─ Data:`, data);
            }
        }
    }

    /**
     * Log une erreur Axios avec détails
     */
    public axiosError(message: string, error: unknown): void {
        this.error(message);
        
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
                response?: { 
                    status?: number; 
                    statusText?: string;
                    data?: unknown 
                };
                config?: { 
                    url?: string; 
                    method?: string; 
                    baseURL?: string; 
                    data?: string 
                };
            };
            
            console.error(`  └─ Axios Details:`);
            if (axiosError.response) {
                console.error(`     ├─ Status: ${axiosError.response.status} ${axiosError.response.statusText || ''}`);
                console.error(`     ├─ Data:`, axiosError.response.data);
            }
            if (axiosError.config) {
                const fullUrl = `${axiosError.config.baseURL || ''}${axiosError.config.url || ''}`;
                console.error(`     └─ Request:`, {
                    method: axiosError.config.method?.toUpperCase(),
                    url: fullUrl,
                    data: axiosError.config.data
                });
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
    const isDevelopment = import.meta.env.DEV;
    const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase();
    
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
        case 'NONE':
            Logger.setLogLevel(LogLevel.NONE);
            break;
        default:
            // Par défaut en DEBUG pour le développement, INFO pour la production
            Logger.setLogLevel(isDevelopment ? LogLevel.DEBUG : LogLevel.INFO);
    }
    
    const logger = new Logger('Application');
    logger.info(`Log level configured: ${LogLevel[Logger['logLevel']]}`);
}
