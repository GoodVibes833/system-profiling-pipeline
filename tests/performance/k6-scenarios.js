import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3002';

const testProfiles = {
    smoke: {
        vus: 1,
        duration: '10s',
        tags: { type: 'smoke' }
    },
    stress: {
        stages: [
            { duration: '5s', target: 10 },
            { duration: '15s', target: 50 },
            { duration: '10s', target: 0 },
        ],
        tags: { type: 'stress' }
    },
    spike: {
        stages: [
            { duration: '2s', target: 5 },
            { duration: '3s', target: 100 },
            { duration: '10s', target: 100 },
            { duration: '5s', target: 0 },
        ],
        tags: { type: 'spike' }
    },
    soak: {
        stages: [
            { duration: '30s', target: 20 },
            { duration: '30s', target: 20 },
            { duration: '10s', target: 0 },
        ],
        tags: { type: 'soak' }
    }
};

const profile = __ENV.TEST_TYPE || 'smoke';
export const options = testProfiles[profile];

export default function () {
    const endpoints = [
        `${BASE_URL}/fast`,
        `${BASE_URL}/cpu-heavy`,
        `${BASE_URL}/memory-leak`,
    ];
    const res = http.get(endpoints[Math.floor(Math.random() * endpoints.length)]);
    check(res, { 'status was 200': (r) => r.status === 200 });
    sleep(1);
}
