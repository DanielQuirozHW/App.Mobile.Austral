// Valores internos de roles y funciones. Fuente: Portal-Austral-Dev
//   src/nombramientos/domain/enums.ts (RolNombramientos)
//   src/promocion/domain/enums.ts (RolPromocion)

export enum RolNombramientos {
  SA = 'SA',
  AdSA = 'AdSA',
  VRAA = 'VRAA',
  AdVRAA = 'AdVRAA',
  Docente = 'docente',
}

export enum RolPromocion {
  SA = 'SA',
  AdSA = 'AdSA',
  VRAA = 'VRAA',
  AdVRAA = 'AdVRAA',
  ReferenteMathu = 'ReferenteMathu',
  Docente = 'docente',
}

/** Puesto del usuario (se guarda en Firestore): 'docente', 'codocente' o '' (sin puesto). */
export type Puesto = 'docente' | 'codocente' | '';
