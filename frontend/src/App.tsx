import { useEffect, useMemo, useState } from "react";
import {
  BranchApi,
  BranchMakeApi,
  BranchPersonApi,
  LookupsApi,
  type BranchDetail,
  type LookupOption,
  type UpsertBranchMakePayload,
  type UpsertBranchPayload,
  type UpsertBranchPersonPayload
} from "./lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function App() {
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({ queryKey: ["branches"], queryFn: BranchApi.list });
  const [selectedBranchCode, setSelectedBranchCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const branchDetailQuery = useQuery({
    queryKey: ["branch", selectedBranchCode],
    queryFn: () => BranchApi.get(selectedBranchCode!),
    enabled: !!selectedBranchCode && !isCreating
  });

  useEffect(() => {
    if (!selectedBranchCode && branchesQuery.data?.length) {
      setSelectedBranchCode(branchesQuery.data[0].branchCode);
    }
  }, [branchesQuery.data, selectedBranchCode]);

  const startCreate = () => {
    setSelectedBranchCode(null);
    setIsCreating(true);
  };

  const handleSelect = (code: string) => {
    setSelectedBranchCode(code);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white py-4 shadow">
        <div className="container mx-auto px-6">
          <h1 className="text-2xl font-semibold">Şube Yetki Yönetimi</h1>
          <p className="text-slate-300 text-sm">Şubeleri, marka yetkilerini ve personelleri kolayca yönetin.</p>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-lg bg-white shadow border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-700">Şubeler</h2>
            <button
              onClick={startCreate}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Yeni Şube
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {branchesQuery.isLoading && <p className="p-4 text-sm text-slate-500">Şubeler yükleniyor...</p>}
            {branchesQuery.isError && (
              <p className="p-4 text-sm text-red-600">Şubeler alınırken bir hata oluştu.</p>
            )}
            <ul className="divide-y divide-slate-200">
              {branchesQuery.data?.map((branch) => (
                <li key={branch.branchCode}>
                  <button
                    onClick={() => handleSelect(branch.branchCode)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-slate-100 ${
                      (!isCreating && selectedBranchCode === branch.branchCode) ? "bg-slate-200" : ""
                    }`}
                  >
                    <span>
                      <span className="font-medium text-slate-700">{branch.branchCode}</span>
                      {branch.branchName && <span className="ml-2 text-slate-500">{branch.branchName}</span>}
                    </span>
                    <StatusPill active={branch.isActive ?? false} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="space-y-6">
          <BranchEditor
            key={isCreating ? "new" : selectedBranchCode ?? "none"}
            mode={isCreating ? "create" : "edit"}
            branch={isCreating ? null : branchDetailQuery.data ?? null}
            onCreated={(branch) => {
              queryClient.invalidateQueries({ queryKey: ["branches"] });
              setIsCreating(false);
              setSelectedBranchCode(branch.branchCode);
            }}
            onUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ["branches"] });
              if (selectedBranchCode) {
                queryClient.invalidateQueries({ queryKey: ["branch", selectedBranchCode] });
              }
            }}
            isLoading={!isCreating && branchDetailQuery.isLoading}
          />
          {!isCreating && selectedBranchCode && (
            <div className="grid gap-6 lg:grid-cols-2">
              <BranchMakesManager branchCode={selectedBranchCode} />
              <BranchPeopleManager branchCode={selectedBranchCode} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {active ? "Aktif" : "Pasif"}
    </span>
  );
}

type BranchEditorProps = {
  mode: "create" | "edit";
  branch: BranchDetail | null;
  onCreated: (branch: BranchDetail) => void;
  onUpdated: () => void;
  isLoading: boolean;
};

function BranchEditor({ mode, branch, onCreated, onUpdated, isLoading }: BranchEditorProps) {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<UpsertBranchPayload>(() =>
    branch ?? {
      branchCode: "",
      branchName: "",
      companyCode: "",
      cityCode: "",
      locationCode: "",
      phone: "",
      address: "",
      latitude: "",
      longitude: "",
      isActive: true
    }
  );

  useEffect(() => {
    if (branch) {
      setFormState({
        branchCode: branch.branchCode,
        branchName: branch.branchName,
        companyCode: branch.companyCode,
        cityCode: branch.cityCode,
        locationCode: branch.locationCode,
        phone: branch.phone,
        address: branch.address,
        latitude: branch.latitude,
        longitude: branch.longitude,
        isActive: branch.isActive ?? true
      });
    } else if (mode === "create") {
      setFormState({
        branchCode: "",
        branchName: "",
        companyCode: "",
        cityCode: "",
        locationCode: "",
        phone: "",
        address: "",
        latitude: "",
        longitude: "",
        isActive: true
      });
    }
  }, [branch, mode]);

  const createMutation = useMutation({
    mutationFn: BranchApi.create,
    onSuccess: (data) => onCreated(data)
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpsertBranchPayload) => BranchApi.update(payload.branchCode, payload),
    onSuccess: () => onUpdated()
  });

  const activationMutation = useMutation({
    mutationFn: (isActive: boolean) => BranchApi.changeActivation(formState.branchCode, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", formState.branchCode] });
      setFormState((prev) => ({ ...prev, isActive: variables }));
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending || activationMutation.isPending;
  const disableFields = mode === "edit";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.branchCode) return;

    if (mode === "create") {
      createMutation.mutate(formState);
    } else {
      updateMutation.mutate(formState);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-700">
          {mode === "create" ? "Yeni Şube Oluştur" : formState.branchCode}
        </h2>
        <p className="text-sm text-slate-500">
          {mode === "create"
            ? "Yeni şubeyi eklemek için bilgileri doldurun."
            : "Şube bilgilerini düzenleyin ve durumunu değiştirin."}
        </p>
      </div>
      <form className="grid gap-4 px-6 py-5" onSubmit={handleSubmit}>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-slate-600" htmlFor="branchCode">
            Şube Kodu
          </label>
          <input
            id="branchCode"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={formState.branchCode}
            onChange={(event) => setFormState((prev) => ({ ...prev, branchCode: event.target.value.toUpperCase() }))}
            disabled={mode === "edit"}
            required
            maxLength={10}
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-slate-600" htmlFor="branchName">
            Şube Adı
          </label>
          <input
            id="branchName"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={formState.branchName ?? ""}
            onChange={(event) => setFormState((prev) => ({ ...prev, branchName: event.target.value }))}
            maxLength={150}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput label="Şirket Kodu" value={formState.companyCode ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, companyCode: value }))} maxLength={10} />
          <TextInput label="Şehir Kodu" value={formState.cityCode ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, cityCode: value }))} maxLength={10} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput label="Lokasyon Kodu" value={formState.locationCode ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, locationCode: value }))} maxLength={10} />
          <TextInput label="Telefon" value={formState.phone ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, phone: value }))} maxLength={50} />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-slate-600" htmlFor="address">
            Adres
          </label>
          <textarea
            id="address"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            rows={3}
            value={formState.address ?? ""}
            onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TextInput label="Enlem" value={formState.latitude ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, latitude: value }))} maxLength={50} />
          <TextInput label="Boylam" value={formState.longitude ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, longitude: value }))} maxLength={50} />
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          {mode === "edit" && (
            <button
              type="button"
              className={`rounded px-3 py-2 text-sm font-medium ${formState.isActive ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
              onClick={() => activationMutation.mutate(!formState.isActive)}
              disabled={activationMutation.isPending}
            >
              {formState.isActive ? "Pasifleştir" : "Aktifleştir"}
            </button>
          )}
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
            disabled={isSaving}
          >
            {mode === "create" ? "Şubeyi Kaydet" : "Güncelle"}
          </button>
        </div>
        {(createMutation.error || updateMutation.error || activationMutation.error) && (
          <p className="text-sm text-rose-600">
            {(createMutation.error || updateMutation.error || activationMutation.error)?.message || "Bir hata oluştu"}
          </p>
        )}
        {isLoading && <p className="text-sm text-slate-500">Şube bilgileri yükleniyor...</p>}
      </form>
    </div>
  );
}

function TextInput({ label, value, onChange, maxLength }: { label: string; value: string; onChange: (value: string) => void; maxLength?: number }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-600" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
      />
    </div>
  );
}

type BranchMakesManagerProps = {
  branchCode: string;
};

function BranchMakesManager({ branchCode }: BranchMakesManagerProps) {
  const queryClient = useQueryClient();
  const makesQuery = useQuery({ queryKey: ["makes"], queryFn: LookupsApi.makes });
  const processTypesQuery = useQuery({ queryKey: ["processTypes"], queryFn: LookupsApi.processTypes });
  const branchMakesQuery = useQuery({
    queryKey: ["branch-makes", branchCode],
    queryFn: () => BranchMakeApi.list(branchCode)
  });

  const [formState, setFormState] = useState<UpsertBranchMakePayload>({
    branchCode,
    makeCode: "",
    makeCodeId: undefined,
    processTypeId: undefined,
    isActive: true
  });

  useEffect(() => {
    setFormState({ branchCode, makeCode: "", makeCodeId: undefined, processTypeId: undefined, isActive: true });
  }, [branchCode]);

  const createMutation = useMutation({
    mutationFn: (payload: UpsertBranchMakePayload) => BranchMakeApi.create(branchCode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-makes", branchCode] });
      setFormState({ branchCode, makeCode: "", makeCodeId: undefined, processTypeId: undefined, isActive: true });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpsertBranchMakePayload) => BranchMakeApi.update(branchCode, payload.id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-makes", branchCode] });
      setFormState({ branchCode, makeCode: "", makeCodeId: undefined, processTypeId: undefined, isActive: true });
    }
  });

  const activationMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      BranchMakeApi.changeActivation(branchCode, id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-makes", branchCode] });
    }
  });

  const editing = useMemo(() => (formState.id ? branchMakesQuery.data?.find((item) => item.id === formState.id) ?? null : null), [formState.id, branchMakesQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.makeCode) return;

    if (formState.id) {
      updateMutation.mutate(formState);
    } else {
      createMutation.mutate(formState);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-700">Marka Yetkileri</h3>
        <p className="text-xs text-slate-500">Bu şubenin farklı süreçlerde yetkili olduğu markaları yönetin.</p>
      </div>
      <div className="px-4 py-4 space-y-4">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <SelectInput
            label="Marka"
            options={makesQuery.data?.map((option) => ({ id: option.id, name: option.name })) ?? []}
            value={formState.makeCodeId?.toString() ?? ""}
            onChange={(value) => {
              const selected = makesQuery.data?.find((m) => m.id.toString() === value);
              setFormState((prev) => ({
                ...prev,
                makeCodeId: selected ? selected.id : undefined,
                makeCode: selected ? selected.name : ""
              }));
            }}
            placeholder="Marka seçin"
          />
          <SelectInput
            label="İşlem Tipi"
            options={processTypesQuery.data ?? []}
            value={formState.processTypeId?.toString() ?? ""}
            onChange={(value) =>
              setFormState((prev) => ({ ...prev, processTypeId: value ? Number(value) : undefined }))
            }
            placeholder="İşlem tipi seçin"
          />
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-600">Durum</label>
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(event) => setFormState((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
          </div>
          <button
            type="submit"
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {formState.id ? "Yetkiyi Güncelle" : "Yetki Ekle"}
          </button>
          {(createMutation.error || updateMutation.error) && (
            <p className="text-sm text-rose-600">Bir hata oluştu.</p>
          )}
        </form>
        <div className="space-y-2">
          {branchMakesQuery.isLoading && <p className="text-sm text-slate-500">Markalar yükleniyor...</p>}
          <ul className="space-y-2">
            {branchMakesQuery.data?.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-700">{item.makeCode}</p>
                  <p className="text-xs text-slate-500">İşlem Tipi Id: {item.processTypeId ?? "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill active={item.isActive} />
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => setFormState({
                      branchCode,
                      id: item.id,
                      makeCode: item.makeCode,
                      makeCodeId: item.makeCodeId,
                      processTypeId: item.processTypeId,
                      isActive: item.isActive
                    })}
                  >
                    Düzenle
                  </button>
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() =>
                      activationMutation.mutate({ id: item.id, isActive: !item.isActive })
                    }
                  >
                    {item.isActive ? "Pasif" : "Aktif"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {editing && (
          <button
            className="text-xs text-slate-500 underline"
            onClick={() =>
              setFormState({ branchCode, makeCode: "", makeCodeId: undefined, processTypeId: undefined, isActive: true })
            }
          >
            Yeni yetki eklemeye dön
          </button>
        )}
      </div>
    </div>
  );
}

type SelectInputProps = {
  label: string;
  options: LookupOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function SelectInput({ label, options, value, onChange, placeholder }: SelectInputProps) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-600" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder ?? "Seçin"}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

type BranchPeopleManagerProps = {
  branchCode: string;
};

function BranchPeopleManager({ branchCode }: BranchPeopleManagerProps) {
  const queryClient = useQueryClient();
  const makesQuery = useQuery({ queryKey: ["makes"], queryFn: LookupsApi.makes });
  const processTypesQuery = useQuery({ queryKey: ["processTypes"], queryFn: LookupsApi.processTypes });
  const peopleQuery = useQuery({
    queryKey: ["branch-people", branchCode],
    queryFn: () => BranchPersonApi.list(branchCode)
  });

  const [formState, setFormState] = useState<UpsertBranchPersonPayload>({
    branchCode,
    name: "",
    email: "",
    accountName: "",
    makeCodeId: undefined,
    processTypeId: undefined,
    photoUrl: "",
    isActive: true
  });

  useEffect(() => {
    setFormState({
      branchCode,
      name: "",
      email: "",
      accountName: "",
      makeCodeId: undefined,
      processTypeId: undefined,
      photoUrl: "",
      isActive: true
    });
  }, [branchCode]);

  const createMutation = useMutation({
    mutationFn: (payload: UpsertBranchPersonPayload) => BranchPersonApi.create(branchCode, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-people", branchCode] });
      setFormState({
        branchCode,
        name: "",
        email: "",
        accountName: "",
        makeCodeId: undefined,
        processTypeId: undefined,
        photoUrl: "",
        isActive: true
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpsertBranchPersonPayload) => BranchPersonApi.update(branchCode, payload.id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-people", branchCode] });
      setFormState({
        branchCode,
        name: "",
        email: "",
        accountName: "",
        makeCodeId: undefined,
        processTypeId: undefined,
        photoUrl: "",
        isActive: true
      });
    }
  });

  const activationMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      BranchPersonApi.changeActivation(branchCode, id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-people", branchCode] });
    }
  });

  const editing = useMemo(
    () => (formState.id ? peopleQuery.data?.find((item) => item.id === formState.id) ?? null : null),
    [formState.id, peopleQuery.data]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name) return;

    if (formState.id) {
      updateMutation.mutate(formState);
    } else {
      createMutation.mutate(formState);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-700">Personel</h3>
        <p className="text-xs text-slate-500">Şubeye bağlı personelleri marka ve işlem tipine göre yönetin.</p>
      </div>
      <div className="px-4 py-4 space-y-4">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <TextInput label="Ad Soyad" value={formState.name} onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))} maxLength={50} />
          <TextInput label="E-posta" value={formState.email ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, email: value }))} maxLength={50} />
          <TextInput label="Hesap Adı" value={formState.accountName ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, accountName: value }))} maxLength={50} />
          <SelectInput
            label="Marka"
            options={makesQuery.data?.map((option) => ({ id: option.id, name: option.name })) ?? []}
            value={formState.makeCodeId?.toString() ?? ""}
            onChange={(value) => setFormState((prev) => ({ ...prev, makeCodeId: value ? Number(value) : undefined }))}
            placeholder="Marka seçin"
          />
          <SelectInput
            label="İşlem Tipi"
            options={processTypesQuery.data ?? []}
            value={formState.processTypeId?.toString() ?? ""}
            onChange={(value) => setFormState((prev) => ({ ...prev, processTypeId: value ? Number(value) : undefined }))}
            placeholder="İşlem tipi seçin"
          />
          <TextInput label="Fotoğraf URL" value={formState.photoUrl ?? ""} onChange={(value) => setFormState((prev) => ({ ...prev, photoUrl: value }))} maxLength={250} />
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-600">Durum</label>
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(event) => setFormState((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
          </div>
          <button
            type="submit"
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {formState.id ? "Personeli Güncelle" : "Personel Ekle"}
          </button>
          {(createMutation.error || updateMutation.error) && (
            <p className="text-sm text-rose-600">Bir hata oluştu.</p>
          )}
        </form>
        <div className="space-y-2">
          {peopleQuery.isLoading && <p className="text-sm text-slate-500">Personeller yükleniyor...</p>}
          <ul className="space-y-2">
            {peopleQuery.data?.map((person) => (
              <li key={person.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-700">{person.name}</p>
                  <p className="text-xs text-slate-500">{person.email || "E-posta yok"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill active={person.isActive} />
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => setFormState({
                      branchCode,
                      id: person.id,
                      name: person.name,
                      email: person.email,
                      accountName: person.accountName,
                      makeCodeId: person.makeCodeId,
                      processTypeId: person.processTypeId,
                      photoUrl: person.photoUrl,
                      isActive: person.isActive
                    })}
                  >
                    Düzenle
                  </button>
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() =>
                      activationMutation.mutate({ id: person.id, isActive: !person.isActive })
                    }
                  >
                    {person.isActive ? "Pasif" : "Aktif"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {editing && (
          <button
            className="text-xs text-slate-500 underline"
            onClick={() =>
              setFormState({
                branchCode,
                name: "",
                email: "",
                accountName: "",
                makeCodeId: undefined,
                processTypeId: undefined,
                photoUrl: "",
                isActive: true
              })
            }
          >
            Yeni personel eklemeye dön
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
