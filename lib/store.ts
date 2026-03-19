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
} from "./types";
import { BATTERY_MODELS } from "./types";

// --- Estado inicial ---
const initialConfig: AppConfig = {
  preciosBase: BATTERY_MODELS.reduce((acc, model) => {
    acc[model] = 0;
    return acc;
  }, {} as Record<string, number>),
  recargos: { efectivo: 0, tarjeta1: 10, tarjeta3: 30 },
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

  // Actions - UI
  setView: (view: ViewType) => void;
  setAdminTab: (tab: AdminTab) => void;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;

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
  deleteSale: (index: number) => void;
  addPurchase: (purchase: BatteryPurchase) => void;
  updatePurchase: (index: number, updates: Partial<BatteryPurchase>) => void;
  deletePurchase: (index: number) => void;

  // Actions - Configuración
  updateConfig: (config: Partial<AppConfig>) => void;
  updatePrices: (prices: Record<string, number>) => void;
  updateSurcharges: (surcharges: { tarjeta1: number; tarjeta3: number }) => void;

  // Actions - Bulk
  setFullState: (state: Partial<AppState>) => void;
  reset: () => void;
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
    }),
    {
      name: "avex-storage",
      partialize: (state) => ({
        config: state.config,
        inventario: state.inventario,
        servicios: state.servicios,
        historiales: state.historiales,
        isDarkMode: state.isDarkMode,
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
