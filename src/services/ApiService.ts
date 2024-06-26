import * as XLSX from 'xlsx';
import { ProcessDetails } from '../interfaces/ProcessDetails';

class ApiService {
    public createExcel(processDetails: ProcessDetails): Buffer {
        const ws = XLSX.utils.json_to_sheet([processDetails]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ProcessDetails');
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }

    public paginateMovements(movimentos: string[], page: number, pageSize: number): string[] {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return movimentos.slice(start, end);
    }
}

export default ApiService;
