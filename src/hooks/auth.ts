import axios from "axios";

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user/signin`,
      { email, password }
    );

    if (response.data?.user?.corporate_booking === 0) {
      throw new Error("This email is not registered as a corporate booking email.");
    }

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error: any) {
    let message =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      "Login failed. Please try again.";

    throw new Error(message);
  }
};


export const register = async (values: object) => {
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/register`,
    values
  );
  localStorage.setItem("token", data.token);
  return data;
};

export const logout = async () => {
  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  localStorage.removeItem("token");
  return null;
};

export const loginBack = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return { user: data, token };
};
