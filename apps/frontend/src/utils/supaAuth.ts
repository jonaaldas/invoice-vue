import { supabase } from "../supabase";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginForm {
  email: string;
  password: string;
}

export const register = async (formData: RegisterForm) => {
  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        is_paid: false,
        email: formData.email,
      },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) return console.log(error);

  return true;
};

export const login = async (formData: LoginForm) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) return console.log(error);

  return true;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) return console.log(error);

  return true;
};
