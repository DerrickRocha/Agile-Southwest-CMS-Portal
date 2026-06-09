import {redirect} from "react-router";

interface RequestOptions {
    requireTenant?: boolean;
    timeout?: number;
    includeAuth?: boolean;
}

class NetworkManager {

    private readonly baseUrl: string;
    private readonly defaultTimeout = 30000;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders(includeTenantId: boolean = true, includeAuth: boolean = true): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const idToken = localStorage.getItem('idToken');
            if (idToken) {
                headers['Authorization'] = `Bearer ${idToken}`;
            }
        }

        if (includeTenantId) {
            const tenantId = localStorage.getItem('tenantId');
            if (tenantId) {
                headers['X-Tenant-Id'] = tenantId;
            }
        }

        return headers;
    }

    private async fetchWithTimeout<T>(
        url: string,
        options: RequestInit,
        timeout: number
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            await this.checkStatus(response);
            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout', { cause: error });
            }
            throw error;
        }
    }

    public async get<T>(
        url: string,
        parameters?: Map<string, string>,
        options: RequestOptions = {}
    ): Promise<T> {
        let fullUrl = `${this.baseUrl}${url}`;

        if (parameters && parameters.size > 0) {
            const queryParams = new URLSearchParams();
            parameters.forEach((value, key) => {
                queryParams.append(key, value);
            });
            fullUrl += `?${queryParams.toString()}`;
        }

        return this.fetchWithTimeout<T>(
            fullUrl,
            {
                method: 'GET',
                headers: this.getHeaders(options.requireTenant, options.includeAuth),
            },
            options.timeout || this.defaultTimeout
        );
    }

    public async post<T, D = Record<string, unknown>>(
        url: string,
        data: D,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.fetchWithTimeout<T>(
            `${this.baseUrl}${url}`,
            {
                method: 'POST',
                headers: this.getHeaders(options.requireTenant, options.includeAuth),
                body: JSON.stringify(data),
            },
            options.timeout || this.defaultTimeout
        );
    }

    public async put<T, D = Record<string, unknown>>(url: string, data: D, options: RequestOptions = {}): Promise<T> {
        return this.fetchWithTimeout<T>(
            `${this.baseUrl}${url}`,
            {
                method: 'PUT',
                headers: this.getHeaders(options.requireTenant, options.includeAuth),
                body: JSON.stringify(data),
            },
            options.timeout || this.defaultTimeout
        );
    }

    public async postFile<T>(url: string, file: File, additionalData?: Record<string, string>): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
            },
            body: formData,
        });

        await this.checkStatus(response);
        return response.json();
    }

    private async checkStatus(response: Response): Promise<void> {
        if (response.status === 401) {
            this.clearAuth();
            throw redirect('/login');
        }

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.message || errorBody.error || errorMessage;
            } catch {
                // Response is not JSON, use status text
            }
            throw new Error(errorMessage);
        }
    }

    private clearAuth() {
        ['accessToken', 'idToken', 'refreshToken', 'tenantId'].forEach(key =>
            localStorage.removeItem(key)
        );
    }
}

export const networkManager = new NetworkManager('http://localhost:5100');