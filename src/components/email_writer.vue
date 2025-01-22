<template>
  <Card class="p-6">
    <CardHeader>
      <CardTitle>Write Email</CardTitle>
      <CardDescription>Compose your email message</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-12 gap-4">
          <FormField v-slot="{ componentField }" name="email" class="col-span-12">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="recipient@example.com" v-bind="componentField" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="subject" class="col-span-12">
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Email subject" v-bind="componentField" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="content" class="col-span-12">
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
                <EditorContent :editor="editor" class="prose max-w-none p-4" v-bind="componentField" />
              </div>
            </div>
          </FormField>
        </div>
         
        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" @click="$emit('cancel')">Cancel</Button>
          <Button type="submit">Send Email</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LinkIcon } from 'lucide-vue-next';
import {toTypedSchema} from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from "vee-validate";

const emit = defineEmits(['send-email', 'cancel']);

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
});

const formSchema = toTypedSchema(
z.object({
  email: z.string().email(),
  subject: z.string(),
  content: z.string(),
})
)

// function onSubmit() {
//   emit('send-email', {
//     email: email.value,
//     subject: subject.value,
//     content: editor.value?.getHTML() || ''
//   });
// }

const form = useForm({
  validationSchema: formSchema
})

const onSubmit = form.handleSubmit((values) => {
  console.log(values)
})

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>