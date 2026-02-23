const BASE_URL = '/api';

const getToken = () => localStorage.getItem('token');

const request = async(endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        ...(options.body && !(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
        body: options.body instanceof FormData ? options.body :
            options.body ? JSON.stringify(options.body) :
            undefined,
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const error = new Error(data.message || 'Request failed');
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
};

// Auth API
export const authApi = {
    register: (body) => request('/auth/register', { method: 'POST', body }),
    login: (body) => request('/auth/login', { method: 'POST', body }),
    me: () => request('/auth/me'),
};

// Expenses API
export const expensesApi = {
    getAll: (params = {}) => request(`/expenses?${new URLSearchParams(params)}`),
    getOne: (id) => request(`/expenses/${id}`),
    create: (body) => request('/expenses', { method: 'POST', body }),
    createWithFile: (formData) => request('/expenses', { method: 'POST', body: formData }),
    update: (id, body) => request(`/expenses/${id}`, { method: 'PUT', body }),
    updateWithFile: (id, formData) => request(`/expenses/${id}`, { method: 'PUT', body: formData }),
    delete: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
    getSummary: (params = {}) => request(`/expenses/summary?${new URLSearchParams(params)}`),
    export: (params = {}) => `${BASE_URL}/expenses/export?${new URLSearchParams(params)}&token=${getToken()}`,
};

// Categories API
export const categoriesApi = {
    getAll: () => request('/categories'),
    create: (body) => request('/categories', { method: 'POST', body }),
    update: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// Budgets API
export const budgetsApi = {
    getAll: (params = {}) => request(`/budgets?${new URLSearchParams(params)}`),
    create: (body) => request('/budgets', { method: 'POST', body }),
    update: (id, body) => request(`/budgets/${id}`, { method: 'PUT', body }),
    delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
};

// User API
export const userApi = {
    getProfile: () => request('/users/profile'),
    updateProfile: (formData) => request('/users/profile', { method: 'PUT', body: formData }),
    changePassword: (body) => request('/users/change-password', { method: 'PUT', body }),
};