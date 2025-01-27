<template>
  <div>test</div>
  <Button @click="supabase.auth.signOut()">Log out</Button>
</template>

<script lang="ts" setup>
import { supabase } from "../supabase/index";
onMounted(async () => {
  const data = await supabase.from("profiles").select();
  console.log(data);
});
</script>

<style lang="scss" scoped></style>
