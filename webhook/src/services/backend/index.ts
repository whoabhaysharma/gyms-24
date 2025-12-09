import { config } from '../../config/config';
import { IBackendService } from './interface';
import { MockBackendService } from './mock';
import { RealBackendService } from './real';
import { logWithContext } from '../../utils/logger';

let backendService: IBackendService;

if (config.backend.useMock) {
    logWithContext('BackendFactory', 'Using Mock Backend Service');
    backendService = new MockBackendService();
} else {
    logWithContext('BackendFactory', 'Using Real Backend Service');
    backendService = new RealBackendService();
}

export const BackendService = backendService;
export * from './interface';
