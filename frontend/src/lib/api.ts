export interface BranchSummary {
  branchCode: string;
  branchName?: string;
  cityCode?: string;
  isActive?: boolean;
}

export interface BranchDetail extends BranchSummary {
  companyCode?: string;
  locationCode?: string;
  phone?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
}

export interface UpsertBranchPayload {
  branchCode: string;
  branchName?: string;
  companyCode?: string;
  cityCode?: string;
  locationCode?: string;
  phone?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  isActive?: boolean;
}

export interface BranchMake {
  id: number;
  branchCode: string;
  makeCode: string;
  makeCodeId?: number;
  processTypeId?: number;
  isActive: boolean;
}

export interface UpsertBranchMakePayload {
  id?: number;
  branchCode: string;
  makeCode: string;
  makeCodeId?: number;
  processTypeId?: number;
  isActive: boolean;
}

export interface BranchPerson {
  id: number;
  branchCode: string;
  name: string;
  email?: string;
  accountName?: string;
  makeCodeId?: number;
  processTypeId?: number;
  photoUrl?: string;
  isActive: boolean;
}

export interface UpsertBranchPersonPayload {
  id?: number;
  branchCode: string;
  name: string;
  email?: string;
  accountName?: string;
  makeCodeId?: number;
  processTypeId?: number;
  photoUrl?: string;
  isActive: boolean;
}

export interface LookupOption {
  id: number;
  name: string;
}

interface MakeLookupResponse {
  id: number;
  makeCode: string;
}

interface ProcessTypeLookupResponse {
  id: number;
  processType: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5240";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const BranchApi = {
  list: () => apiFetch<BranchSummary[]>("/api/branches"),
  get: (branchCode: string) => apiFetch<BranchDetail>(`/api/branches/${branchCode}`),
  create: (payload: UpsertBranchPayload) =>
    apiFetch<BranchDetail>("/api/branches", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  update: (branchCode: string, payload: UpsertBranchPayload) =>
    apiFetch<void>(`/api/branches/${branchCode}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  changeActivation: (branchCode: string, isActive: boolean) =>
    apiFetch<void>(`/api/branches/${branchCode}/activation`, {
      method: "PATCH",
      body: JSON.stringify({ isActive })
    })
};

export const BranchMakeApi = {
  list: (branchCode: string) =>
    apiFetch<BranchMake[]>(`/api/branches/${branchCode}/makes`),
  create: (branchCode: string, payload: UpsertBranchMakePayload) =>
    apiFetch<BranchMake>(`/api/branches/${branchCode}/makes`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  update: (branchCode: string, id: number, payload: UpsertBranchMakePayload) =>
    apiFetch<void>(`/api/branches/${branchCode}/makes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  changeActivation: (branchCode: string, id: number, isActive: boolean) =>
    apiFetch<void>(`/api/branches/${branchCode}/makes/${id}/activation`, {
      method: "PATCH",
      body: JSON.stringify({ isActive })
    })
};

export const BranchPersonApi = {
  list: (branchCode: string) =>
    apiFetch<BranchPerson[]>(`/api/branches/${branchCode}/people`),
  create: (branchCode: string, payload: UpsertBranchPersonPayload) =>
    apiFetch<BranchPerson>(`/api/branches/${branchCode}/people`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  update: (branchCode: string, id: number, payload: UpsertBranchPersonPayload) =>
    apiFetch<void>(`/api/branches/${branchCode}/people/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  changeActivation: (branchCode: string, id: number, isActive: boolean) =>
    apiFetch<void>(`/api/branches/${branchCode}/people/${id}/activation`, {
      method: "PATCH",
      body: JSON.stringify({ isActive })
    })
};

export const LookupsApi = {
  makes: () =>
    apiFetch<MakeLookupResponse[]>("/api/lookups/makes").then((values) =>
      values.map((value) => ({ id: value.id, name: value.makeCode ?? "" }))
    ),
  processTypes: () =>
    apiFetch<ProcessTypeLookupResponse[]>("/api/lookups/process-types").then((values) =>
      values.map((value) => ({ id: value.id, name: value.processType ?? "" }))
    )
};
