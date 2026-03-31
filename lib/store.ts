// ============================================================================
// AVEX - Store Global con Zustand
// Manejo de estado centralizado
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppState,
  Service,
  ViewType,
  AdminTab,
  RiderName,
  BatterySale,
  BatteryPurchase,
  AppConfig,
  InventoryState,
  Warranty,
  AppUser,
} from "./types";
import { BATTERY_MODELS, RIDERS, RIDER_COLORS } from "./types";

// --- Estado inicial ---
const initialConfig: AppConfig = {
  preciosBase: BATTERY_MODELS.reduce((acc, model) => {
    acc[model] = 0;
    return acc;
  }, {} as Record<string, number>),
  recargos: { efectivo: 0, tarjeta1: 10, tarjeta3: 30 },
  comisionRider: 10000,
  adminPassword: "avex2024",
};

const initialState: AppState = {
  config: initialConfig,
  inventario: {},
  servicios: {},
  historiales: { ventas: [], compras: [] },
};

// --- Interfaz del Store ---
interface AvexStore extends AppState {
  // UI State
  currentView: ViewType;
  activeAdminTab: AdminTab;
  isDarkMode: boolean;
  isLoading: boolean;
  batteryModels: string[];

  // Auth
  isAuthenticated: boolean;
  currentUser: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: AppUser) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;

  // Actions - UI
  setView: (view: ViewType) => void;
  setAdminTab: (tab: AdminTab) => void;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;

  // Actions - Battery Models
  addBatteryModel: (name: string) => void;
  updateBatteryModel: (oldName: string, newName: string) => void;
  deleteBatteryModel: (name: string) => void;

  // Actions - Servicios
  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Actions - Inventario
  updateInventory: (inventory: InventoryState) => void;
  addBatteryStock: (
    modelo: string,
    cantidad: number,
    costo: number,
    loteId?: string | number
  ) => void;
  decrementBatteryStock: (modelo: string) => { id: string | number; costo: number } | null;

  // Actions - Historiales
  addSale: (sale: BatterySale) => void;
  updateSale: (index: number, updates: Partial<BatterySale>) => void;
  updateBatterySaleById: (id: string, updates: Partial<BatterySale>) => void;
  deleteSale: (index: number) => void;
  addPurchase: (purchase: BatteryPurchase) => void;
  updatePurchase: (index: number, updates: Partial<BatteryPurchase>) => void;
  deletePurchase: (index: number) => void;

  // Actions - Configuración
  updateConfig: (config: Partial<AppConfig>) => void;
  updatePrices: (prices: Record<string, number>) => void;
  updateSurcharges: (surcharges: { tarjeta1: number; tarjeta3: number }) => void;

  // Garantías
  garantias: Warranty[];
  addWarranty: (warranty: Warranty) => void;
  updateWarranty: (id: string, updates: Partial<Warranty>) => void;
  deleteWarranty: (id: string) => void;

  // Riders
  riders: string[];
  riderColors: Record<string, string>;
  addRider: (name: string, color: string) => void;
  updateRider: (oldName: string, newName: string, color: string) => void;
  deleteRider: (name: string) => void;

  // Actions - Bulk
  setFullState: (state: Partial<AppState>) => void;
  reset: () => void;
  initializeMockData: () => void;
}

