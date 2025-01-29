import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../supabase/index";
import { Tables } from "database.types";

export const useAuthStore = defineStore("auth-store", () => {
  const user = ref<null | User>(null);
  const profile = ref<null | Tables<"profiles">>(null);
  const business = ref<null | Tables<"business_profiles">>(null);
  const isTrackingAuthChanges = ref(false);

  const setProfile = async () => {
    if (!user.value) {
      profile.value = null;
      return;
    }

    if (!profile.value || profile.value.id !== user.value.id) {
      const { data } = await supabase.from("profiles").select().eq("id", user.value.id).single();

      profile.value = data || null;
    }
  };

  const setAuth = async (userSession: null | Session = null) => {
    if (!userSession) {
      user.value = null;
      profile.value = null;
      return;
    }

    user.value = userSession.user;
    await setProfile();
    await fetchBusiness();
  };

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) await setAuth(data.session);
  };

  const trackAuthChanges = () => {
    if (isTrackingAuthChanges.value) return;

    isTrackingAuthChanges.value = true;
    supabase.auth.onAuthStateChange((_, session) => {
      setTimeout(async () => {
        await setAuth(session);
      }, 0);
    });
  };

  const fetchBusiness = async () => {
    if (!user.value) {
      business.value = null;
      return;
    }

    const { data } = await supabase.from("business_profiles").select().eq("profile_id", user.value.id);
    business.value = data || null;
  };

  return {
    user,
    profile,
    setAuth,
    getSession,
    trackAuthChanges,
    business,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
