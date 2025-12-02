import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scale } from '@/types'
import useDataStore from '@/stores/data.store'
import { toast } from './ui/use-toast'
import { ScrollArea } from './ui/scroll-area'

const scaleSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  description: z.string().optional(),
  associatedMilitaryIds: z.array(z.string()),
})

type ScaleFormValues = z.infer<typeof scaleSchema>

interface ManageScaleDialogProps {
  scale?: Scale
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ManageScaleDialog = ({
  scale,
  isOpen,
  onOpenChange,
}: ManageScaleDialogProps) => {
  const { addScale, updateScale, military } = useDataStore()
  const isEditing = !!scale

  const form = useForm<ScaleFormValues>({
    resolver: zodResolver(scaleSchema),
    defaultValues: {
      name: '',
      description: '',
      associatedMilitaryIds: [],
    },
  })

  useEffect(() => {
    if (scale) {
      form.reset({
        name: scale.name,
        description: scale.description,
        associatedMilitaryIds: scale.associatedMilitaryIds,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        associatedMilitaryIds: [],
      })
    }
  }, [scale, form, isOpen])

  const onSubmit = (data: ScaleFormValues) => {
    if (isEditing && scale) {
      updateScale({ id: scale.id, ...data })
      toast({
        title: 'Escala Atualizada',
        description: `A escala "${data.name}" foi atualizada com sucesso.`,
      })
    } else {
      addScale({
        ...data,
        associatedMilitaryIds: data.associatedMilitaryIds,
      })
      toast({
        title: 'Escala Criada',
        description: `A escala "${data.name}" foi criada com sucesso.`,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Criar'} Escala</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere as informações da escala.'
              : 'Preencha os dados para criar uma nova escala.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Escala</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Escala de Guarda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada da escala"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="associatedMilitaryIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Militares Associados
                    </FormLabel>
                    <FormDescription>
                      Selecione os militares que participarão desta escala.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-[200px] border rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {military.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="associatedMilitaryIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id,
                                            ),
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.rank} {item.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
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
              <Button type="submit">
                {isEditing ? 'Salvar Alterações' : 'Criar Escala'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
