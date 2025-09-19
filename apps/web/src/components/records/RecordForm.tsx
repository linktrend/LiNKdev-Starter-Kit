'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { RecordType, RecordField, RecordFormData } from '@/types/records';
import { api } from '@/trpc/react';

interface RecordFormProps {
  recordType: RecordType;
  initialData?: RecordFormData;
  onSave?: (data: RecordFormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

// Generate Zod schema from record type fields
function generateZodSchema(fields: RecordField[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'textarea':
        fieldSchema = z.string();
        break;
      case 'number':
        fieldSchema = z.number();
        break;
      case 'boolean':
        fieldSchema = z.boolean();
        break;
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');
        break;
      case 'select':
        fieldSchema = z.string();
        break;
      default:
        fieldSchema = z.string();
    }
    
    if (field.required) {
      schemaFields[field.key] = fieldSchema;
    } else {
      schemaFields[field.key] = fieldSchema.optional();
    }
  });
  
  return z.object(schemaFields);
}

export function RecordForm({ 
  recordType, 
  initialData = {}, 
  onSave, 
  onCancel, 
  isEditing = false 
}: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const schema = generateZodSchema(recordType.config.fields);
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData as FormData,
  });

  const createRecordMutation = api.records.createRecord.useMutation({
    onSuccess: () => {
      toast({
        title: 'Record created',
        description: 'Record has been created successfully',
      });
      onSave?.(form.getValues());
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateRecordMutation = api.records.updateRecord.useMutation({
    onSuccess: () => {
      toast({
        title: 'Record updated',
        description: 'Record has been updated successfully',
      });
      onSave?.(form.getValues());
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Update existing record
        await updateRecordMutation.mutateAsync({
          id: initialData.id as string,
          data,
        });
      } else {
        // Create new record
        await createRecordMutation.mutateAsync({
          type_id: recordType.id,
          data,
        });
      }
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const renderField = (field: RecordField) => {
    const fieldValue = form.watch(field.key);
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            {...form.register(field.key)}
            placeholder={field.placeholder}
            type={field.type}
          />
        );
      
      case 'number':
        return (
          <Input
            {...form.register(field.key, { valueAsNumber: true })}
            type="number"
            placeholder={field.placeholder}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            {...form.register(field.key)}
            placeholder={field.placeholder}
            rows={4}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={fieldValue || false}
            onCheckedChange={(checked) => form.setValue(field.key, checked)}
          />
        );
      
      case 'date':
        return (
          <Input
            {...form.register(field.key)}
            type="date"
            placeholder={field.placeholder}
          />
        );
      
      case 'select':
        return (
          <Select
            value={fieldValue || ''}
            onValueChange={(value) => form.setValue(field.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            {...form.register(field.key)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit' : 'Create'} {recordType.display_name}
        </h2>
        {recordType.description && (
          <p className="text-muted-foreground mt-1">{recordType.description}</p>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {recordType.config.fields.map((field) => (
            <FormField
              key={field.key}
              control={form.control}
              name={field.key}
              render={({ field: formField, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    {renderField(field)}
                  </FormControl>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Record' : 'Create Record'}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
