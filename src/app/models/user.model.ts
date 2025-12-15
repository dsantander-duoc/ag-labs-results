export interface User {
  userId: number;
  rut: string;
  username: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  active: boolean;
  comunaId: number;
  laboratoryId: number;
  roleIds: number[];
}

export interface RegisterDTO {
  rut: string;
  name: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  birthDate: string;
  address: string;
  comunaId: number;
  active: boolean;
  laboratoryId: number;
  roleIds: number[];
}
