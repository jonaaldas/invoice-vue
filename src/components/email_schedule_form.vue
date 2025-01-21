<template>
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Schedule Email</CardTitle>
      <CardDescription>Set up when to send this invoice</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="sendDate">
          <FormItem>
            <FormLabel>Send Date</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="frequency">
          <FormItem>
            <FormLabel>Frequency</FormLabel>
            <Select v-bind="componentField">
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="flex justify-end">
          <Button type="submit">Schedule</Button>
        </div>
      </form>
      <Input type="date" v-model="date" />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
// @ts-ignore
import { defineEmits, ref, inject } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from "@vee-validate/zod";
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const date = ref('')

const emit = defineEmits(['schedule-email']);

const formSchema = toTypedSchema(
  z.object({
    sendDate: z.string({
      required_error: "Please select a send date",
    }).date(),
    frequency: z.enum(['once', 'weekly', 'monthly', 'quarterly', 'yearly'], {
      required_error: "Please select a frequency",
    }),
  }).refine((data) => {
    const sendDate = new Date(data.sendDate);
    const dueDate = new Date(formData.value.dueDate) as Date;
    return sendDate <= dueDate;
  }, {
    message: "Send date must be before or equal to due date",
    path: ["sendDate"],
  })
)

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit((values) => {
  console.log("🚀 ~ onSubmit ~ values:", values)
  emit('schedule-email', values);
});

const formData = inject('invoiceForm');
</script>
