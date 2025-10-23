
type APIConfig = {
    fileserverHits: number;
    dbURL: string;
};

process.loadEnvFile();

function envOrThrow(key: string){
    const value = process.env[key];
    if (!value){
        throw new Error(`Missing key: ${key}`);
    }
     return value;
}
export const config: APIConfig = {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL"),
};

