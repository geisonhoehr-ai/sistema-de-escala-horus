import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Unavailability } from '@/types'
import useDataStore from '@/stores/data.store'
import { toast } from './ui/use-toast'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const unavailabilitySchema = z
  .object({
    type: z.string().min(1, 'O tipo é obrigatório.'),
    startDate: z.date({ required_error: 'Data de início é obrigatória.' }),
    endDate: z.date({ required_error: 'Data de fim é obrigatória.' }),
    observations: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'A data final não pode ser anterior à data inicial.',
    path: ['endDate'],
  })

type UnavailabilityFormValues = z.infer<typeof unavailabilitySchema>

interface ManageUnavailabilityDialogProps {
  militaryId: string
  unavailability?: Unavailability
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ManageUnavailabilityDialog = ({
  militaryId,
  unavailability,
  isOpen,
  onOpenChange,
}: ManageUnavailabilityDialogProps) => {
  const { addUnavailability, updateUnavailability, unavailabilityTypes } =
    useDataStore()
  const isEditing = !!unavailability

  const form = useForm<UnavailabilityFormValues>({
    resolver: zodResolver(unavailabilitySchema),
    defaultValues: isEditing
      ? {
          ...unavailability,
          startDate: new Date(unavailability.startDate),
          endDate: new Date(unavailability.endDate),
        }
      : {
          type: 'Férias',
          startDate: new Date(),
          endDate: new Date(),
          observations: '',
        },
  })

  const onSubmit = (data: UnavailabilityFormValues) => {
    if (isEditing) {
      updateUnavailability({ id: unavailability.id, militaryId, ...data })
      toast({ title: 'Indisponibilidade Atualizada' })
    } else {
      addUnavailability({ militaryId, ...data })
      toast({ title: 'Indisponibilidade Adicionada' })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar' : 'Adicionar'} Indisponibilidade
          </DialogTitle>
          <DialogDescription>
            Gerencie os períodos de indisponibilidade do militar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unavailabilityTypes.map((typeDef) => (
                        <SelectItem key={typeDef.id} value={typeDef.name}>
                          {typeDef.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Fim</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
