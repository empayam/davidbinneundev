const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
    body:
      options.body && !isFormData && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function entityClient(pathname) {
  return {
    list: () => apiRequest(pathname),
    filter: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      });

      const suffix = params.size > 0 ? `?${params.toString()}` : "";
      return apiRequest(`${pathname}${suffix}`);
    },
    create: (data) => apiRequest(pathname, { method: "POST", body: data }),
    update: (id, data) => apiRequest(`${pathname}/${id}`, { method: "PUT", body: data }),
    delete: (id) => apiRequest(`${pathname}/${id}`, { method: "DELETE" }),
  };
}

async function me() {
  try {
    return await apiRequest("/auth/me");
  } catch (error) {
    if (error.status === 401) {
      return null;
    }

    throw error;
  }
}

async function login(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

async function register(credentials) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: credentials,
  });
}

async function logout() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

function redirectToLogin(nextPath = window.location.pathname) {
  const params = new URLSearchParams();
  if (nextPath) {
    params.set("next", nextPath);
  }

  window.location.assign(`/admin/login${params.size ? `?${params.toString()}` : ""}`);
}

function unsupportedIntegration(name) {
  return async () => {
    throw new Error(`${name} is not implemented in the migrated app.`);
  };
}

export const base44 = {
  entities: {
    Project: entityClient("/projects"),
    CTF: entityClient("/ctfs"),
    Course: entityClient("/courses"),
    SiteSettings: entityClient("/site-settings"),
  },
  auth: {
    me,
    login,
    register,
    logout,
    redirectToLogin,
  },
  integrations: {
    Core: {
      SendEmail: (payload) =>
        apiRequest("/integrations/send-email", {
          method: "POST",
          body: payload,
        }),
      UploadFile: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return apiRequest("/uploads", {
          method: "POST",
          body: formData,
        });
      },
      InvokeLLM: unsupportedIntegration("InvokeLLM"),
      GenerateImage: unsupportedIntegration("GenerateImage"),
      ExtractDataFromUploadedFile: unsupportedIntegration("ExtractDataFromUploadedFile"),
      CreateFileSignedUrl: unsupportedIntegration("CreateFileSignedUrl"),
      UploadPrivateFile: unsupportedIntegration("UploadPrivateFile"),
    },
  },
};
