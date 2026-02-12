export type Client = {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  country: string;
  city: string;
  notes: string;
  profileImage: string;
  last_login: string;

}

export type CorporateAdmin = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  profile_image: string;
  kyb: 0 | 1;
};

export type ClientUser = {
  id: number;
  clientId: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  country: string;
  city: string;
  notes: string;
  profileImage: string;
  role?: string;
}

export type Job = {
  id: number;
  client_name: string | null;
  job_title: string;
  notes: string;
  on_site_date: string;
  on_site_time: string;
  status: string;
  due_on: string;
  clientId: number | null;
  created_at: string;
  updated_at: string;
}
