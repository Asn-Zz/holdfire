interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function _request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { headers = {}, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch (e) {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text as any as T;
  }
}

const get = <T>(url: string, params?: Record<string, any>, options: RequestOptions = {}): Promise<T> => {
  const urlWithParams = new URL(url);
  if (params) {
    Object.keys(params).forEach(key => urlWithParams.searchParams.append(key, String(params[key])));
  }
  return _request<T>(urlWithParams.toString(), { ...options, method: 'GET' });
};

const post = <T>(url:string, data?: any, options: RequestOptions = {}): Promise<T> => {
  return _request<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) });
};

export const request = {
  get,
  post,
};
