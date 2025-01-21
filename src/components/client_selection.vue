<template>
  <div :class="cn('w-full', props.class)">
    <Popover v-model:open="open">
      <PopoverTrigger as-child class="w-full">
        <Button variant="outline" role="combobox" class="w-full justify-between">
          Client Selection
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-full p-0">
        <Command class="w-full">
          <CommandInput placeholder="Search customer..." />
          <CommandEmpty>
            <p class="p-2 text-sm text-muted-foreground">No customer found.</p>
            <Button variant="outline" class="w-full justify-start" @click="$emit('add-customer')">
              <UserPlus class="w-4 h-4 mr-2" />
              Add new customer
            </Button>
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="client in clients"
                :key="client.id"
                :value="client.name"
                @select="$emit('select', client)">
                <Check :class="cn('mr-2 h-4 w-4', selectedClientId === client.id ? 'opacity-100' : 'opacity-0')" />
                <div class="flex flex-col">
                  <span>{{ client.name }}</span>
                  <span class="text-sm text-muted-foreground">{{ client.email }}</span>
                  <span v-if="client.taxType !== 'none'" class="text-xs text-muted-foreground">
                    {{ client.taxType.toUpperCase() }}
                  </span>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="add-new">
                <UserPlus class="mr-2 h-4 w-4" />
                <Button variant="ghost" @click="openClientDialog">Add new customer</Button>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
  <!-- dialog -->
  <Dialog v-model:open="clientDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Client Selection</DialogTitle>
        <DialogDescription>Select a client</DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, type HTMLAttributes } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import type { Client } from "@/db/schema";
import { Check, UserPlus } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
const props = withDefaults(
  defineProps<{
    clients: Client[];
    selectedClientId?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    open: true,
    modelValue: "",
  }
);

defineEmits<{
  (e: "select", client: Client): void;
  (e: "add-customer"): void;
}>();

const clientDialog = ref(false);
const openClientDialog = () => {
  clientDialog.value = true;
};

const closeClientDialog = () => {
  clientDialog.value = false;
};
</script>

<style scoped></style>
