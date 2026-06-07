import {redirect} from "react-router";

class NetworkManager {

    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
            'X-Tenant-Id': `${localStorage.getItem('tenantId')}`
        };
    }

    public async get<T>(url: string, parameters?: Map<string,string>): Promise<T> {

        let fullUrl = `${this.baseUrl}${url}`;

        if (parameters && parameters.size > 0) {
            const queryParams = new URLSearchParams();
            parameters.forEach((value, key) => {
                queryParams.append(key, value);
            });
            fullUrl += `?${queryParams.toString()}`;
        }

        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        this.checkStatus(response);

        return response.json();
    }

    public async post<T>(url: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        this.checkStatus(response);

        return response.json();
    }

    public async postFile<T>(url: string, file: File, additionalData?: Record<string, string>): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        // Add any additional form fields
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'POST',
            headers: {
                // Don't set Content-Type header - browser will set it with correct boundary
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
            },
            body: formData,
        });

        this.checkStatus(response);
        return response.json();
    }

    private checkStatus(response: Response) {
        if (response.status === 401) {
            this.clearAuth();
            throw redirect('/login');
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
    }

    private clearAuth() {
        ['accessToken', 'idToken', 'refreshToken'].forEach(key =>
            localStorage.removeItem(key)
        );
    }
}

export const networkManager = new NetworkManager('http://localhost:5100');