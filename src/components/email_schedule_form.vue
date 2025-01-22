<template>
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>{{ sendNow === 'true' ? 'Send Now' : 'Schedule Email' }}</CardTitle>
      <CardDescription>{{ sendNow === 'true' ? 'Send the email now, invoice will be attached to email and downloaded to your device.' : 'Schedule Email for later' }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="mb-6">
        <ToggleGroup type="single" v-model="sendNow" class="justify-start">
          <ToggleGroupItem value="true" class="gap-2">
            <RocketIcon class="h-4 w-4" />
            Send Now
          </ToggleGroupItem>
          <ToggleGroupItem value="false" class="gap-2">
            <CalendarIcon class="h-4 w-4" />
            Schedule
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <form @submit="onSubmit" class="space-y-4">
       <div v-if="sendNow === 'false'" class="flex flex-col md:flex-row gap-4">
        <FormField v-slot="{ componentField }" name="sendDate">
          <FormItem class="w-full">
            <FormLabel>Send Date</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="frequency">
          <FormItem class="w-full">
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
       </div>

        <Separator v-if="sendNow === 'false'" class="my-4"/>

        <!-- email -->
        <FormField v-slot="{ componentField }" name="email" class="col-span-12">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="recipient@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="subject" class="col-span-12">
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Email subject" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ formItemId }" name="content" class="col-span-12">
            <div class="col-span-12">
              <FormLabel>Message</FormLabel>
              <div class="border rounded-md mt-2">
                <div class="border-b p-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="editor.chain().focus().toggleLink().run()"
                    :class="{ 'bg-muted': editor?.isActive('link') }"
                  >
                    <LinkIcon class="h-4 w-4" />
                  </Button>
                </div>
                <EditorContent :editor="editor" class="prose max-w-none h-[200px] p-4" :id="formItemId" />
              </div>
              <FormMessage />
            </div>
          </FormField>

        <div class="flex justify-end">
          <Button type="submit">{{ sendNow === 'true' ? 'Send Now' : 'Schedule Email' }}</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
// @ts-ignore
import { defineEmits, ref, inject, onBeforeUnmount, computed } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from "@vee-validate/zod";
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {Separator} from '../components/ui/separator';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { LinkIcon, RocketIcon, CalendarIcon } from 'lucide-vue-next';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline'
      }
    })
  ],
  content: '',
  onUpdate: ({ editor }) => {
    form.setFieldValue('content', editor.getHTML());
  },
});

const sendNow = ref('true');
const emit = defineEmits(['schedule-email']);

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email"),
    subject: z.string().min(1, "Subject is required"),
    content: z.string()
    .min(1, "Message is required")
    .refine(content => {
      const textContent = new DOMParser()
        .parseFromString(content, 'text/html')
        .body.textContent || '';
      return textContent.trim().length >= 10;
    }, "Message must be at least 10 characters")
  })
);

const addToSchema = computed(() => {
  console.log('Running')
  if (sendNow.value === 'true') {
    return formSchema;
  } else {
    return toTypedSchema(
      z.object({
        email: z.string({
          required_error: "Please enter an email"
        }).email("Please enter a valid email"),
        subject: z.string({
          required_error: "Please enter a subject"
        }).min(1, "Subject is required"),
        content: z.string({
          required_error: "Please enter a message, min 10 characters"
        })
          .min(1, "Message is required")
          .refine(content => {
            const textContent = new DOMParser()
              .parseFromString(content, 'text/html')
              .body.textContent || '';
            return textContent.trim().length >= 10;
          }, "Message must be at least 10 characters"),
        sendDate: z.string({
          required_error: "Please select a send date"
        }).date().refine((data) => {
          if (!data) {
            return true;
          }
          const sendDate = new Date(data) as Date;
          const dueDate = new Date(formData.value.dueDate) as Date;
          return sendDate <= dueDate;
        }, {
          message: "Send date must be before or equal to due date",
          path: ["sendDate"],
        }),
        frequency: z.enum(['once', 'weekly', 'monthly', 'quarterly', 'yearly'], {
          required_error: "Please select a frequency"
        })
      })
    );
  }
});

const form = useForm({
  validationSchema: addToSchema,
});

const onSubmit = form.handleSubmit((values) => {
  
    const formData = {
      ...values,
      content: editor.value?.getHTML() || '',
      isScheduled: sendNow.value === 'false'
    };
  if(sendNow.value === 'true'){
    if(!confirm('Are you sure you want to schedule this email?')){
      return 
    }
    window.toaster('Success', 'Email scheduled successfully')
  } else {
    if(!confirm('Are you sure you want to schedule this email?')){
      return
    }
    window.toaster('Success', 'Email scheduled successfully')
  }
  emit('schedule-email', formData);
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const formData = inject('invoiceForm');
</script>