// --- Store ---
export const useAvexStore = create<AvexStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      ...initialState,
      currentView: "admin",
      activeAdminTab: "servicios",
      isDarkMode: false,
      isLoading: true,
      isAuthenticated: false,
      currentUser: null,
      users: [
        {
          id: "user-1",
          email: "agustintravieso@gmail.com",
          password: "admin123",
          name: "Agustín",
          role: "admin",
        },
        {
          id: "user-2",
          email: "rodrigoparodi@avex.com",
          password: "admin",
          name: "Rodrigo",
          role: "admin",
        },
        {
          id: "user-3",
          email: "joaquinmenendez@avex.com",
          password: "admin",
          name: "Joaquin",
          role: "admin",
        },
      ] as AppUser[],
      batteryModels: [...BATTERY_MODELS],
      garantias: [],
      riders: [...RIDERS],
      riderColors: { ...RIDER_COLORS },

      // UI Actions
      setView: (view) => set({ currentView: view }),
      setAdminTab: (tab) => set({ activeAdminTab: tab }),
      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", newMode);
        }
      },
      setLoading: (loading) => set({ isLoading: loading }),

      // Auth Actions
      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (user) {
          set({ isAuthenticated: true, currentUser: user });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false, currentUser: null }),

      // User CRUD
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
          // also update currentUser if it's the one being edited
          currentUser:
            state.currentUser?.id === id
              ? { ...state.currentUser, ...updates }
              : state.currentUser,
        })),

      deleteUser: (id) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== id) })),

      // Garantías Actions
      addWarranty: (warranty) =>
        set((state) => ({ garantias: [...state.garantias, warranty] })),

      updateWarranty: (id, updates) =>
        set((state) => ({
          garantias: state.garantias.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteWarranty: (id) =>
        set((state) => ({ garantias: state.garantias.filter((g) => g.id !== id) })),

      // Riders Actions
      addRider: (name, color) =>
        set((state) => ({
          riders: [...state.riders, name],
          riderColors: { ...state.riderColors, [name]: color },
        })),

      updateRider: (oldName, newName, color) =>
        set((state) => {
          const riders = state.riders.map((r) => (r === oldName ? newName : r));
          const riderColors = { ...state.riderColors };
          riderColors[newName] = color;
          if (oldName !== newName) delete riderColors[oldName];
          return { riders, riderColors };
        }),

      deleteRider: (name) =>
        set((state) => {
          const riderColors = { ...state.riderColors };
          delete riderColors[name];
          return {
            riders: state.riders.filter((r) => r !== name),
            riderColors,
          };
        }),

      // Battery Models Actions
      addBatteryModel: (name) =>
        set((state) => ({
          batteryModels: [...state.batteryModels, name],
          config: {
            ...state.config,
            preciosBase: { ...state.config.preciosBase, [name]: 0 },
          },
        })),

      updateBatteryModel: (oldName, newName) =>
        set((state) => {
          const models = state.batteryModels.map((m) => (m === oldName ? newName : m));
          const preciosBase = { ...state.config.preciosBase };
          preciosBase[newName] = preciosBase[oldName] ?? 0;
          delete preciosBase[oldName];
          return {
            batteryModels: models,
            config: { ...state.config, preciosBase },
          };
        }),

      deleteBatteryModel: (name) =>
        set((state) => {
          const preciosBase = { ...state.config.preciosBase };
          delete preciosBase[name];
          return {
            batteryModels: state.batteryModels.filter((m) => m !== name),
            config: { ...state.config, preciosBase },
          };
        }),

      // Servicios Actions
      addService: (service) =>
        set((state) => ({
          servicios: { ...state.servicios, [service.id]: service },
        })),

      updateService: (id, updates) =>
        set((state) => ({
          servicios: {
            ...state.servicios,
            [id]: { ...state.servicios[id], ...updates },
          },
        })),

      deleteService: (id) =>
        set((state) => {
          const newServicios = { ...state.servicios };
          delete newServicios[id];
          return { servicios: newServicios };
        }),

      // Inventario Actions
      updateInventory: (inventory) => set({ inventario: inventory }),

      addBatteryStock: (modelo, cantidad, costo, loteId) =>
        set((state) => {
          const inv = { ...state.inventario };
          if (!inv[modelo]) {
            inv[modelo] = { loteCounter: 1, lotes: [] };
          }
          const bat = inv[modelo];
          const newLoteId = loteId ?? bat.loteCounter;
          bat.lotes.push({ id: newLoteId, cantidad, costo });
          if (!loteId) bat.loteCounter++;
          return { inventario: inv };
        }),

      decrementBatteryStock: (modelo) => {
        const state = get();
        const inv = { ...state.inventario };
        const bat = inv[modelo];

        if (!bat || !bat.lotes || bat.lotes.length === 0) {
          return null;
        }

        const lote = bat.lotes[0];
        const result = { id: lote.id, costo: lote.costo };

        lote.cantidad -= 1;
        if (lote.cantidad === 0) {
          bat.lotes.shift();
        }

        set({ inventario: inv });
        return result;
      },

      // Historiales Actions
      addSale: (sale) =>
        set((state) => ({
          historiales: {
            ...state.historiales,
            ventas: [...state.historiales.ventas, sale],
          },
        })),

      updateSale: (index, updates) =>
        set((state) => {
          const ventas = [...state.historiales.ventas];
          ventas[index] = { ...ventas[index], ...updates };
          return { historiales: { ...state.historiales, ventas } };
        }),

      updateBatterySaleById: (id, updates) =>
        set((state) => ({
          historiales: {
            ...state.historiales,
            ventas: state.historiales.ventas.map((v) =>
              v.id === id ? { ...v, ...updates } : v
            ),
          },
        })),

      deleteSale: (index) =>
        set((state) => {
          const ventas = state.historiales.ventas.filter((_, i) => i !== index);
          return { historiales: { ...state.historiales, ventas } };
        }),

      addPurchase: (purchase) =>
        set((state) => ({
          historiales: {
            ...state.historiales,
            compras: [...state.historiales.compras, purchase],
          },
        })),

      updatePurchase: (index, updates) =>
        set((state) => {
          const compras = [...state.historiales.compras];
          compras[index] = { ...compras[index], ...updates };
          return { historiales: { ...state.historiales, compras } };
        }),

      deletePurchase: (index) =>
        set((state) => {
          const compras = state.historiales.compras.filter((_, i) => i !== index);
          return { historiales: { ...state.historiales, compras } };
        }),

      // Config Actions
      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),

      updatePrices: (prices) =>
        set((state) => ({
          config: {
            ...state.config,
            preciosBase: { ...state.config.preciosBase, ...prices },
          },
        })),

      updateSurcharges: (surcharges) =>
        set((state) => ({
          config: {
            ...state.config,
            recargos: { ...state.config.recargos, ...surcharges },
          },
        })),

      // Bulk Actions
      setFullState: (newState) =>
        set((state) => ({
          ...state,
          ...newState,
        })),

reset: () => set(initialState),

  // Initialize mock data for development
  initializeMockData: () => {
    const state = get();
    // Only initialize if no services exist
    if (Object.keys(state.servicios).length === 0) {
      const mockServices: Record<string, Service> = {
        "svc-1": {
          id: "svc-1",
          orden: 1,
          cliente: "Juan Perez",
          telefono: "1155667788",
          direccion: "Av. Corrientes 1234, CABA",
          marca: "Toyota",
          modelo: "Corolla",
          patente: "ABC123",
          aseguradora: "La Caja",
          rider: "Nicolas",
          tipoServicio: "Bateria",
          estado: "Pendiente",
          cobro: "Pendiente",
          monto: 15000,
          fechaVisual: "18/03/2026",
          fechaInput: "2026-03-18",
          tiempos: { creado: "09:30" },
          obs: "Cliente espera en la puerta",
        },
        "svc-2": {
          id: "svc-2",
          orden: 2,
          cliente: "Maria Garcia",
          telefono: "1144332211",
          direccion: "Av. Santa Fe 2500, CABA",
          marca: "Ford",
          modelo: "Focus",
          patente: "DEF456",
          aseguradora: "Avex",
          rider: "Santiago",
          tipoServicio: "Auxilio",
          estado: "En camino",
          cobro: "Pendiente",
          monto: 8000,
          fechaVisual: "18/03/2026",
          fechaInput: "2026-03-18",
          tiempos: { creado: "10:00", camino: "10:15" },
          obs: "",
        },
      };
      set({ servicios: mockServices });
    }

    // Initialize inventory if empty
    if (Object.keys(state.inventario).length === 0) {
      const mockInventory: InventoryState = {
        "12x75": { loteCounter: 3, lotes: [{ id: 1, cantidad: 5, costo: 45000 }, { id: 2, cantidad: 3, costo: 47000 }] },
        "12x65": { loteCounter: 2, lotes: [{ id: 1, cantidad: 8, costo: 38000 }] },
        "12x45": { loteCounter: 1, lotes: [] },
      };
      set({ inventario: mockInventory });
    }
  },
  }),
  {
  name: "avex-storage",
      partialize: (state) => ({
        config: state.config,
        inventario: state.inventario,
        servicios: state.servicios,
        historiales: state.historiales,
        isDarkMode: state.isDarkMode,
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        users: state.users,
        batteryModels: state.batteryModels,
        garantias: state.garantias,
        riders: state.riders,
        riderColors: state.riderColors,
      }),
    }
  )
);

// --- Selectores ---
export const selectActiveServices = (state: AvexStore) =>
  Object.values(state.servicios).filter(
    (s) => s.estado !== "Finalizado" && s.estado !== "Cancelado" && s.estado !== "Programado"
  );

export const selectScheduledServices = (state: AvexStore) =>
  Object.values(state.servicios).filter((s) => s.estado === "Programado");

export const selectCompletedServices = (state: AvexStore) =>
  Object.values(state.servicios).filter(
    (s) => s.estado === "Finalizado" || s.estado === "Cancelado"
  );

export const selectRiderServices = (state: AvexStore, rider: RiderName) =>
  Object.values(state.servicios).filter((s) => s.rider === rider);

export const selectTotalStock = (state: AvexStore, modelo: string) => {
  const bat = state.inventario[modelo];
  if (!bat || !bat.lotes) return 0;
  return bat.lotes.reduce((sum, lote) => sum + lote.cantidad, 0);
};
