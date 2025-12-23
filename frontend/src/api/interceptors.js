let isHandling401 = false;

export function setupInterceptors(api, onUnauthorized) {
    api.interceptors.response.use(
        (response) => response,

        async (error) => {
            const status = error.response?.status;
            const url = error.config?.url ?? "";

            const isAuthRequest =
                url.includes("/auth/login") ||
                url.includes("/auth/register") ||
                url.includes("/auth/me");

            if (status === 401 && !isAuthRequest && !isHandling401) {
                isHandling401 = true;

                try {
                    await onUnauthorized();
                } finally {
                    isHandling401 = false;
                }
            }

            return Promise.reject(error);
        }
    );
}
