class Logger {
    static info(message: string) {
        console.log(`INFO: ${message}`);
    }

    static error(message: any) {
        console.error(`ERROR: ${message}`);
    }
}

export default Logger;
