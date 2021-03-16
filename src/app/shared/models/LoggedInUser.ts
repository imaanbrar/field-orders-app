export class LoggedInUser {
  id: number;
  username: string;
  isExternal: boolean;
  fullName: string;
  phone: string;
  email: string;
  cell: string;
  companyNumber: string;
  companyName: string;
  roles: number[] = [];
}
